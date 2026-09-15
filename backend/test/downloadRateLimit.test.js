const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const storageDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-rate-limit-'));
process.env.STORAGE_DIRECTORY = storageDirectory;
process.env.DOWNLOAD_RATE_LIMIT_MAX_REQUESTS = '1';
process.env.DOWNLOAD_RATE_LIMIT_WINDOW_MS = '60000';

delete require.cache[require.resolve('../src/app')];
const app = require('../src/app');

test('bloqueia downloads repetidos acima do limite configurado', async (t) => {
  const server = app.listen(0);

  t.after(() => {
    server.close();
    fs.rmSync(storageDirectory, { recursive: true, force: true });
    delete process.env.DOWNLOAD_RATE_LIMIT_MAX_REQUESTS;
    delete process.env.DOWNLOAD_RATE_LIMIT_WINDOW_MS;
    delete require.cache[require.resolve('../src/app')];
  });

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const formData = new FormData();
  formData.append('file', new Blob(['conteudo do documento'], { type: 'text/plain' }), 'nota.txt');
  formData.append('owner', 'usuario-1');

  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: formData,
  });
  const document = await uploadResponse.json();

  const firstDownloadResponse = await fetch(`${baseUrl}/documents/${document.id}/download`);
  assert.strictEqual(firstDownloadResponse.status, 200);

  const secondDownloadResponse = await fetch(`${baseUrl}/documents/${document.id}/download`);
  assert.strictEqual(secondDownloadResponse.status, 429);
  assert.deepStrictEqual(await secondDownloadResponse.json(), {
    error: 'Muitas requisicoes. Tente novamente em instantes.',
  });
  assert.ok(secondDownloadResponse.headers.get('retry-after'));
});
