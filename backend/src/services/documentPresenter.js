// Remove campos internos (nome no filesystem, mimetype) da resposta publica.
function toPublicDocument(document) {
  const { storedName, mimeType, ...publicFields } = document;
  return publicFields;
}

module.exports = { toPublicDocument };
