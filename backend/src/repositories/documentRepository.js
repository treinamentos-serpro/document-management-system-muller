const path = require('path');

class DocumentRepository {
  constructor(storageDirectory) {
    this.storageDirectory = storageDirectory;
    this.documents = new Map();
  }

  save(document) {
    this.documents.set(document.id, document);
    return document;
  }

  findAll(owner) {
    const documents = [...this.documents.values()];

    return owner
      ? documents.filter((document) => document.owner === owner)
      : documents;
  }

  findById(id) {
    return this.documents.get(id) || null;
  }

  getFilePath(document) {
    return path.join(this.storageDirectory, document.storedName);
  }
}

module.exports = DocumentRepository;