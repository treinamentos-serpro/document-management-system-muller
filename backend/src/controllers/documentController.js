class DocumentController {
  constructor(documentService) {
    this.documentService = documentService;
  }

  upload = (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'O arquivo e obrigatorio.' });
    }

    const owner = req.body.owner?.trim();
    if (!owner) {
      return res.status(400).json({ error: 'O proprietario e obrigatorio.' });
    }

    const document = this.documentService.uploadDocument(req.file, owner);
    return res.status(201).json(document);
  };

  list = (req, res) => {
    const owner = req.query.owner?.trim();
    const documents = this.documentService.listDocumentMetadata(owner);

    return res.json(documents);
  };

  download = (req, res) => {
    const documentDownload = req.documentDownload || this.documentService.getDocumentDownload(req.params.id);
    if (!documentDownload) {
      return res.status(404).json({ error: 'Documento nao encontrado.' });
    }

    return res.download(documentDownload.filePath, documentDownload.originalName, (error) => {
      if (error && !res.headersSent) {
        res.status(500).json({ error: 'Nao foi possivel baixar o documento.' });
      }
    });
  };
}

module.exports = DocumentController;