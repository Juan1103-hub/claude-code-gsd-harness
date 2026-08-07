---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 1
current_phase_name: Fundação de Dados e Leitura
status: planning
stopped_at: Phase 1 context gathered
last_updated: "2026-08-07T15:18:47.255Z"
last_activity: 2026-08-07
last_activity_desc: Roadmap criado com 5 fases (22/22 reqs mapeados)
progress:
  total_phases: 1
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-06)

**Core value:** Estudo bíblico profundo e personalizado num único lugar — contexto, originais e conexões a um clique de qualquer versículo, com IA imparcial e com fontes como professor.
**Current focus:** Phase 1 — Fundação de Dados e Leitura

## Current Position

Phase: 1 of 5 (Fundação de Dados e Leitura)
Plan: 0 of 0 in current phase
Status: Ready to plan
Last activity: 2026-08-07 — Roadmap criado com 5 fases (22/22 reqs mapeados)

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: —
- Total execution time: 0.0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Fundação de Dados e Leitura | TBD | TBD | — |
| 2. Conta e Fundação Cloud | TBD | TBD | — |
| 3. Estudo Profundo do Versículo | TBD | TBD | — |
| 4. Notas, Sync e Offline | TBD | TBD | — |
| 5. Busca e Go-Live | TBD | TBD | — |

**Recent Trend:**

- (sem planos concluídos ainda)
- Trend: —

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Fase 1]: Spine canônico + pipeline de originais com Strong's + Licensing Ledger são gates duros da primeira fatia (research P0), antes de UI.
- [Fase 1]: Zoom progressivo (UX-01) é princípio de fundação — panel-layering e persona defaults DEVEM ship na primeira vertical slice, não é tagline.
- [Fase 2]: AUTH como fase própria antes de qualquer dado de usuário; AUTH-05 (RLS) acompanha as notas (Fase 4), não o cadastro.
- [Fase 4]: Padrão RLS + sync estabelecido nas notas antes de qualquer futura fase de grupos (v2).
- [Geral]: Modo MVP — cada fase é uma fatia vertical de capacidade de usuário, não camadas horizontais; originais servidos read-only+cache, dados de usuário RLS-chaveados no spine.

### Pending Todos

[From .planning/todos/pending/ — ideas captured during sessions]

None yet.

### Blockers/Concerns

[Issues that affect future work]

- Licenciamento: "public domain" não é uniforme (KJV só-EUA; packaging editorial tem copyright). Gate da Phase 1 — REMOVER, não editar, se errado.
- Dados de originais são community-owned (Strong's/MorphGNT vs NA-1904 divergem) — reconciliar contra segunda source e marcar "possível" na UI.
- PWA: proibido carregar o dataset inteiro no boot (20MB+) — index em memória + lazy per-book.
- Phase 1 funda as âncoras por token estável (índice Strong), não por string mutável — âncoras drifftam se tradução for corrigida.

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: 2026-08-07T15:18:47.223Z
Stopped at: Phase 1 context gathered
Resume file: .planning/phases/01-funda-o-de-dados-e-leitura/01-CONTEXT.md
