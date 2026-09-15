const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');
const express = require('express');
const multer = require('multer');
const DocumentRepository = require('../repositories/documentRepository');
const DocumentService = require('../services/documentService');
const DocumentController = require('../controllers/documentController');

function readPositiveInteger(value, fallbackValue) {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallbackValue;
}

function createDownloadRateLimitMiddleware() {
  const windowMs = readPositiveInteger(process.env.DOWNLOAD_RATE_LIMIT_WINDOW_MS, 60_000);
  const maxRequests = readPositiveInteger(process.env.DOWNLOAD_RATE_LIMIT_MAX_REQUESTS, 30);
  const requestsByIp = new Map();

  function pruneExpiredEntries(now) {
    for (const [ip, requestState] of requestsByIp.entries()) {
      if (now >= requestState.resetAt) {
        requestsByIp.delete(ip);
      }
    }
  }

  return (req, res, next) => {
    const now = Date.now();
    const requesterIp = req.ip || req.socket?.remoteAddress || 'unknown';

    pruneExpiredEntries(now);

    const currentRequestState = requestsByIp.get(requesterIp);

    if (!currentRequestState) {
      requestsByIp.set(requesterIp, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (currentRequestState.count >= maxRequests) {
      const retryAfterSeconds = Math.max(1, Math.ceil((currentRequestState.resetAt - now) / 1000));
      res.set('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({ error: 'Muitas requisicoes. Tente novamente em instantes.' });
    }

    currentRequestState.count += 1;
    return next();
  };
}

function createDocumentRouter(storageDirectory) {
  fs.mkdirSync(storageDirectory, { recursive: true });

  const storage = multer.diskStorage({
    destination: storageDirectory,
    filename: (req, file, callback) => {
      callback(null, `${randomUUID()}${path.extname(file.originalname)}`);
    },
  });
  const upload = multer({ storage });
  const documentService = new DocumentService(new DocumentRepository(storageDirectory));
  const documentController = new DocumentController(documentService);
  const limitDownloadRequests = createDownloadRateLimitMiddleware();
  const router = express.Router();

  router.post('/upload', upload.single('file'), documentController.upload);
  router.get('/documents', documentController.list);
  router.get('/documents/:id/download', limitDownloadRequests, documentController.download);

  return router;
}

module.exports = createDocumentRouter;