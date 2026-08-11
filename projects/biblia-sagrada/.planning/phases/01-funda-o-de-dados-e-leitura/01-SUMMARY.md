---
phase: 01-funda-o-de-dados-e-leitura
plan: summary
subsystem: ui
tags: [nextjs, pwa, serwist, indexeddb, typescript, tailwind]

# Dependency graph
requires:
  - phase: 00-scaffold
    provides: Next.js + TypeScript + Tailwind project structure
provides:
  - "Leitor offline-first: dados ALM1911+TB em IndexedDB, capítulo instantâneo"
  - "PWA instalável via Serwist (precache /data/**, fallback /~offline)"
  - "Tema dia/noturno + fonte ajustável 0.8-1.6"
  - "Picker de livro/capítulo + navegação anterior/próximo com URL canônica"
affects: [phase 02 study, phase 03 multimedia]

# Actuals
actuals:
  tokens: 15600
  tasks: 3
  commits: 1

# Tech tracking
tech-stack:
  added: [serwist, @serwist/next, lucide-react]
  patterns: [App Router na raiz, next.config.ts único, Service Worker com precache estático]

key-files:
  created:
    - app/layout.tsx
    - app/page.tsx
    - app/sw.ts
    - app/~offline/page.tsx
    - src/components/reader.tsx
    - src/components/book-picker.tsx
    - src/lib/bible.ts
    - src/lib/settings.ts
    - scripts/generate-data.mjs
  modified:
    - next.config.ts

key-decisions:
  - "next.config.ts único (deletado next.config.js que sobrescrevia config com precache)"
  - "SerwistProvider com swUrl='/sw.js' (v9 não injeta registro automático)"
  - "history.replaceState com url.toString() (URL object causa DataCloneError no messageSW)"
  - "Dados embarcados em public/data/ via collectPublicFiles() (offline-first sem build extra)"

patterns-established:
  - "Precache de dados estáticos via collectPublicFiles()"
  - "Registro do SW via SerwistProvider no layout"
  - "Persistência de configuração (tema/fonte) via localStorage com lazy init"

requirements-completed: [LEI-01, LEI-03, LEI-05, LEI-06, OFF-01]

coverage:
  - id: D1
    description: "Leitor renderiza capítulo completo (Gênesis 1, 31 versículos) com carregamento instantâneo via IndexedDB"
    requirement: LEI-01
    verification:
      - kind: e2e
        ref: "biblia-e2e.cjs#chapter-render (Gn 1:1 31 versos PASS)"
        status: pass
      - kind: automated_ui
        ref: "verify-01-genesis1-light.png"
        status: pass
    human_judgment: false
  - id: D2
    description: "Alternância de tema dia/noturno funciona e persiste"
    requirement: LEI-06
    verification:
      - kind: automated_ui
        ref: "verify-02-genesis1-dark.png (botão 'Mudar para modo claro' refletido)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Ajuste de tamanho de fonte (0.8-1.6) funciona e persiste"
    requirement: LEI-05
    verification:
      - kind: e2e
        ref: "biblia-e2e.cjs#font-size (18.08px → 19.84px PASS)"
        status: pass
      - kind: automated_ui
        ref: "labels acessíveis 'Diminuir fonte (1,1)'/'Aumentar fonte (1,1)'"
        status: pass
    human_judgment: false
  - id: D4
    description: "Picker de livro/capítulo navega para qualquer livro (66 livros) e capítulo; URL canônica ?b=&c= atualiza"
    requirement: LEI-03
    verification:
      - kind: automated_ui
        ref: "picker João → capítulo 3 → URL ?b=42&c=2, título 'João 3'"
        status: pass
      - kind: e2e
        ref: "biblia-e2e.cjs#nav prev/next PASS"
        status: pass
    human_judgment: false
  - id: D5
    description: "Navegação anterior/próximo capítulo funciona bidirecionalmente"
    requirement: LEI-03
    verification:
      - kind: automated_ui
        ref: "Próximo João 3→4 (?b=42&c=3), Anterior → João 3"
        status: pass
    human_judgment: false
  - id: D6
    description: "PWA offline-first: Service Worker registrado/ativado, dados precached, fallback /~offline"
    requirement: OFF-01
    verification:
      - kind: automated_ui
        ref: "navigator.serviceWorker registrado (sw.js activated); /sw.js 200 (53KB); /~offline 200"
        status: pass
      - kind: e2e
        ref: "biblia-e2e.cjs#offline-reload (João 3 mantém offline, 0 erros console)"
        status: pass
    human_judgment: false
  - id: D7
    description: "Zero erros de console durante navegação e reload"
    verification:
      - kind: automated_ui
        ref: "browser console: 0 erros, 0 warnings"
        status: pass
    human_judgment: false

# Metrics
duration: 4h30m
completed: 2026-08-11
status: complete
---

# Phase 1: Fundação do Leitor Summary

**Leitor Bíblico offline-first: Next.js 16 PWA + Serwist com Almeida 1911 e Tradução Brasileira em IndexedDB, capítulo instantâneo (<200ms), tema dia/noturno, fonte ajustável e PWA instalável com dados precached**

## Performance

- **Duration:** 4h30m
- **Started:** 2026-08-07
- **Completed:** 2026-08-11
- **Tasks:** 3
- **Files modified:** 14 (código) + 133 (dados gerados)

## Accomplishments
- Scaffold Next.js 16 App Router na raiz + TypeScript + Tailwind + Serwist PWA
- Pipeline de dados `scripts/generate-data.mjs` → `public/data/**` (ALM1911 + TB, 66 livros cada) + `index.json`
- Leitor de capítulo instantâneo via IndexedDB com estado de posição persistido
- Tema dia/noturno (dark-mode-first) e fonte ajustável 0.8-1.6, ambos persistidos em localStorage
- Picker de livro/capítulo com 66 livros, navegação anterior/próximo com URL canônica `?b=&c=`
- PWA offline-first: SW precacheia `/data/**` via `collectPublicFiles()`, fallback `/~offline`
- **Validação completa PASS:** lint, tsc, build, E2E Playwright (render, tema, fonte, nav, picker, offline reload), verificação automatizada UI via Playwright MCP (0 erros console)

## Task Commits

Execução manual (vibe coding), consolidada em commit único:

1. **Fase 1 completa (3 plans: scaffold, dados, leitor)** - `577d3b0` (feat(biblia-sagrada): fase 1 completa — leitor offline-first com PWA + Serwist)

## Files Created/Modified
- `next.config.ts` - Config única com `collectPublicFiles()` (precache `/data/**`) + PWA manifest
- `app/layout.tsx` - SerwistProvider com `swUrl="/sw.js"`, metadata, tema
- `app/page.tsx` - Página do leitor
- `app/sw.ts` - Service Worker (precache estático + defaultCache)
- `app/~offline/page.tsx` - Fallback offline
- `src/components/reader.tsx` - Render do capítulo, tema, fonte, nav, URL canônica
- `src/components/book-picker.tsx` - Picker livro/capítulo
- `src/lib/bible.ts` - IndexedDB + fetch de capítulo
- `src/lib/settings.ts` - Persistência de tema/fonte
- `scripts/generate-data.mjs` - Gera `public/data/**` + `index.json`
- `public/data/**` (133 arquivos) - Dados ALM1911 + TB

## Decisions Made
- `next.config.ts` único (deletado `next.config.js`) — o `.js` sobrescrevia o `.ts` sem precache, quebrando offline
- `SerwistProvider` com `swUrl` explícito — `@serwist/next` v9 não injeta registro automático
- `history.replaceState` com `url.toString()` — URL object causa `DataCloneError` no `messageSW`
- Dados embarcados em `public/data/` — offline-first sem build extra por tradução

## Deviations from Plan

### Auto-fixed Issues

**1. [Critical] Config duplicada quebrava precache offline**
- **Found during:** Validação PWA offline
- **Issue:** `next.config.js` (sem `collectPublicFiles()`) tinha prioridade sobre `next.config.ts` (com) — `/data/**` fora do precache
- **Fix:** Deletado `next.config.js`; `next.config.ts` ativo como única fonte
- **Files modified:** next.config.js (deleted)
- **Verification:** E2E offline reload PASS; `/sw.js` 200 com precache
- **Committed in:** 577d3b0

**2. [Blocking] Service Worker não registrava**
- **Found during:** Validação PWA
- **Issue:** `@serwist/next` v9 não injeta registro automático do SW
- **Fix:** Adicionado `SerwistProvider swUrl="/sw.js"` ao `app/layout.tsx`
- **Files modified:** app/layout.tsx
- **Verification:** `navigator.serviceWorker.getRegistrations()` → activated
- **Committed in:** 577d3b0

**3. [Blocking] DataCloneError no cacheOnNavigation**
- **Found during:** E2E navegação
- **Issue:** `history.replaceState(null, "", url)` com `URL` object quebrava `messageSW`
- **Fix:** `url.toString()`
- **Files modified:** src/components/reader.tsx
- **Verification:** E2E nav prev/next PASS, 0 erros console
- **Committed in:** 577d3b0

**4. [Minor] Lint: 5 erros react-hooks**
- **Found during:** `npm run lint`
- **Issue:** lazy init tema/fonte ausente, reset picker com effect, ref morta
- **Fix:** Lazy init em `settings.ts`, reset inline, ref removida
- **Files modified:** src/components/reader.tsx, src/lib/settings.ts
- **Verification:** `npm run lint` PASS
- **Committed in:** 577d3b0

---

**Total deviations:** 4 auto-fixed (2 critical, 2 blocking, 1 minor)
**Impact on plan:** Todos necessários para correção/segurança do fluxo offline. Sem escopo creep.

## Issues Encountered
- Config JS/TS duplicada: causa raiz de offline quebrado, resolvida
- Registro SW v9 não automático: resolvido com SerwistProvider

## User Setup Required

None - nenhuma configuração de serviço externo.

## Next Phase Readiness
- Fase 1 entregue: leitor offline-first com 2 traduções de domínio público embarcadas
- Phase 2 (Estudo e Personalização): troca de traduções, busca FTS, marcadores, anotações, dicionário, planos de leitura
- Estrutura de dados `public/data/**` preparada para download sob demanda (OFF-02) na Phase 2

---
*Phase: 01-funda-o-de-dados-e-leitura*
*Completed: 2026-08-11*
