import DownloadButton from './DownloadButton.jsx';

function formatFileSize(size) {
  if (size < 1024) {
    return `${size} B`;
  }

  return `${(size / 1024).toFixed(1)} KB`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function DocumentList({ documents, isLoading, onDownload }) {
  if (isLoading) {
    return <p className="empty-state">Carregando documentos...</p>;
  }

  if (documents.length === 0) {
    return <p className="empty-state">Nenhum documento encontrado.</p>;
  }

  return (
    <div className="document-table-wrapper">
      <table>
        <thead>
          <tr>
            <th scope="col">Nome</th>
            <th scope="col">Proprietario</th>
            <th scope="col">Tamanho</th>
            <th scope="col">Enviado em</th>
            <th scope="col"><span className="visually-hidden">Acoes</span></th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => (
            <tr key={document.id}>
              <td>{document.originalName}</td>
              <td>{document.owner}</td>
              <td>{formatFileSize(document.size)}</td>
              <td>{formatDate(document.uploadedAt)}</td>
              <td><DownloadButton document={document} onDownload={onDownload} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}