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

    const document = this.documentService.createDocument(req.file, owner);
    return res.status(201).json(this.documentService.toResponse(document));
  };

  list = (req, res) => {
    const owner = req.query.owner?.trim();
    const documents = this.documentService
      .listDocuments(owner)
      .map((document) => this.documentService.toResponse(document));

    return res.json(documents);
  };

  download = (req, res) => {
    const document = this.documentService.getDocument(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Documento nao encontrado.' });
    }

    const filePath = this.documentService.getDocumentFilePath(document);
    return res.download(filePath, document.originalName, (error) => {
      if (error && !res.headersSent) {
        res.status(500).json({ error: 'Nao foi possivel baixar o documento.' });
      }
    });
  };
}

module.exports = DocumentController;