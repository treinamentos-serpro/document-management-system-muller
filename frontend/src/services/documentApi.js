const API_BASE_URL = '/api';

async function getError(response) {
  const body = await response.json().catch(() => null);
  return body?.error || 'Nao foi possivel concluir a operacao.';
}

export async function uploadDocument(file, owner) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('owner', owner);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await getError(response));
  }

  return response.json();
}

export async function listDocuments(owner) {
  const query = owner ? `?${new URLSearchParams({ owner })}` : '';
  const response = await fetch(`${API_BASE_URL}/documents${query}`);

  if (!response.ok) {
    throw new Error(await getError(response));
  }

  return response.json();
}

export async function downloadDocument(documentMetadata) {
  const response = await fetch(`${API_BASE_URL}/documents/${documentMetadata.id}/download`);

  if (!response.ok) {
    throw new Error(await getError(response));
  }

  const fileUrl = URL.createObjectURL(await response.blob());
  const anchor = document.createElement('a');
  anchor.href = fileUrl;
  anchor.download = documentMetadata.originalName;
  anchor.click();
  URL.revokeObjectURL(fileUrl);
}