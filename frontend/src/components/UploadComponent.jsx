import { useState } from 'react';

export default function UploadComponent({ onUpload }) {
  const [owner, setOwner] = useState('');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file || !owner.trim()) {
      setError('Informe o proprietario e selecione um arquivo.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await onUpload(file, owner.trim());
      setFile(null);
      event.currentTarget.reset();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <label>
        Proprietario
        <input
          value={owner}
          onChange={(event) => setOwner(event.target.value)}
          placeholder="Ex.: usuario-1"
          required
        />
      </label>
      <label>
        Documento
        <input
          type="file"
          onChange={(event) => setFile(event.target.files[0] || null)}
          required
        />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Enviar documento'}
      </button>
    </form>
  );
}