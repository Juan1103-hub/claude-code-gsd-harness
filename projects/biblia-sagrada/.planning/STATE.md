---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: in_progress
stopped_at: Phase 3 complete (UAT 6/7) - deciding next phase
last_updated: "2026-08-12T13:40:00.000Z"
progress:
  total_phases: 3
  completed_phases: 3
  total_plans: 6
  completed_plans: 3
current_phase_name: Multimídia e Sincronização
---

# STATE: Bíblia Sagrada

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-11)

**Core value:** Carregamento de texto ultra-rápido e leitura confortável, 100% offline, app leve (~45MB)
**Current focus:** Phase 3 complete — next phase pending decision

## Current State

- Fase 2 (Estudo e Personalização) COMPLETA: 3/3 plans, UAT 10/10 pass (2026-08-11)
- NTLH (© SBB) adicionada como 4ª tradução baixável (12/08/2026, decisão do usuário)
- Fase 3 (Multimídia e Sincronização) COMPLETA (12/08/2026): sync Supabase (auth anônimo + outbox LWW) + aba Rota 66 — UAT 6/7 (todos os pushes validados no banco: marcador, anotação, plano, offline→reconexão)
- Escopo Fase 3 aprovado: Rota 66 (link RTM) + sync Supabase; áudio abortado; vídeos não selecionados
- ✅ Infra completa via Management API (PAT): auth anônimo habilitado, migrations 0001/0002/0003 executadas, policies RLS ativas (incl. news_feed), trigger on_auth_user_created corrigido para pular anônimos
- ✅ Sync E2E validado: marcador criado no navegador → presente no Supabase (study_records); outbox acumulou ops antigas sem infra e drenou após habilitação
- ⚠️ Projeto Supabase compartilhado com outro app (vendas/PDV: users, sales, products...) — RLS por auth.uid() isola os dados; verificar se o projeto dedicado é desejável
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

- Fase 3 COMPLETA (UAT 6/7; pendente real: merge LWW multi-dispositivo, que exige login permanente/email — ver Gaps no 03-UAT.md).
- Candidatos de próxima fase/plano: (a) Fase 3 P02 = aba Notícias (news_feed — tabela/policies prontas no banco, UI não consome ainda); (b) login com email/OAuth para usuário permanente (destrava multi-dispositivo + postar no news_feed); (c) Deploy na Vercel.

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
| Fase 2 completa com UAT 10/10 (marcadores, anotações, hinários, planos) | Registered (12/08/2026) |
| NTLH (© SBB) como tradução baixável (decisão do usuário) | Registered (12/08/2026) |
| Sync Supabase local-first (outbox + LWW) + Rota 66 link externo | Registered (12/08/2026) |
| Infra Supabase provisionada via Management API (auth anônimo + migrations 0001–0003) | Registered (12/08/2026) |
| news_feed: só usuários permanentes postam; todos veem (RLS) | Registered (12/08/2026) |
| Trigger on_auth_user_created ignora anônimos (fix p/ app de vendas coexistir) | Registered (12/08/2026) |

## Session

**Last session:** 2026-08-11T19:58:00.000Z
**Stopped at:** Phase 2 UAT approved (10/10) — ready for Phase 3 discuss
**Resume file:** None

## Performance Metrics

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 02 P01 | 32min | 3 tasks | 10 files |
| Phase 02 P02 | 18min | 3 tasks | 10 files |
| Phase 02 P03 | 22min | 3 tasks | 5 files |
| Phase 02 UAT | 5min | 10 tests | - |
