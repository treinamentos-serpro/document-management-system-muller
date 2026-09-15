# Especificacao - Document Management System

## 1. Objetivo

Permitir o envio, a listagem e o download de documentos por usuarios, com os
arquivos armazenados localmente pela aplicacao.

## 2. Escopo

### Dentro do escopo

- Upload de documentos com identificacao do proprietario.
- Listagem de todos os documentos ou filtrada por proprietario.
- Download de documento pelo identificador.
- Interface React para os fluxos de upload, listagem e download.

### Fora do escopo

- Armazenamento externo ou em nuvem.
- Versionamento, edicao e exclusao de documentos.
- Autenticacao, autorizacao e controle de sessao.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O usuario pode enviar um arquivo e informar o proprietario. |
| RF-02 | O usuario pode listar os documentos enviados. |
| RF-03 | O usuario pode filtrar documentos pelo proprietario. |
| RF-04 | O usuario pode baixar um documento pelo identificador. |
| RF-05 | O sistema rejeita upload sem arquivo ou sem proprietario. |
| RF-06 | O sistema informa quando um documento nao existe. |

## 4. Requisitos nao funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | O upload usa `multer` com `diskStorage` no filesystem local. |
| RNF-02 | Os metadados permanecem somente em memoria nesta fase. |
| RNF-03 | Porta e diretorio de armazenamento podem ser configurados por variaveis de ambiente. |
| RNF-04 | O nome salvo no disco e gerado internamente para evitar colisao e path traversal. |
| RNF-05 | Erros da API usam o formato `{ "error": "mensagem" }`. |

## 5. Modelo de dados

| Campo | Tipo | Descricao |
| --- | --- | --- |
| id | string | Identificador unico gerado no upload. |
| originalName | string | Nome original recebido do cliente. |
| storedName | string | Nome interno no filesystem; nao exposto pela API. |
| mimeType | string | Tipo MIME informado pelo upload. |
| size | number | Tamanho do arquivo em bytes. |
| uploadedAt | string | Data e hora do upload em ISO 8601. |
| owner | string | Identificador do proprietario. |

## 6. Contratos de API

### POST /upload

- Entrada: `multipart/form-data` com `file` e `owner`, ambos obrigatorios.
- Sucesso: `201 Created` com `id`, `originalName`, `size`, `uploadedAt` e `owner`.
- Erros: `400` para campos obrigatorios ausentes; `500` para falhas inesperadas.

### GET /documents

- Query opcional: `owner` para filtrar pelo proprietario.
- Sucesso: `200 OK` com uma lista de metadados publicos de documentos.

### GET /documents/:id/download

- Sucesso: `200 OK` com o conteudo binario, `Content-Type` do arquivo e disposicao de anexo com o nome original.
- Erro: `404` quando o identificador nao existe.

## 7. Decisoes arquiteturais

- O backend segue `routes -> controllers -> services -> repositories`.
- Routes registram endpoints e configuram o middleware `multer`.
- Controllers validam a entrada HTTP e produzem respostas HTTP.
- Services criam e apresentam metadados, aplicam filtragem e resolvem consultas.
- Repositories encapsulam os metadados em memoria.
- Os binarios ficam exclusivamente em `backend/storage` ou no caminho definido por `STORAGE_DIRECTORY`.
- O frontend usa componentes React e `fetch` pelo prefixo `/api` configurado no Vite.

## 8. Plano de execucao

1. Criar o repository de metadados em memoria.
2. Criar o service para upload, listagem, consulta e apresentacao de metadados.
3. Criar controllers e routes com `multer.diskStorage`.
4. Registrar as rotas no Express e validar o fluxo por teste de integracao.
5. Criar o cliente da API no frontend.
6. Criar os componentes de upload, lista e download.
7. Integrar a tela principal e validar a compilacao do frontend.