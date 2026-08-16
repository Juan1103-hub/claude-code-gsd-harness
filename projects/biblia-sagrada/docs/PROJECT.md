# Projeto: Bíblia Sagrada

## Identidade do Agente (Você)
Desenvolvedor Web/Full-Stack Sênior com foco em PWA "offline-first" e UX/UI para leitura de mídia.

## Contexto do Aplicativo
Aplicativo de Bíblia Sagrada gratuito e **100% offline** (PWA instalável), competindo com os líderes das lojas de apps (ex: Mobidic). O acesso à palavra de Deus deve ser garantido em qualquer lugar.

## Funcionalidades Principais:
1.  **Motor de Leitura**: Múltiplas traduções com troca instantânea e cache offline.
2.  **Recursos de Estudo**: Rota 66 (link externo oficial RTM), planos de leitura, seção "O que a Bíblia diz" e dicionário.
3.  **Personalização**: Tema dia/noite, ajuste de fonte e marcadores/notas por versículo.
4.  **Sincronização (opcional)**: Conta Supabase com auth anônima, outbox local-first e merge por `updatedAt`.

## Restrições:
- **Prioridade**: Carregamento dos textos extremamente rápido, funcionando offline.
- **Interface**: Legível, minimalista, com modo noturno.
- **Custos**: Tecnologias open-source ou com camadas gratuitas generosas (Supabase).
- **Tamanho**: Bundle inicial leve (traduções grandes sob demanda).

## Stack Decidida (substitui Flutter — docs/DECISIONS.md, 2026-08-10)
- **App**: PWA em **Next.js + React + TypeScript + Tailwind**, instalável ("Adicionar à tela inicial") e offline-first via **Service Worker (Serwist)**.
- **Dados locais**: **IndexedDB** (store `chapters`), dados estáticos em `public/data/` (JSON por livro/tradução + índice `index.json`).
- **Backend/Sincronização (Opcional)**: **Supabase** (auth anônima + sync local-first via outbox). Chaves em `.env.local` (gitignored); `service_role` nunca no bundle.
- **Busca**: MiniSearch com índice pré-gerado em `public/data/search/`.

## Pipeline de Dados
- `data/raw/` (gitignored, ~12MB) contém as traduções de origem; `scripts/generate-data.mjs` gera o formato compacto em `public/data/` (`index.json` + 1 JSON por livro/tradução).
- `scripts/search-build.mjs` gera os índices de busca (MiniSearch) e `scripts/study-build.mjs` os recursos de estudo (dicionário, planos, temas, hinos).
- `prebuild` garante `generate-data` → `search-build` → `study-build` antes de `next build`.
- `scripts/search-build.mjs` e `src/lib/search-options.ts` mantêm `SEARCH_OPTIONS` em sincronia — verificar com `npm run check:search`.

## Roadmap de Desenvolvimento (GSD — fases em `.planning/`)

### Fase 1 — Fundação de Dados e Leitura (concluída)
- Pipeline de dados, precache de traduções, leitor com troca instantânea de versão, busca, modo noturno, PWA instalável.

### Fase 2 — Estudo e Personalização (em andamento)
- Rota 66, planos de leitura, "O que a Bíblia diz", dicionário, marcadores/notas, download de traduções sob demanda (BLIVRE, NTLH, ACF, ARC; ALM1911 + TB embarcadas).

### Fase 3 — Multimídia e Sincronização
- Sincronização opcional via Supabase (auth anônima, outbox, merge LWW) e integração da Rota 66.

## Estratégia Offline Detalhada:
1.  **Dados**:
    - Traduções embarcadas (domínio público): **ALM1911** e **TB** — no precache do Service Worker.
    - Traduções sob demanda: **BLIVRE**, **NTLH**, **ACF**, **ARC** — no build, fora do precache; baixadas para IndexedDB e invalidadas por `dataVersion`.
    - Cache runtime em IndexedDB (store `chapters`, keyPath `[version, book, chapter]`), carga sob demanda com fetch único por livro.
2.  **Áudio**: Rota 66 como link externo para o podcast oficial da RTM (sem redistribuição).
3.  **Otimização geral do app**: Precache seletivo, tree shaking, dependências leves.

## Verificação
- `npm run lint` (inclui `scripts/*.cjs`), `npm run check:search`, `npm run check:migrations`, `npm run build`, E2E: `npm run e2e` contra `next start`.
