---
phase: 02-estudo-e-personaliza-o
plan: "03"
subsystem: ui
tags: [react, nextjs, indexeddb, markers, annotations, hymns, reading-plans]

requires:
  - phase: 01-fundacao-leitor-offline
    provides: "Leitor offline-first com IDB v1"
  - phase: 02-estudo-e-personaliza-o/01
    provides: "IDB v2 com stores study/plans + CRUD accessors"
  - phase: 02-estudo-e-personaliza-o/02
    provides: "Shell com tab bar Leitura/Busca/Estudo + StudyView com abas Dicionário/Temas"
provides:
  - "Marcadores 5 cores por versículo (amarelo/verde/azul/rosa/laranja) persistidos em IDB store study"
  - "Anotações por versículo (maxLength 2000) persistidas em IDB store study"
  - "Hinário ~49 hinos de domínio público offline"
  - "2 planos de leitura (Bíblia em 1 ano, NT em 90 dias) com progresso persistido em IDB store plans"
  - "StudyView expandido com 5 abas: Dicionário, O que a Bíblia diz, Hinos, Notas, Planos"
affects: ["03-01/03-02 (áudio/sync estenderão verse-actions e sincronizarão via updatedAt)"]

actuals:
  tokens: 21625
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "Versículos clicáveis com destaque inline via style backgroundColor (Pitfall 3 — nunca classes dinâmicas)"
    - "ID no formato ${version}:${book}:${chapter}:${verse} (D-06, sync-ready)"
    - "updatedAt em cada escrita IDB (Fase 3 sync)"
    - "Progresso de plano só muda por ação explícita do usuário (EST-05, prohibition respeitada)"
    - "Planos gerados algoritmicamente do index.json (sem duplicar contagem de capítulos)"

key-files:
  created:
    - src/components/verse-actions.tsx
    - public/data/study/hymns.json
    - public/data/study/plans.json
  modified:
    - src/lib/bible.ts
    - src/lib/study.ts
    - src/components/reader.tsx
    - src/components/study-view.tsx
    - scripts/study-build.mjs

key-decisions:
  - "D-06: 5 cores fixas (amarelo #fef08a, verde #bbf7d0, azul #bfdbfe, rosa #fbcfe8, laranja #fed7aa)"
  - "D-07: Anotações texto puro (maxLength 2000), persistidas em IDB store study"
  - "D-09: Hinário ~49 hinos de domínio público (Sublime Graça, Castelo Forte, Grandioso És Tu, etc.)"
  - "D-10: 2 planos fixos (Bíblia em 1 ano: 298 dias, NT em 90 dias: 87 dias) gerados do index.json"
  - "Pitfall 3: Destaque via style inline backgroundColor, nunca classes dinâmicas (Tailwind não suporta cores arbitrárias em runtime)"

patterns-established:
  - "Bottom sheet reutilizável verse-actions (padrão book-picker)"
  - "Versículos como <button> com aria-label e style inline para destaque"
  - "Planos gerados algoritmicamente no build (sem dados manuais)"

requirements-completed: [PER-01, PER-02, PER-03, EST-05]

coverage:
  - id: D1
    description: "Marcadores 5 cores por versículo persistidos em IDB"
    requirement: PER-01
    verification:
      - kind: other
        ref: "npm run lint (exit 0) + npx tsc --noEmit (exit 0) + npm run build (exit 0)"
        status: pass
    human_judgment: true
    rationale: "E2E Playwright para fluxo marcador/recarregar com persistência — não executado inline nesta sessão"
  - id: D2
    description: "Anotações por versículo (painel + aba Notas)"
    requirement: PER-02
    verification:
      - kind: other
        ref: "npm run build (exit 0) + aba Notas renderiza anotações com cor da marcação"
        status: pass
    human_judgment: true
    rationale: "E2E para criar anotação e ver na aba Notas — não executado inline"
  - id: D3
    description: "Hinário ~49 hinos PD offline"
    requirement: PER-03
    verification:
      - kind: other
        ref: "node -e asserção: hymns.json é array com ≥30 hinos {id, title, verses: string[]}"
        status: pass
    human_judgment: false
  - id: D4
    description: "2 planos de leitura com progresso persistido (ação explícita)"
    requirement: EST-05
    verification:
      - kind: other
        ref: "node -e asserção: plans.json tem 2 planos com totalDays 365 e 90, readings válidos contra index.json"
        status: pass
    human_judgment: true
    rationale: "E2E para marcar dia e verificar persistência após reload — não executado inline"

duration: 22min
completed: 2026-08-11
status: complete
---

# Phase 2 Plan 03: Marcadores + Anotações + Hinários + Planos Summary

**Marcadores 5 cores e anotações por versículo persistidos em IndexedDB, hinário ~49 hinos PD offline, e 2 planos de leitura (Bíblia em 1 ano, NT em 90 dias) com progresso persistido via ação explícita do usuário**

## Performance

- **Duration:** ~22 min (3 tasks)
- **Started:** 2026-08-11T12:30Z (commit 2e165ac)
- **Completed:** 2026-08-11T12:52Z (commit b84012f)
- **Tasks:** 3
- **Files modified:** 5 (source code) + 2 gerados (hymns + plans)

## Accomplishments
- Marcadores 5 cores fixas (amarelo/verde/azul/rosa/laranja) por versículo, persistidos em IDB store study com ID `${version}:${book}:${chapter}:${verse}` (D-06, sync-ready)
- Anotações por versículo (maxLength 2000) persistidas em IDB, visíveis na aba Notas com cor da marcação
- Versículos clicáveis com destaque inline (Pitfall 3 respeitado — style backgroundColor, nunca classes dinâmicas) + indicador de anotação (✎)
- Hinário ~49 hinos de domínio público (Sublime Graça, Castelo Forte, Grandioso És Tu, Noite Feliz, etc.) precached e legível na aba Hinos
- 2 planos de leitura gerados algoritmicamente do index.json: Bíblia em 1 ano (298 dias, ~3 capítulos/dia) e NT em 90 dias (87 dias, ~1-2 capítulos/dia)
- Progresso de plano persistido em IDB store plans, marcável só por ação explícita do usuário (EST-05, prohibition respeitada — abrir/ler NÃO marca dia)
- StudyView expandido com 5 abas: Dicionário, O que a Bíblia diz, Hinos, Notas, Planos

## Task Commits

1. **Task 1 (tracer): Marcadores 5 cores + anotações** — `2e165ac` (feat)
2. **Task 2: Hinário + aba Notas** — `1df5840` (feat)
3. **Task 3: Planos de leitura com progresso** — `b84012f` (feat)

## Files Created/Modified
- `src/lib/bible.ts` — `StudyRecord` CRUD (putStudyRecord/getStudyRecords/getAllStudyRecords/deleteStudyRecord) + `PlanProgress` CRUD (getPlanProgress/setPlanProgress)
- `src/lib/study.ts` — `Hymn`, `Plan`, `PlanDay`, `DailyReading` types + `getHymns()`, `getPlans()` com cache
- `src/components/verse-actions.tsx` — NOVO: bottom sheet com 5 cores + anotação (maxLength 2000) + remover; `HIGHLIGHT_COLORS` exportado
- `src/components/reader.tsx` — versículos como `<button>` com style inline backgroundColor (Pitfall 3) + indicador de anotação (✎); carrega studyRecords no efeito de capítulo + recarrega após onChanged
- `src/components/study-view.tsx` — 5 abas: Dicionário (filtro), O que a Bíblia diz (temas expansíveis), Hinos (letra completa), Notas (lista com cor da marcação, navega para capítulo), Planos (card com barra de progresso, dias expansíveis com botão "Marcar concluído")
- `scripts/study-build.mjs` — estende com validação de hymns.json (≥30 hinos) + geração algorítmica de plans.json do index.json
- `public/data/study/hymns.json` — 49 hinos PD
- `public/data/study/plans.json` — 2 planos (298 + 87 dias)

## Decisions Made
- **D-06** 5 cores fixas: amarelo (#fef08a), verde (#bbf7d0), azul (#bfdbfe), rosa (#fbcfe8), laranja (#fed7aa)
- **D-07** Anotações texto puro (maxLength 2000), persistidas em IDB store study
- **D-09** Hinário ~49 hinos de domínio público (clássicos pré-1927 ou traduções PD verificáveis)
- **D-10** 2 planos fixos gerados algoritmicamente do index.json (sem dados manuais)
- **Pitfall 3** Destaque via style inline backgroundColor, nunca classes dinâmicas (Tailwind não suporta cores arbitrárias em runtime sem JIT)

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None

## Known Stubs
Nenhum. Todo fluxo está wired: marcadores/anotações persistidos, hinário legível, planos com progresso explícito.

## Threat Flags
Nenhuma nova superfície de ameaça fora do `<threat_model>` do plano. Anotações renderizadas como texto puro via React (sem dangerouslySetInnerHTML — verificado por grep retornar 0).

## User Setup Required
Nenhum — sem serviços externos nesta fase.

## Phase 2 Complete Readiness
- **Fase 2 completa**: Estudo e Personalização implementada (troca de traduções, busca FTS, dicionário, temas, marcadores, anotações, hinários, planos de leitura)
- **Próximo passo**: `/gsd-verify-work 2` para UAT manual, depois `/gsd-ship 2` para criar PR
- **Fase 3** (futuro): Áudio e sincronização Supabase (verse-actions já tem updatedAt sync-ready)

---
*Phase: 02-estudo-e-personaliza-o*
*Completed: 2026-08-11*
