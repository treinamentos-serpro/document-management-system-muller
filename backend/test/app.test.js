const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

async function createTestServer(t) {
  const storageDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-test-'));
  const previousStorageDirectory = process.env.STORAGE_DIRECTORY;

  process.env.STORAGE_DIRECTORY = storageDirectory;
  delete require.cache[require.resolve('../src/app')];
  const app = require('../src/app');
  const server = app.listen(0);

  t.after(() => {
    server.close();
    fs.rmSync(storageDirectory, { recursive: true, force: true });

    if (previousStorageDirectory === undefined) {
      delete process.env.STORAGE_DIRECTORY;
    } else {
      process.env.STORAGE_DIRECTORY = previousStorageDirectory;
    }

    delete require.cache[require.resolve('../src/app')];
  });

  return {
    app,
    storageDirectory,
    baseUrl: `http://127.0.0.1:${server.address().port}`,
  };
}

async function uploadDocument(baseUrl, fileName, content, owner) {
  const formData = new FormData();
  formData.append('file', new Blob([content], { type: 'text/plain' }), fileName);
  formData.append('owner', owner);

  const response = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: formData,
  });

  return response;
}

test('o app backend é exportado', async (t) => {
  const { app } = await createTestServer(t);

  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('faz upload de um documento', async (t) => {
  const { baseUrl, storageDirectory } = await createTestServer(t);

  const uploadResponse = await uploadDocument(baseUrl, 'nota.txt', 'conteudo do documento', 'usuario-1');

  assert.strictEqual(uploadResponse.status, 201);

  const document = await uploadResponse.json();
  assert.strictEqual(document.originalName, 'nota.txt');
  assert.strictEqual(document.owner, 'usuario-1');
  assert.strictEqual(document.size, Buffer.byteLength('conteudo do documento'));
  assert.ok(document.id);
  assert.ok(document.uploadedAt);

  const storedFiles = fs.readdirSync(storageDirectory);
  assert.strictEqual(storedFiles.length, 1);
  assert.strictEqual(fs.readFileSync(path.join(storageDirectory, storedFiles[0]), 'utf8'), 'conteudo do documento');
});

test('lista documentos por proprietario', async (t) => {
  const { baseUrl } = await createTestServer(t);

  const firstUploadResponse = await uploadDocument(baseUrl, 'primeiro.txt', 'arquivo 1', 'usuario-1');
  const secondUploadResponse = await uploadDocument(baseUrl, 'segundo.txt', 'arquivo 2', 'usuario-2');

  assert.strictEqual(firstUploadResponse.status, 201);
  assert.strictEqual(secondUploadResponse.status, 201);

  const firstDocument = await firstUploadResponse.json();
  const secondDocument = await secondUploadResponse.json();

  const listResponse = await fetch(`${baseUrl}/documents?owner=usuario-1`);

  assert.strictEqual(listResponse.status, 200);
  assert.deepStrictEqual(await listResponse.json(), [firstDocument]);

  const listAllResponse = await fetch(`${baseUrl}/documents`);

  assert.strictEqual(listAllResponse.status, 200);
  assert.deepStrictEqual(await listAllResponse.json(), [firstDocument, secondDocument]);
});

test('baixa um documento pelo id', async (t) => {
  const { baseUrl } = await createTestServer(t);

  const uploadResponse = await uploadDocument(baseUrl, 'download.txt', 'conteudo para download', 'usuario-1');

  assert.strictEqual(uploadResponse.status, 201);
  const document = await uploadResponse.json();

  const downloadResponse = await fetch(`${baseUrl}/documents/${document.id}/download`);

  assert.strictEqual(downloadResponse.status, 200);
  assert.match(downloadResponse.headers.get('content-disposition') || '', /download\.txt/);
  assert.strictEqual(await downloadResponse.text(), 'conteudo para download');
});
