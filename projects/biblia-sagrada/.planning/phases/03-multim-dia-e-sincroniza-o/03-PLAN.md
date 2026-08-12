---
phase: 03-multim-dia-e-sincroniza-o
plan: "01"
subsystem: sync
status: executing
tags: [react, nextjs, supabase, local-first, outbox, indexeddb, offline-first]
requires:
  - phase: 02-estudo-e-personaliza-o
    provides: "StudyRecord/PlanProgress com updatedAt (sync-ready), stores IDB study/plans, StudyView com 5 abas"
provides:
  - "Sincronização opcional Supabase (SYN-01): auth anônimo + local-first (outbox IDB v3 + LWW por updatedAt)"
  - "Aba Rota 66 (EST-03): link externo para o podcast oficial da RTM (sem redistribuição)"
  - "Migration SQL (tabelas study_records + plan_progress com RLS auth.uid())"
---

# Phase 3 Plan 01: Sync Supabase + Rota 66

**Objetivo:** dados de estudo do usuário (marcadores, anotações, progresso de planos) sincronizam opcionalmente com o Supabase via auth anônimo, sem quebrar o local-first; aba Rota 66 direciona para o podcast oficial da RTM.

## Success Criteria

1. Marcador/anotação criado offline → persiste localmente → quando online, chega ao Supabase (outbox flush)
2. Dados criados em outro dispositivo (mesma conta anônima) aparecem ao abrir o app (sync pull no mount)
3. App funciona 100% sem `.env.local` / sem Supabase (nada quebra)
4. Aba Rota 66 exibe descrição + 2 links externos (RTM + Omny) com atribuição
5. `npm run lint` + `npx tsc --noEmit` + `npm run build` passam

## Tasks

1. **Tracer: infra de sync** — `@supabase/supabase-js`, `src/lib/supabase.ts` (client + sessão anônima), `src/lib/sync.ts` (outbox + flush + pull LWW), IDB v3 store `sync_outbox` em `bible.ts`, hooks nas escritas (putStudyRecord/deleteStudyRecord/setPlanProgress).
2. **Migration + aba Rota 66** — `supabase/migrations/0001_sync_tables.sql` (tabelas + RLS), aba "Rota 66" + indicador de status no StudyView.
3. **Fix dicionário** — deduplicar verbetes no `study-build.mjs` (keys duplicadas do React).

## Risks

- **R1:** Migration não executada → sync fica no outbox (comportamento local-first correto, sem quebra). Mitigação: instruções claras para o SQL Editor.
- **R2:** Auth anônimo desabilitado no projeto → sessão falha silenciosamente. Mitigação: `ensureAnonSession` retorna false, app segue local.
- **R3:** Conflito LWW em edições concorrentes → aceito (D-16), suficiente para dados individuais.

## Dependencies

- Supabase: URL + anon key em `.env.local` (fornecido pelo usuário). Tabelas via SQL Editor (CLI sem login).
