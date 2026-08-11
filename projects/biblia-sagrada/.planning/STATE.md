---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: in_progress
stopped_at: Completed 02-02-PLAN.md
last_updated: "2026-08-11T19:07:54.065Z"
progress:
  total_phases: 2
  completed_phases: 0
  total_plans: 3
  completed_plans: 2
current_phase_name: Estudo e Personalização
---

# STATE: Bíblia Sagrada

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-11)

**Core value:** Carregamento de texto ultra-rápido e leitura confortável, 100% offline, app leve (~45MB)
**Current focus:** Phase 2 — Estudo e Personalização (pronta para planejar)

## Current State

- Projeto inicializado: PROJECT.md, config.json, REQUIREMENTS.md, ROADMAP.md criados
- Decisão registrada: traduções de domínio público (Almeida 1911, Tradução Brasileira) no MVP; ACF/ARC NÃO são domínio público (© SBTB/SBB) — fora do escopo
- Stack decidida: Next.js + TypeScript + Tailwind (PWA) + IndexedDB + Supabase (sync opcional)
  - Mudança de arquitetura: originalmente Flutter; usuário optou por web (sem espaço em disco para Flutter/Android SDK)
- Plataforma inicial: Android primeiro (via PWA instalável no celular)

### Phase 1 — Implementado, Verificado e UAT Aprovado (11/08/2026)

- Scaffold Next.js 16 PWA + Serwist (plans 01-01 a 01-03): `app/` (App Router na raiz), `src/components/` (reader, book-picker), `src/lib/` (bible.ts IndexedDB, settings.ts)
- Pipeline de dados: `scripts/generate-data.mjs` gera `public/data/**` (ALM1911 + TB, 66 livros cada) + `index.json`
- Leitor: capítulo instantâneo via IndexedDB, tema dia/noturno, fonte ajustável (0.8–1.6), picker de livro/capítulo, navegação anterior/próximo, posição persistida
- PWA offline: `next.config.ts` (único config) com `collectPublicFiles()` precacheia `/data/**`; `SerwistProvider` em `app/layout.tsx` registra SW; fallback `/~offline`
- **Validação (todos PASS):** `npm run lint` ✅, `npx tsc --noEmit` ✅, `npm run build` ✅, E2E Playwright ✅ (Gn 1:1, tema dark, fonte 18→19.84px, navegação, picker João 3:16, reload offline sem erros de console)
- **Verificação GSD:** `01-VERIFICATION.md` passed (6/6 truths), `01-UAT.md` complete (7/7 auto-pass), commits `577d3b0` e `c5d7e97`
- Servidor `next start` HTTP 200 na porta 3000

### Correções aplicadas nesta rodada

1. `next.config.js` (sem `collectPublicFiles`) tinha prioridade sobre `next.config.ts` (com) — `/data/**` fora do precache, offline quebrado. Deletado `next.config.js`; `next.config.ts` ativo.
2. SW não registrava — `@serwist/next` v9 não injeta registro automático. `SerwistProvider swUrl="/sw.js"` adicionado ao layout.
3. `history.replaceState` com `URL` object → `DataCloneError` no `messageSW` quebrava cache de navegação. Corrigido `url.toString()`.
4. Lint: 5 erros `react-hooks/*` corrigidos (lazy init tema/fonte, reset picker sem effect, ref morta removida).

## Next Action

- Fase 1 completa (implementada, verificada, UAT aprovado). Commit `c5d7e97`.
- Iniciar Phase 2 (Estudo e Personalização) com `/gsd-discuss-phase 2`

## Decisions

| Decision | Status |
|----------|--------|
| Traduções de domínio público (ALM1911 + TB) no MVP | Registered |
| ACF/ARC fora do escopo (© SBTB/SBB) | Registered |
| PWA Next.js + IndexedDB (em vez de Flutter) | Registered |
| Android primeiro (PWA instalável no celular) | Registered |
| Dados baixados sob demanda (IndexedDB) | Registered |
| Config único `next.config.ts` com `collectPublicFiles()` para precache de `/data/**` | Registered (11/08/2026) |
| SW registrado via `SerwistProvider` em `app/layout.tsx` | Registered (11/08/2026) |

## Session

**Last session:** 2026-08-11T19:07:54.032Z
**Stopped at:** Completed 02-02-PLAN.md
**Resume file:** 02-03-PLAN.md

## Performance Metrics

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 02 P01 | 32min | 3 tasks | 10 files |
| Phase 02 P02 | 18min | 3 tasks | 10 files |
