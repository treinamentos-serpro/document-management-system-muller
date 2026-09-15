const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');
const express = require('express');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const DocumentRepository = require('../repositories/documentRepository');
const DocumentService = require('../services/documentService');
const DocumentController = require('../controllers/documentController');

function readPositiveInteger(value, fallbackValue) {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallbackValue;
}

function createDownloadRateLimit(documentService) {
  const windowMs = readPositiveInteger(process.env.DOWNLOAD_RATE_LIMIT_WINDOW_MS, 60_000);
  const maxRequests = readPositiveInteger(process.env.DOWNLOAD_RATE_LIMIT_MAX_REQUESTS, 30);

  return rateLimit({
    windowMs,
    limit: maxRequests,
    legacyHeaders: false,
    standardHeaders: 'draft-8',
    message: { error: 'Muitas requisicoes. Tente novamente em instantes.' },
    skip: (req) => !documentService.getDocument(req.params.id),
  });
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
  const limitDownloadRequests = createDownloadRateLimit(documentService);
  const router = express.Router();

  router.post('/upload', upload.single('file'), documentController.upload);
  router.get('/documents', documentController.list);
  router.get('/documents/:id/download', limitDownloadRequests, documentController.download);

  return router;
}

module.exports = createDocumentRouter;