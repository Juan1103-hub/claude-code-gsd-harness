---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: in_progress
stopped_at: Phase 3 + extras (6 traduções, deploy Vercel, capa, install prompt) - decidindo próxima fase
last_updated: "2026-08-12T15:00:00.000Z"
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
**Current focus:** App publicado em produção (Vercel) com 6 traduções — decidindo próxima fase

## Current State

- Fase 2 (Estudo e Personalização) COMPLETA: 3/3 plans, UAT 10/10 pass (2026-08-11)
- Fase 3 (Multimídia e Sincronização) COMPLETA (12/08/2026): sync Supabase (auth anônimo + outbox LWW) + aba Rota 66 — UAT 6/7 (pendente real: merge LWW multi-dispositivo exige login permanente/email)
- ✅ **6 traduções no app**: TB + ALM 1911 (embarcadas no precache) + BLIVRE, NTLH, ACF, ARC (baixáveis sob demanda, fora do precache)
  - ACF (© SBTB) e ARC (© SBB) adicionadas a pedido do usuário com alerta de licença registrado no DECISIONS.md (12/08/2026)
  - Pipeline reprodutível: `scripts/fetch-translation.mjs <CODE>` (generalizado de fetch-acf) baixa do `damarals/biblias` (MIT) + normaliza `1Tn`→`1Tm` + valida; `generate-data.mjs` valida abbrev contra canônico (Pitfall 7)
- ✅ **Deploy em produção (Vercel)**: https://biblia-sagrada-eight.vercel.app (projeto `projetos-web4/biblia-sagrada`)
  - Env vars Supabase (URL + ANON_KEY) configuradas em Production (criptografadas, nada commitado)
  - Verificado: HTTPS+TLS ✓, manifest ✓, SW registrado ✓, 6 traduções servidas ✓
- ✅ **Capa/ícones do app**: cruz dourada sobre fundo marrom-papel (design system) — `scripts/generate-icons.mjs` (sharp) gera 192/512/180 + maskable (Android adaptive); manifest com `id`, `purpose: any/maskable`, cores do tema
- ✅ **Install prompt PWA**: banner "Instale o app da Bíblia" (`src/components/install-prompt.tsx`) — `beforeinstallprompt` (Android/Chrome) + fallback iOS ("Adicionar à Tela de Início"); some quando standalone/dismissed
- ✅ **Leitor refinado**: botão "Marcar como lido" no fim do capítulo (sem frase "Fim do capítulo", espaço compactado) + divisores finos (`border-line`) entre versículos + busca de livros no picker + capítulo lido na grade
- ✅ Infra Supabase completa via Management API: auth anônimo, migrations 0001–0003, RLS ativas (incl. news_feed), trigger on_auth_user_created ignora anônimos
- ⚠️ Projeto Supabase compartilhado com outro app (vendas/PDV) — RLS por auth.uid() isola; verificar se projeto dedicado é desejável
- Decisão registrada: traduções de domínio público (ALM1911, TB, BLIVRE) no MVP; ACF/ARC/NTLH adicionadas por decisão explícita do usuário com ALERTA DE LICENÇA (© SBTB/SBB)
- Stack decidida: Next.js + TypeScript + Tailwind (PWA) + IndexedDB + Supabase (sync opcional)
- Plataforma inicial: Android primeiro (via PWA instalável no celular)

### Phase 1 — Implementado, Verificado e UAT Aprovado (11/08/2026)

- Scaffold Next.js 16 PWA + Serwist (plans 01-01 a 01-03): `app/` (App Router na raiz), `src/components/` (reader, book-picker), `src/lib/` (bible.ts IndexedDB, settings.ts)
- Pipeline de dados: `scripts/generate-data.mjs` gera `public/data/**` + `index.json`
- Leitor: capítulo instantâneo via IndexedDB, tema dia/noturno, fonte ajustável (0.8–1.6), picker de livro/capítulo, navegação anterior/próximo, posição persistida
- PWA offline: `next.config.ts` com `collectPublicFiles()` precacheia `/data/**` (traduções embarcadas); `SerwistProvider` registra SW; fallback `/~offline`
- **Validação (todos PASS):** `npm run lint` ✅, `npx tsc --noEmit` ✅, `npm run build` ✅, E2E Playwright ✅
- **Verificação GSD:** `01-VERIFICATION.md` passed (6/6 truths), `01-UAT.md` complete (7/7 auto-pass)

### Correções aplicadas (histórico)

1. `next.config.js` (sem `collectPublicFiles`) tinha prioridade sobre `next.config.ts` — deletado; `next.config.ts` ativo.
2. SW não registrava — `SerwistProvider swUrl="/sw.js"` adicionado ao layout.
3. `history.replaceState` com `URL` object → `DataCloneError`; corrigido `url.toString()`.
4. Lint: 5 erros `react-hooks/*` corrigidos.
5. Pitfall 7: `generate-data.mjs` agora valida abreviações contra o canônico (ACF/ARC usam "1Tn" na fonte) — falha ruidosa em vez de tradução incompleta silenciosa.

## Next Action

- App **em produção** com 6 traduções (TB, ALM 1911, BLIVRE, NTLH, ACF, ARC) — https://biblia-sagrada-eight.vercel.app
- Candidatos de próxima fase/plano: (a) aba Notícias (news_feed — tabela/policies prontas no banco, UI não consome ainda); (b) login com email/OAuth para usuário permanente (destrava multi-dispositivo + postar no news_feed); (c) domínio personalizado na Vercel; (d) mais traduções do `damarals/biblias` (ARA, AS21, KJA) seguindo `fetch-translation.mjs`.
- Pendências técnicas: UAT 6/7 da Fase 3 (merge LWW multi-dispositivo); revisão do STATE/PROJECT em milestone.

## Decisions

| Decision | Status |
|----------|--------|
| Traduções de domínio público (ALM1911 + TB) no MVP | Registered |
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
| ACF (© SBTB) como tradução baixável (decisão do usuário, alerta de licença) | Registered (12/08/2026) |
| ARC (© SBB) como tradução baixável (decisão do usuário, alerta de licença) | Registered (12/08/2026) |
| Script de fetch generalizado `fetch-translation.mjs <CODE>` (reuso ACF/ARC) | Registered (12/08/2026) |
| Capa/ícones do app com cruz dourada + maskable (Android adaptive) via `generate-icons.mjs` | Registered (12/08/2026) |
| Install prompt PWA (banner "Instale o app" + fallback iOS) | Registered (12/08/2026) |
| Deploy Vercel em produção (env vars Supabase criptografadas; repo GitHub Juan1103-hub) | Registered (12/08/2026) |

## Session

**Last session:** 2026-08-12T15:00:00.000Z
**Stopped at:** Deploy publicado (6 traduções) — decidindo próxima fase (candidatos: Notícias, login, domínio)
**Resume file:** None

## Performance Metrics

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 02 P01 | 32min | 3 tasks | 10 files |
| Phase 02 P02 | 18min | 3 tasks | 10 files |
| Phase 02 P03 | 22min | 3 tasks | 5 files |
| Phase 02 UAT | 5min | 10 tests | - |
| Extras 12/08 (ACF, ARC, capa, install prompt, deploy) | ~2h | — | 76+73 arquivos (commits a78d6cd, 16fb7dd, 3ffa63f) |
