const { randomUUID } = require('crypto');

// Constroi a entidade de documento a partir do arquivo recebido pelo multer.
function buildDocumentFromUpload(file, owner) {
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

module.exports = { buildDocumentFromUpload };
