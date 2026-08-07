# Phase 1: Fundação de Dados e Leitura - Context

**Gathered:** 2026-08-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Entregar a fundação sobre a qual todo o app ancora: um spine canônico de ID imutável de versículo, os textos de domínio público self-hosted (traduções + originais com Strong's), o Licensing Ledger e a prova de leitura multi-tradução do mesmo versículo lado a lado com zoom progressivo. É a fatia fundacional — tudo nas Fases 3 e 4 (estudo profundo, notas) ancora neste spine.

</domain>

<decisions>
## Implementation Decisions

### Leitor lado a lado
- **D-01:** Visualização por **colunas sincronizadas** — 2-3 colunas de traduções selecionáveis, sincronizadas no mesmo âncora de versículo. Abre simples (KJV + 1 coluna extra), usuário adiciona mais colunas. — **Reversibility:** reversible
- **D-02:** Cada coluna mostra um **capítulo inteiro** da tradução (rolagem sincronizada pelo âncora), não apenas um versículo focado — preserva a fluência de leitura. — **Reversibility:** reversible

### Navegação (READ-02)
- **D-03:** Âncora mantido via **URL canônica + links internos** — rota canônica (`/read/:OSIS`) e links de referência que saltam/voltam. URL é o estado; back/forward do navegador funciona. "O âncora move tudo". — **Reversibility:** costly — mudar para estado em memória depois afetaria deep-link, histórico e a experiência de navegação por referência; o modelo de rota é a âncora da arquitetura.
- **D-04:** Preferência por **reversibility gate no modelo de rota** — optar por URL canônica AGORA (custa pouco em verde) evita replay de deep-link no futuro.

### Primeira fatia (Walking Skeleton)
- **D-05:** O skeleton prova a corrente inteira: **1 livro, 2 traduções** (KJV + WEB) do mesmo livro, sincronizadas — spine → seed → leitor. Depois expande para o corpus completo. — **Reversibility:** reversible

### Dados self-host
- **D-06:** **Corpus completo** na Fase 1: spine dos 66 livros (ID imutável) + traduções KJV/ASV/WEB/Almeida completas + originais SBLGNT (grego) + OSHB (hebraico) com tokens Strong por palavra, consultáveis. — **Reversibility:** costly — re-seed de corpus é idempotente, mas o schema de originais com Strong é base para a Fase 3.
- **D-07:** **IMPORT pipeline** (node/TS): ferramenta determinística/reproduzível que lê fontes (ex. midvash/bible-data) e grava via migrations + seeds idempotentes no Postgres local. Fonte primária de dados fica fora do DB. — **Reversibility:** reversible
- **D-08:** Seed por **migrations + seeds idempotentes** (rodar N vezes = mesmo estado).

### Licensing Ledger (DATA-05)
- **D-09:** **Ledger data-driven** — tabela canônica de licenças (fonte, status, termos) que alimenta a página de créditos automaticamente; verificação de licença como gate antes do ship. "Public domain" não é uniforme (KJV só-US; packaging editorial tem copyright) — a fonte da verdade fica no dado. — **Reversibility:** reversible

### Claude's Discretion
- Áreas delegadas pelo usuário ("pode sugerir o melhor"): todas as opções apresentadas foram as recomendadas e confirmadas; detalhes de implementação técnica (componentização, refetch, cache) ficam a cargo do planner/researcher.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Stack e arquitetura (harness)
- `.claude/CLAUDE.md` — Stack padrão do harness (Next.js 16 + React 19 + TS + Tailwind v4 + shadcn/ui + Supabase + Vercel); regras de roteamento de skills; demonstra a origem da "zona" de UI.
- `.claude/rules/deploy.md` — Ordem Supabase → Vercel + gate de segurança (RLS, service_role server-side, Security Advisor, headers) obrigatório antes de go-live.
- `.claude/skills/hallmark/SKILL.md` — Skill de design anti-AI-slop (obrigatória pois Fase 1 tem UI).
- `.claude/skills/responsive-design/SKILL.md` — Diretrizes responsivas mobile-first (obrigatória para telas novas).
- `.claude/skills/karpathy-guidelines/SKILL.md` — Disciplina de diffs cirúrgicos em toda edição de código.

### Stack técnica e dados bíblicos
- `.planning/research/STACK.md` — Tech stack recomendada (Next.js 16, Tailwind v4, shadcn/ui, Supabase, TanStack Query, idb, Serwist) e tabelas de compatibilidade de versões.
- `.planning/research/ARCHITECTURE.md` — Arquitetura planejada e estratégia de cache/offline.
- `.planning/research/SUMMARY.md` — Síntese da pesquisa de dados bíblicos.

### Espíritos do produto
- `.planning/ROADMAP.md` §Phase 1 — Goal, success criteria (SC1-SC5) e requisitos (DATA-01..05, READ-01..02, UX-01).
- `.planning/REQUIREMENTS.md` — Requisitos DATA-01..05, READ-01..02, UX-01 detalhados.
- `.planning/PROJECT.md` — Core value, nada de vezes (zoom progressivo UX-01), decisões-chave.

### Deploy
- `.claude/rules/deploy.md` — (ver acima, obrigatório como regra do harness para Postgres/Vercel).

### Seeking-data (fontes import)
No external specs ainda provisionados — o IMPORT pipeline (D-07) baixará dos fontes públicos (midvash/bible-database, morphhb, SBLGNT) na execução; verificar licenças por dataset no passo de implementação.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Nenhum componente de UI pré-existente (greenfield; `projects/` vazio). Serão criados na Fase 1 com stack do harness (shadcn/ui).

### Established Patterns
- Stack padrão do harness: Next.js App Router, Tailwind v4, shadcn/ui, Supabase (`.claude/CLAUDE.md`).
- Nenhum pattern de dados pré-existente — o spine/pipeline é novo nesta fase.

### Integration Points
- Nenhum ponto pré-existente (projeto novo, do zero). A rota /read e o pipeline de seed são os primeiros pontos de integração aestabelecidos.

</code_context>

<specifics>
## Specific Ideas

- "O app abre simples e o usuário puxa camadas de profundidade" — o leitor inicia com poucas colunas (KJV + visibilidade baixa) e expande sob demanda; zoom progressivo é gate da Fase 1 (UX-01).

</specifics>

<deferred>
## Deferred Ideas

- Não houve scope creep — discussão permaneceu dentro do limite da Fase 1.
- Originais do Antigo Testamento em profundidade (léxico BDB/Thayer, word-study) ficam para a Fase 3 — a Fase 1 populapro o pipeline com Strong's, sem o UI de estudo.
- IA-professor, grupos, rede sociais, timeline/mapas visuais — já fora do escopo v1 (PROJECT.md) e não repetidos aqui.

---

*Phase: 1-Fundação de Dados e Leitura*
*Context gathered: 2026-08-07*