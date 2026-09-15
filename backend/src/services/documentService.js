const { buildDocumentFromUpload } = require('./documentFactory');
const { toPublicDocument } = require('./documentPresenter');

class DocumentService {
  constructor(documentRepository) {
    this.documentRepository = documentRepository;
  }

  createDocument(file, owner) {
    const document = buildDocumentFromUpload(file, owner);
    const savedDocument = this.documentRepository.save(document);
    return toPublicDocument(savedDocument);
  }

  listDocuments(owner) {
    return this.documentRepository.findAll(owner).map(toPublicDocument);
  }

  getDocument(id) {
    return this.documentRepository.findById(id);
  }

  getDocumentFilePath(document) {
    return this.documentRepository.getFilePath(document);
  }
}

module.exports = DocumentService;