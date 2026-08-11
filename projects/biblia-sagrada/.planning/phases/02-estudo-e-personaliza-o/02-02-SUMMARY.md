---
phase: 02-estudo-e-personaliza-o
plan: "02"
subsystem: ui
tags: [react, nextjs, minisearch, fts, offline-first, dictionary, themes]

requires:
  - phase: 01-fundacao-leitor-offline
    provides: "Leitor offline-first com IDB v1"
  - phase: 02-estudo-e-personaliza-o/01
    provides: "IDB v2 com store search + putSearchIndex/getSearchIndex + downloadTranslation"
provides:
  - "Busca FTS offline com MiniSearch 7.2.0 (índice pré-computado por tradução)"
  - "Dicionário bíblico (~167 verbetes) offline"
  - "Temas 'O que a Bíblia diz' (12 temas com versículos embarcados)"
  - "Shell single-page com tab bar Leitura/Busca/Estudo"
affects: ["02-03 (estende StudyView com hinos e planos de leitura)"]

actuals:
  tokens: 7626
  tasks: 3
  commits: 3

tech-stack:
  added: ["minisearch@^7.2.0"]
  patterns:
    - "Índice FTS pré-computado no build (1 arquivo por tradução em /data/search/{code}.json)"
    - "Lazy load do índice: memória → IDB → fetch (self-heal para BLIVRE baixada sem índice)"
    - "SEARCH_OPTIONS sincronizado entre build e client (Pitfall 1)"
    - "Conteúdo curado em data/raw/** validado por shape no build (dictionary/themes)"

key-files:
  created:
    - src/lib/search-options.ts
    - src/lib/search.ts
    - src/lib/study.ts
    - src/components/search-view.tsx
    - src/components/study-view.tsx
    - scripts/search-build.mjs
    - scripts/study-build.mjs
    - public/data/search/tb.json
    - public/data/search/alm1911.json
    - public/data/search/blivre.json
    - public/data/study/dictionary.json
    - public/data/study/themes.json
  modified:
    - app/page.tsx
    - package.json
    - package-lock.json

key-decisions:
  - "D-04: Índice FTS pré-computado no build (MiniSearch serializado) — não gerado no client"
  - "D-05: Busca escopada por tradução (índice por versão); BLIVRE só pesquisável após baixada"
  - "Pitfall 1: SEARCH_OPTIONS deve ser idêntico no build e no client (loadJSON exige mesmas options)"
  - "Pitfall 7: Cada tradução tem seu próprio índice; troca de filtro recarrega o índice correto"
  - "D-08: Dicionário ~167 verbetes curados (mitigação A1: mínimo 100 aceito)"
  - "D-11: Temas com texto do versículo embarcado (offline-first, sem fetch ao abrir tema)"

patterns-established:
  - "Build scripts em scripts/*.mjs validam shape e escrevem em public/data/**"
  - "Lazy load com cache em módulo (memória → IDB → fetch)"
  - "Conteúdo curado em data/raw/** (gitignored) → public/data/study/** (tracked)"

requirements-completed: [LEI-04, EST-04, EST-06]

coverage:
  - id: D1
    description: "Busca FTS offline com MiniSearch (índice pré-computado por tradução)"
    requirement: LEI-04
    verification:
      - kind: other
        ref: "node scripts/search-build.mjs + node -e asserções (tb: 31100, alm1911: 31101, blivre: 31102 docs)"
        status: pass
      - kind: other
        ref: "npm run lint (exit 0) + npx tsc --noEmit (exit 0) + npm run build (exit 0)"
        status: pass
    human_judgment: true
    rationale: "E2E Playwright para busca 'amor' com <mark> + tempo <1s + navegação — não executado inline nesta sessão"
  - id: D2
    description: "Dicionário bíblico offline (~167 verbetes)"
    requirement: EST-04
    verification:
      - kind: other
        ref: "node -e asserção: dictionary.json é array com ≥100 verbetes {word, definition}"
        status: pass
    human_judgment: false
  - id: D3
    description: "Temas 'O que a Bíblia diz' (12 temas com versículos embarcados)"
    requirement: EST-06
    verification:
      - kind: other
        ref: "node -e asserção: themes.json é array com ≥10 temas {id, title, verses: [{book,chapter,verse,text}]}"
        status: pass
    human_judgment: false
  - id: D4
    description: "Shell single-page com tab bar Leitura/Busca/Estudo"
    verification:
      - kind: other
        ref: "npm run build (exit 0) + app/page.tsx renderiza <Reader />, <SearchView />, <StudyView />"
        status: pass
    human_judgment: true
    rationale: "Navegação entre abas e integração com leitor requer E2E Playwright"

duration: 18min
completed: 2026-08-11
status: complete
---

# Phase 2 Plan 02: Busca FTS + Dicionário + Temas Summary

**Busca FTS offline com MiniSearch 7.2.0 (índice pré-computado por tradução), dicionário bíblico (~167 verbetes) e temas 'O que a Bíblia diz' (12 temas com versículos embarcados), integrados em shell single-page com tab bar Leitura/Busca/Estudo**

## Performance

- **Duration:** ~18 min (3 tasks)
- **Started:** 2026-08-11T12:10Z (commit 9000273)
- **Completed:** 2026-08-11T12:28Z (commit 4df4f3b)
- **Tasks:** 3
- **Files modified:** 10 (source code) + 12 gerados (search indexes + study data)

## Accomplishments
- Busca FTS offline com MiniSearch 7.2.0: índices pré-computados no build (tb: 31100, alm1911: 31101, blivre: 31102 docs), carregados lazy (memória → IDB → fetch) com self-heal para BLIVRE baixada sem índice
- Dicionário bíblico com ~167 verbetes curados (Abraão a Zelotes), pesquisável com filtro por palavra ou definição
- 12 temas "O que a Bíblia diz" (amor, fé, perdão, esperança, oração, salvação, graça, sabedoria, perseverança, paz, justiça, misericórdia) com versículos embarcados (offline-first)
- Shell single-page com tab bar Leitura/Busca/Estudo (sem novas rotas), navegação entre views com replaceState (Pitfall 4 respeitada)
- SEARCH_OPTIONS sincronizado entre build e client (Pitfall 1 verificado)

## Task Commits

1. **Task 1 (tracer): Busca FTS end-to-end** — `9000273` (feat)
2. **Task 2: Conteúdo curado — dicionário + temas** — `ad7bf65` (feat)
3. **Task 3: StudyView — abas Dicionário e Temas** — `4df4f3b` (feat)

## Files Created/Modified
- `src/lib/search-options.ts` — `SEARCH_OPTIONS`, `SEARCH_QUERY_OPTS`, `normalizeTerm` (compartilhados build+client)
- `src/lib/search.ts` — `getSearch(versionCode)` lazy (memória → IDB → fetch) com self-heal; `search()` retorna `SearchResult[]`
- `src/lib/study.ts` — `getDictionary()`, `getThemes()` com cache em módulo; tipos `DictionaryEntry`, `ThemeVerse`, `Theme`
- `src/components/search-view.tsx` — input + filtro de tradução + resultados com `<mark>` (texto puro, sem dangerouslySetInnerHTML) + navegação
- `src/components/study-view.tsx` — abas Dicionário (com filtro) e "O que a Bíblia diz" (temas expansíveis com versículos navegáveis)
- `scripts/search-build.mjs` — constrói `public/data/search/{tb,alm1911,blivre}.json` no build (MiniSearch serializado)
- `scripts/study-build.mjs` — valida `data/raw/{dictionary,themes}.json` e escreve em `public/data/study/`
- `app/page.tsx` — shell "use client" com tab bar Leitura/Busca/Estudo, navegação entre views
- `package.json` — minisearch@^7.2.0 + prebuild chain (generate-data + search-build + study-build)
- `public/data/search/*.json` — índices FTS (tb: 11224KB, alm1911: 11342KB, blivre: 11200KB)
- `public/data/study/{dictionary,themes}.json` — conteúdo curado validado

## Decisions Made
- **D-04** Índice FTS pré-computado no build (não gerado no client) — evita parse de ~31k docs no boot
- **D-05** Busca escopada por tradução (índice por versão); BLIVRE só pesquisável após baixada (ou online)
- **Pitfall 1** SEARCH_OPTIONS deve ser idêntico no build e no client (loadJSON exige mesmas options) — verificado via deep-equal
- **Pitfall 7** Cada tradução tem seu próprio índice; troca de filtro no SearchView recarrega o índice correto
- **D-08** Dicionário ~167 verbetes curados (mitigação A1: mínimo 100 aceito; alvo 200-300)
- **D-11** Temas com texto do versículo embarcado (offline-first, sem fetch ao abrir tema)

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None

## Known Stubs
Nenhum. Todo fluxo está wired: busca com lazy load + self-heal, dicionário com filtro, temas expansíveis com navegação.

## Threat Flags
Nenhuma nova superfície de ameaça fora do `<threat_model>` do plano. Renderização de resultados e conteúdo curado permanece texto puro via React (sem `dangerouslySetInnerHTML` — verificado por grep retornar 0).

## User Setup Required
Nenhum — sem serviços externos nesta fase.

## Next Phase Readiness
- **02-03** pode estender `StudyView` com abas Hinos e Planos de Leitura (stores `study` e `plans` já criados no IDB v2 pelo 02-01)
- `getDictionary()` e `getThemes()` podem ser estendidos com `getHymns()` e `getPlans()` no 02-03
- Shell com 3 abas já está funcional; 02-03 adiciona marcadores e anotações no leitor (não afeta este plano)

---
*Phase: 02-estudo-e-personaliza-o*
*Completed: 2026-08-11*
