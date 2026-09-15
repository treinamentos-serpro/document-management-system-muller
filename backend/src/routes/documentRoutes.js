const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');
const express = require('express');
const multer = require('multer');
const DocumentRepository = require('../repositories/documentRepository');
const DocumentService = require('../services/documentService');
const DocumentController = require('../controllers/documentController');

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
  const router = express.Router();

  router.post('/upload', upload.single('file'), documentController.upload);
  router.get('/documents', documentController.list);
  router.get('/documents/:id/download', documentController.download);

  return router;
}

module.exports = createDocumentRouter;