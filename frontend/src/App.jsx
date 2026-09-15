import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList.jsx';
import UploadComponent from './components/UploadComponent.jsx';
import { downloadDocument, listDocuments, uploadDocument } from './services/documentApi.js';
import './app.css';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [ownerFilter, setOwnerFilter] = useState('');
  const [appliedFilter, setAppliedFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDocuments(owner = appliedFilter) {
    setIsLoading(true);
    setError('');
    try {
      setDocuments(await listDocuments(owner));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments('');
  }, []);

  async function handleUpload(file, owner) {
    await uploadDocument(file, owner);
    await loadDocuments(appliedFilter);
  }

  async function handleDownload(document) {
    setError('');
    try {
      await downloadDocument(document);
    } catch (downloadError) {
      setError(downloadError.message);
    }
  }

  function handleFilter(event) {
    event.preventDefault();
    const owner = ownerFilter.trim();
    setAppliedFilter(owner);
    loadDocuments(owner);
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="eyebrow">Arquivo local</p>
        <h1>Document Management System</h1>
        <p>Envie, consulte e recupere seus documentos em um so lugar.</p>
      </header>
      <section className="workspace" aria-label="Gestao de documentos">
        <aside className="upload-panel">
          <h2>Novo documento</h2>
          <UploadComponent onUpload={handleUpload} />
        </aside>
        <section className="documents-panel">
          <div className="section-heading">
            <div>
              <h2>Documentos</h2>
              <p>{documents.length} registro(s)</p>
            </div>
            <form className="filter-form" onSubmit={handleFilter}>
              <label className="visually-hidden" htmlFor="owner-filter">Filtrar por proprietario</label>
              <input
                id="owner-filter"
                value={ownerFilter}
                onChange={(event) => setOwnerFilter(event.target.value)}
                placeholder="Filtrar por proprietario"
              />
              <button type="submit">Filtrar</button>
            </form>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <DocumentList documents={documents} isLoading={isLoading} onDownload={handleDownload} />
        </section>
      </section>
    </main>
  );
}
