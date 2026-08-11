# Phase 2: Estudo e Personalização - Context

**Gathered:** 2026-08-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Entregar o app de estudo e personalização: troca de traduções instantânea (com download sob demanda), busca FTS no navegador, dicionário, planos de leitura, "O que a Bíblia diz", marcadores coloridos, anotações por versículo e hinários em texto. Tudo offline-first, sobre a fundação da Fase 1 (IndexedDB + PWA + dados embarcados).

</domain>

<decisions>
## Implementation Decisions

### Troca de traduções (LEI-02)
- **D-01:** Seletor de tradução no header (menu), com a escolha persistida em localStorage e refletida na URL como parâmetro `?v=<code>` para deep-link. Leitor atual usa `const VERSION = "tb"` fixo em `reader.tsx` — a troca exige tornar a versão dinâmica. — **Reversibility:** reversible
- **D-02:** Preferência mantida entre sessões (localStorage), URL é o estado navegável. Requisito: trocar no mesmo capítulo **sem recarregar visivelmente** (success criterion SC1). — **Reversibility:** reversible

### Download sob demanda (OFF-02)
- **D-03:** BLIVRE (domínio público) é gerada no pipeline e embarcada em `public/data/**`, **mas NÃO precacheada** pelo Service Worker (`collectPublicFiles()` deve excluí-la). App baixa para IndexedDB quando online e registra no índice dinâmico — app continua ~45MB, atendendo "baixar sob demanda sem novo build". — **Reversibility:** costly — remover precache exige ajuste no `collectPublicFiles()` e migração do índice; inverso (adicionar BLIVRE ao precache) é simples.

### Busca FTS (LEI-04)
- **D-04:** Índice FTS **pré-computado no build** (pipeline `generate-data.mjs`) usando MiniSearch ou FlexSearch serializado, embarcado em `/data/`. Busca instantânea offline (<1s), sem indexar no client (evita CPU/custo no celular). — **Reversibility:** costly — trocar motor de busca depois exigiria regenerar o índice e migrar o schema do IndexedDB.
- **D-05:** Resultado por versículo com contexto (livro/capítulo/versículo + trecho), destaque do termo e clique navegando para o capítulo (reader via `?b=&c=`). Escopo: tradução selecionada, com aba/filtro por tradução.

### Marcadores e anotações (PER-01, PER-02)
- **D-06:** Versículo clicável abre painel de ações com **5 cores** de marcador + anotação. Persistência em IndexedDB (novo store), com `id`, `ref` (version/book/chapter/verse), `color`, `text`, `updatedAt` — desenhado para sync na Fase 3. — **Reversibility:** reversible
- **D-07:** Marcadores/anotações são dados de usuário (não corpus), não são precacheados.

### Dicionário (EST-04)
- **D-08:** Dicionário curto para a fase: nomes próprios + termos-chave (~200-300 verbetes) curados em JSON no pipeline. Expandir em fase futura. — **Reversibility:** reversible

### Hinários (PER-03)
- **D-09:** 1 hinário de domínio público em português, ~50 hinos curados (texto), gerado no pipeline. — **Reversibility:** reversible

### Planos de leitura (EST-05)
- **D-10:** 2 planos fixos: "Bíblia em 1 ano" e "Novo Testamento em 90 dias", definidos em JSON; progresso local persistido em IndexedDB. — **Reversibility:** reversible

### "O que a Bíblia diz" (EST-06)
- **D-11:** Seção com temas curados (ex: amor, fé, perdão) apontando para versículos-chave; conteúdo em JSON estático no pipeline.

### Claude's Discretion
- Detalhes técnicos de implementação (componentização, composição do índice FTS, schema exato do store IndexedDB, exclusão de BLIVRE do precache) ficam a cargo do researcher/planner. Opções apresentadas foram as recomendadas e confirmadas pelo usuário.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requisitos e roadmap
- `.planning/ROADMAP.md` §Phase 2 — Goal, success criteria (SC1-SC5) e requisitos (LEI-02, LEI-04, EST-04, EST-05, EST-06, PER-01, PER-02, PER-03, OFF-02).
- `.planning/REQUIREMENTS.md` — Requisitos v1 detalhados (LEI/EST/PER/OFF) e tabela de traduções de domínio público.
- `.planning/PROJECT.md` — Core value (leitura ultra-rápida, offline, ~45MB), constraints de tamanho/custo, Key Decisions.

### Stack e dados (Fase 1)
- `.planning/research/STACK.md` — Tech stack recomendada (idb, Serwist, etc.).
- `.planning/research/ARCHITECTURE.md` — Arquitetura e estratégia de cache/offline.
- `.planning/STATE.md` §Phase 1 — Decisões e correções da Fase 1 (config único, SerwistProvider, replaceState).

### Traduções de domínio público
- `.planning/REQUIREMENTS.md` §Traduções confirmadas como domínio público — BLIVRE (2018, domínio público) é a candidata ao download sob demanda.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/bible.ts` — Camada IndexedDB (getIndex, getChapter, stores chapters/meta, ensureDataVersion). Base para: versão dinâmica, novo store de estudo, índice de busca e BLIVRE baixada.
- `src/lib/settings.ts` — Padrão localStorage (theme, fontScale). Reusado para persistir escolha de tradução.
- `src/components/reader.tsx` — Leitor single-column, header com ações (picker/fonte/tema), navegação prev/next, prefetchAdjacent. Ponto de integração do seletor de tradução e do clique no versículo.
- `src/components/book-picker.tsx` — Padrão de modal/menu para o seletor de tradução.
- `next.config.ts` — `collectPublicFiles()` precacheia `/data/**`; precisa excluir BLIVRE (OFF-02).
- `app/manifest.ts` — PWA manifest (nome, ícones).

### Established Patterns
- Dados de corpus em `public/data/**` + IndexedDB (fetch sob demanda por livro, keyPath version/book/chapter).
- Estado na URL (`?b=&c=`) com `history.replaceState`; preferências em localStorage.
- Estilo: tokens ink/paper/accent, serif, mobile-first, acessibilidade (aria-label, role).

### Integration Points
- `reader.tsx`: troca de tradução → recarregar capítulo com nova versão; clique no versículo → painel de ações (marcar/anotar); busca → navegação para `?b=&c=`.
- `bible.ts`: novo store IndexedDB (marcadores/anotações/progresso); registro de BLIVRE baixada no índice dinâmico.
- Pipeline `scripts/generate-data.mjs`: gerar índice FTS, dicionário, hinário, planos e temas.

</code_context>

<specifics>
## Specific Ideas

- "Tudo offline-first" — conteúdo de estudo (dicionário, hinário, planos, temas) embarcado, não baixado.
- Troca de tradução no mesmo capítulo sem recarregar visivelmente (SC1) — prioridade de UX.
- Busca <1s em todas as traduções baixadas (SC2).

</specifics>

<deferred>
## Deferred Ideas

- Dicionário completo (ex: Smith's Bible Dictionary) — fase futura, após curto validado.
- Múltiplos hinários — fase futura.
- Planos de leitura configuráveis pelo usuário — fase futura.
- Áudio devocional, Rota 66, vídeos, sync Supabase — Fase 3 (ROADMAP).

</deferred>

---

*Phase: 2-Estudo e Personalização*
*Context gathered: 2026-08-11*
