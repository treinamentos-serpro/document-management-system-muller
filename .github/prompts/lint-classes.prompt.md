---
description: Faz lint e revisão de qualidade nas classes/módulos do projeto.
name: lint-classes
argument-hint: caminho do arquivo ou pasta (ex. backend/src/services/documentService.js)
agent: agent
---

# Lint de classes

Analise `${input:alvo:caminho do arquivo ou pasta}` e faça lint das classes e módulos encontrados.

Passos:

1. Rode o `eslint` no alvo informado e reporte os problemas encontrados.
2. Revise manualmente cada classe/módulo quanto a:
   - Responsabilidade única (SOLID - SRP)
   - Duplicação de código (DRY)
   - Complexidade desnecessária (KISS/YAGNI)
   - Nomes descritivos em inglês para símbolos de código
   - Tratamento de erros apenas nos limites do sistema (entrada HTTP, leitura/escrita de arquivos)
3. Verifique se a camada respeita o fluxo `routes -> controllers -> services -> repositories`, sem que uma camada interna dependa de uma camada externa.
4. Liste os problemas encontrados, indicando arquivo e linha.
5. Aplique correções diretas quando forem simples e seguras; para mudanças maiores, apenas sugira antes de alterar.

Não quebre funcionalidades existentes e não introduza abstrações desnecessárias.
