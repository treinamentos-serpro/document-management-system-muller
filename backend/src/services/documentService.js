const { randomUUID } = require('crypto');

function createDocumentRecord(file, owner) {
  return {
    id: randomUUID(),
    originalName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
  };
}

function createDocumentResponse(document) {
  const { storedName, mimeType, ...metadata } = document;
  return metadata;
}

class DocumentService {
  constructor(documentRepository) {
    this.documentRepository = documentRepository;
  }

  uploadDocument(file, owner) {
    const document = this.createDocument(file, owner);
    return this.toResponse(document);
  }

  createDocument(file, owner) {
    return this.documentRepository.save(createDocumentRecord(file, owner));
  }

  listDocuments(owner) {
    return this.documentRepository.findAll(owner);
  }

  listDocumentMetadata(owner) {
    return this.listDocuments(owner).map((document) => this.toResponse(document));
  }

  getDocument(id) {
    return this.documentRepository.findById(id);
  }

  getDocumentDownload(id) {
    const document = this.getDocument(id);
    if (!document) {
      return null;
    }

    return {
      filePath: this.getDocumentFilePath(document),
      originalName: document.originalName,
    };
  }

  getDocumentFilePath(document) {
    return this.documentRepository.getFilePath(document);
  }

  toResponse(document) {
    return createDocumentResponse(document);
  }
}

module.exports = DocumentService;