# Phase 3: Multimídia e Sincronização - Context

**Gathered:** 2026-08-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Entregar sincronização opcional na nuvem (Supabase) para os dados de estudo do usuário — marcadores, anotações e progresso de planos de leitura — preservando a experiência 100% local-first (o app funciona sem conta e sem rede), e adicionar a seção "Rota 66" como acesso externo ao comentário bíblico em áudio da Rádio Trans Mundial (link, sem redistribuição).

**Escopo aprovado pelo usuário (2026-08-12):**
- ✅ Rota 66: link externo para o podcast oficial da RTM
- ✅ Sync Supabase: auth anônimo + local-first (IndexedDB → outbox → sync LWW)
- ❌ Áudio da Bíblia (abortado pelo usuário nesta rodada)
- ❌ Vídeos BibleProject (não selecionado)

</domain>

<decisions>
## Implementation Decisions

### Rota 66 (EST-03)
- **D-12:** Seção "Rota 66" acessível pelo app via **link externo** para o podcast oficial da Rádio Trans Mundial (RTM) — conteúdo é © RTM (gratuito para ouvir, mas sem CC/redistribuição). Nenhum áudio é embarcado nem baixado; o app apenas abre o link (site RTM/Omny). — **Reversibility:** reversible
- **D-13:** Canais oficiais confirmados pelo research: site RTM (rtmbrasil.org.br/radio/programas/rota-66) e Omny (omny.fm/shows/rota-66). Prioridade ao link oficial mais estável.

### Sync Supabase (SYN-01)
- **D-14:** **Local-first**: IndexedDB é a fonte de verdade local; o Supabase é uma réplica remota. O app funciona 100% offline sem conta. A conta é criada de forma anônima (`signInAnonymously`) sem fricção — dados ficam protegidos por RLS (`auth.uid()`). — **Reversibility:** costly — remover sync não afeta o local (dados permanecem no IDB).
- **D-15:** **Outbox pattern**: toda escrita local (marcador, anotação, progresso) também enfileira a operação em um store `sync_outbox` do IndexedDB; quando online, o `flushOutbox()` envia para o Supabase (upsert/delete) e marca como sincronizada. Falhas de rede mantêm a operação na fila. — **Reversibility:** reversible
- **D-16:** **Merge Last-Write-Wins** por `updatedAt` (epoch ms): no pull, o registro com `updatedAt` mais recente (local vs remoto) vence. Suficiente para dados de usuário individuais sem CRDTs. — **Reversibility:** reversible
- **D-17:** Chaves: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` em `.env.local` (gitignored). **service_role nunca entra no bundle**. Sem `.env.local`, o módulo de sync fica desativado sem quebrar o app. — **Reversibility:** reversible
- **D-18:** Tabelas no Supabase: `study_records` (id, ref_version, ref_book, ref_chapter, ref_verse, color, text, updated_at, user_id) e `plan_progress` (plan_id, completed_days jsonb, updated_at, user_id), ambas com RLS (SELECT/INSERT/UPDATE/DELETE só para `auth.uid()`). Migration via SQL Editor do dashboard (CLI sem login). — **Reversibility:** costly — requer execução manual do SQL.

### Claude's Discretion
- Detalhes técnicos (nome dos stores, shape do outbox, momento do pull inicial, indicador de status na UI) ficam a cargo do planner/executor. O usuário forneceu as chaves do projeto Supabase (ref `dxujotmcfxewnagbtbtp`).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

- `.planning/ROADMAP.md` §Phase 3 — Goal, success criteria e requisitos (EST-03, SYN-01, OFF-03).
- `.planning/REQUIREMENTS.md` — SYN-01 e EST-03 (v1) + notas de v2.
- `.planning/PROJECT.md` — Core value, constraints, Key Decisions (Supabase sync opcional).
- `.planning/STATE.md` — Estado atual (Fase 2 completa, NTLH adicionada).
- `src/lib/bible.ts` — Stores IDB existentes (chapters, meta, study, plans, search) + StudyRecord/PlanProgress.
- `src/components/study-view.tsx` — 5 abas (Dicionário/Temas/Hinos/Notas/Planos); ponto de integração da aba "Rota 66" e do indicador de sync.
- `src/components/verse-actions.tsx` — Escreve StudyRecord (putStudyRecord/deleteStudyRecord) — ponto de integração do outbox.
- `src/lib/settings.ts` — Padrão de leitura/escrita localStorage.
- `docs/DECISIONS.md` — Registro de decisões (D-12 a D-18 serão adicionadas).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/bible.ts` — `putStudyRecord`, `deleteStudyRecord`, `getAllStudyRecords`, `setPlanProgress`, `getPlanProgress`. Todos já escrevem `updatedAt` (sync-ready, D-06/Fase 2).
- IDB v2 já tem stores `study` (keyPath id) e `plans` (keyPath planId) — o outbox será um store novo `sync_outbox` (v3) ou meta-based.
- `study-view.tsx` — Tab type + TabButton reutilizável; padrão de abas com overflow-x.
- `app/page.tsx` — Shell com 3 views; `study-view` é montado quando `view === "study"`.

### Established Patterns
- Dados de usuário em IDB com `updatedAt` em cada escrita (D-06).
- IDs estáveis: StudyRecord `id = ${version}:${book}:${chapter}:${verse}`; PlanProgress `planId`.
- UI mobile-first com tokens ink/paper/accent; abas com `overflow-x-auto`.
- `.env.local` gitignored; `NEXT_PUBLIC_*` para vars do cliente.

### Integration Points
- `verse-actions.tsx` (salvar/remover marcador/anotação) → push + outbox.
- `study-view.tsx` (marcar dia concluído) → push + outbox; aba Rota 66 + status de sync.
- `bible.ts` (putStudyRecord/deleteStudyRecord/setPlanProgress) → enfileirar outbox após escrita local.

</code_context>

<specifics>
## Specific Ideas

- "Local-first": zero fricção — o app abre sem pedir login; a sessão anônima é criada em background quando há rede.
- Indicador discreto de sync na aba Estudo (ex: "sincronizado ✓" / "offline — pendências").
- O pull inicial ocorre no mount do StudyView (ou após sessão anônima) com merge LWW.
- Rota 66 como 6ª aba do StudyView (ou card em destaque) com link externo + descrição + atribuição.

</specifics>

<deferred>
## Deferred Ideas

- Áudio da Bíblia em streaming/offline (EST-01/02) — abortado pelo usuário nesta rodada; reavaliar com fonte licenciada (Bible Brain/FCBH).
- Vídeos BibleProject embed (MUL-01) — não selecionado nesta rodada.
- Rota 66 com áudios embutidos — depende de autorização formal da RTM.
- Sync de dados de corpus (traduções baixadas) entre dispositivos — fora do escopo (IDB é por dispositivo).

</deferred>

---
*Phase: 3-Multimídia e Sincronização*
*Context gathered: 2026-08-12*
