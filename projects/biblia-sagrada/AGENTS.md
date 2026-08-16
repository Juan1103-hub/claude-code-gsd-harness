<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Instruções de projeto — biblia-sagrada

O bloco acima é gerado e regravado pelo `next dev` (somente a região entre os
marcadores). As instruções desta seção são de propriedade do projeto e devem
permanecer — não são sobrescritas pelo gerador.

## Stack decidida (docs/DECISIONS.md, 2026-08-10)
- PWA em Next.js + React + TypeScript + Tailwind; dados em IndexedDB; cache
  offline via Service Worker (Serwist). Não usar Flutter/SQLite.
- Supabase para sincronização opcional; `src/lib/supabase.ts` + `src/lib/sync.ts`
  (outbox local-first). Chaves em `.env.local` (gitignored); `service_role` nunca
  no bundle.

## Pipeline de dados (obrigatório antes de build)
- `prebuild` roda `generate-data.mjs` → `search-build.mjs` → `study-build.mjs`.
- `scripts/search-build.mjs` e `src/lib/search-options.ts` mantêm `SEARCH_OPTIONS`
  em sincronia — conferir com `npm run check:search` (paridade retida).

## Verificação
- `npm run lint` — cobre `src/`, `app/`, `scripts/` e os E2E `.cjs`.
- `npm run check:search` — paridade das options de busca (build vs client).
- `npm run check:migrations` — migrations de superfície compartilhada exigem marcador de aprovação.
- `npm run build` — gera os dados e faz o build (roda `prebuild`).
- E2E: `npm run build && npm start`, então em outro terminal `npm run e2e`
  (scripts/task1-e2e.cjs + task2-verify.cjs contra `http://localhost:3000`).

## Backend compartilhado (Supabase)
- O projeto compartilha o banco com outro app (vendas/PDV). Qualquer migration
  que toque objetos compartilhados (`public.users`, `handle_new_user`, triggers
  `security definer`) exige um marcador `-- APPROVAL:` no cabeçalho do arquivo e
  um registro em `docs/DECISIONS.md` antes de aplicar.
