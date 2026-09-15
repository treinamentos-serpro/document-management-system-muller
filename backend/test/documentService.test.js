const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');

const DocumentService = require('../src/services/documentService');

function createDocumentRepositoryDouble() {
  const documents = new Map();

  return {
    save(document) {
      documents.set(document.id, document);
      return document;
    },
    findAll(owner) {
      const storedDocuments = [...documents.values()];
      return owner
        ? storedDocuments.filter((document) => document.owner === owner)
        : storedDocuments;
    },
    findById(id) {
      return documents.get(id) || null;
    },
    getFilePath(document) {
      return path.join('/tmp/dms-storage', document.storedName);
    },
  };
}

test('uploadDocument retorna apenas metadados publicos', () => {
  const documentService = new DocumentService(createDocumentRepositoryDouble());

  const document = documentService.uploadDocument({
    originalname: 'nota.txt',
    filename: 'arquivo-interno.txt',
    mimetype: 'text/plain',
    size: 21,
  }, 'usuario-1');

  assert.strictEqual(document.originalName, 'nota.txt');
  assert.strictEqual(document.owner, 'usuario-1');
  assert.strictEqual(document.size, 21);
  assert.ok(document.id);
  assert.ok(document.uploadedAt);
  assert.strictEqual(document.storedName, undefined);
  assert.strictEqual(document.mimeType, undefined);
});

test('getDocumentDownload retorna dados de download quando o documento existe', () => {
  const documentService = new DocumentService(createDocumentRepositoryDouble());
  const createdDocument = documentService.createDocument({
    originalname: 'nota.txt',
    filename: 'arquivo-interno.txt',
    mimetype: 'text/plain',
    size: 21,
  }, 'usuario-1');

  const documentDownload = documentService.getDocumentDownload(createdDocument.id);

  assert.deepStrictEqual(documentDownload, {
    filePath: path.join('/tmp/dms-storage', 'arquivo-interno.txt'),
    originalName: 'nota.txt',
  });
});
