import { useState } from 'react';

export default function UploadComponent({ onUpload }) {
  const [file, setFile] = useState(null);
  const [owner, setOwner] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file || !owner.trim()) {
      setError('Selecione um arquivo e informe o proprietario.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onUpload(file, owner.trim());
      setFile(null);
      setOwner('');
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
        Arquivo
        <input type="file" name="file" onChange={(event) => setFile(event.target.files[0] || null)} />
      </label>
      <label>
        Proprietario
        <input
          name="owner"
          value={owner}
          onChange={(event) => setOwner(event.target.value)}
          placeholder="Nome do proprietario"
        />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Enviar documento'}
      </button>
    </form>
  );
}