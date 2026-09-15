import DownloadButton from './DownloadButton.jsx';

function formatSize(size) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'unit',
    unit: 'byte',
    unitDisplay: 'short',
  }).format(size);
}

function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date));
}

export default function DocumentList({ documents, isLoading, onDownload }) {
  if (isLoading) {
    return <p className="empty-state">Carregando documentos...</p>;
  }

  if (!documents.length) {
    return <p className="empty-state">Nenhum documento encontrado.</p>;
  }

  return (
    <div className="document-table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Documento</th>
            <th>Proprietario</th>
            <th>Enviado em</th>
            <th>Tamanho</th>
            <th><span className="visually-hidden">Acoes</span></th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => (
            <tr key={document.id}>
              <td>{document.originalName}</td>
              <td>{document.owner}</td>
              <td>{formatDate(document.uploadedAt)}</td>
              <td>{formatSize(document.size)}</td>
              <td><DownloadButton document={document} onDownload={onDownload} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}