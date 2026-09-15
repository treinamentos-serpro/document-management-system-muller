const { randomUUID } = require('crypto');

class DocumentService {
  constructor(documentRepository) {
    this.documentRepository = documentRepository;
  }

  createDocument(file, owner) {
    const document = {
      id: randomUUID(),
      originalName: file.originalname,
      storedName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      owner,
    };

    return this.documentRepository.save(document);
  }

  listDocuments(owner) {
    return this.documentRepository.findAll(owner);
  }

  getDocument(id) {
    return this.documentRepository.findById(id);
  }

  getDocumentFilePath(document) {
    return this.documentRepository.getFilePath(document);
  }

  toResponse(document) {
    const { storedName, mimeType, ...metadata } = document;
    return metadata;
  }
}

module.exports = DocumentService;