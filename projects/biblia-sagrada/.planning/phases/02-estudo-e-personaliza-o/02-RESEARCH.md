# Phase 2: Estudo e Personalização - Research

**Researched:** 2026-08-11
**Domain:** PWA offline-first — troca de traduções, FTS no navegador, estudo (dicionário/planos/temas/hinários), marcadores/anotações, download sob demanda
**Confidence:** HIGH (núcleo); MEDIUM (estimativas de tamanho/perf)

## Summary

A Fase 2 é majoritariamente **cliente-side**: nenhuma rota de servidor nova, nenhuma dependência externa em runtime. Toda a fundação necessária já existe na Fase 1: `getChapter(versionCode, bookId, chapter)` já é parametrizado por tradução (`src/lib/bible.ts:190`), o padrão IndexedDB raw já está estabelecido, o SW Serwist já precacheia `/data/**` via `collectPublicFiles()` em `next.config.ts`, e o `data/raw/BLIVRE.json` (3,82 MB) já está disponível — só falta adicionar a BLIVRE ao pipeline `generate-data.mjs`.

**Decisão central 1 — FTS:** usar **MiniSearch 7.2.0** com índice **pré-computado no build**, um arquivo por tradução em `/data/search/{code}.json` (`MiniSearch.loadJSON` no client). MiniSearch serializa em **um único JSON** (`toJSON`/`loadJSON` com as mesmas options — verificado na doc oficial), enquanto FlexSearch exporta em **múltiplos fragmentos key/data** (exige container custom no build) — MiniSearch é a escolha de menor risco de manutenção. Corpus: 31.100 versos (TB) / 31.101 (ALM1911), 66 livros — irrelevante para performance de busca (ms no index em memória); o custo real é o parse de 2–4 MB JSON no celular (~200–500 ms, dentro do SC2 <1s se carregado lazy).

**Decisão central 2 — Exclusão da BLIVRE do precache:** o mecanismo é filtrar no `walk()` de `collectPublicFiles()` (`next.config.ts:26-38`), pois `additionalPrecacheEntries` **substitui** o scan interno do @serwist/next (comentado no próprio arquivo, linhas 15-20). Sem regra SW custom: o `defaultCache` do @serwist/next já roteia `*.json` para `NetworkFirst` (verificado no `node_modules`), e o app grava a BLIVRE em IndexedDB — IDB é a fonte de verdade offline, não o cache do SW.

**Decisão central 3 — Navegação:** manter **shell de página única** (tab bar Leitura/Busca/Estudo) em vez de rotas novas. Zero risco de rota não precacheada no offline, zero mudança no App Router, coerente com a arquitetura atual (estado na URL via `?b=&c=&v=` + `history.replaceState`).

**Primary recommendation:** MiniSearch 7.2.0 + índice por tradução embarcado; versão dinâmica no reader via estado + `?v=` + localStorage; IDB v2 (stores `study` e `plans` + meta `downloadedVersions`); BLIVRE baixada por livro para o store `chapters` existente (reuso de `loadBookIntoStore`); conteúdo de estudo (dicionário/temas/hinos/planos) em `/data/study/*.json` precacheado.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Seletor de tradução no header (menu), com a escolha persistida em localStorage e refletida na URL como parâmetro `?v=<code>` para deep-link. Leitor atual usa `const VERSION = "tb"` fixo em `reader.tsx` — a troca exige tornar a versão dinâmica.
- **D-02:** Preferência mantida entre sessões (localStorage), URL é o estado navegável. Requisito: trocar no mesmo capítulo **sem recarregar visivelmente** (SC1).
- **D-03:** BLIVRE (domínio público) é gerada no pipeline e embarcada em `public/data/**`, mas **NÃO precacheada** pelo Service Worker (`collectPublicFiles()` deve excluí-la). App baixa para IndexedDB quando online e registra no índice dinâmico — app continua ~45MB, atendendo "baixar sob demanda sem novo build". **Reversibility: costly.**
- **D-04:** Índice FTS **pré-computado no build** (pipeline `generate-data.mjs`) usando MiniSearch ou FlexSearch serializado, embarcado em `/data/`. Busca instantânea offline (<1s), sem indexar no client. **Reversibility: costly.**
- **D-05:** Resultado por versículo com contexto (livro/capítulo/versículo + trecho), destaque do termo e clique navegando para o capítulo (reader via `?b=&c=`). Escopo: tradução selecionada, com aba/filtro por tradução.
- **D-06:** Versículo clicável abre painel de ações com **5 cores** de marcador + anotação. Persistência em IndexedDB (novo store), com `id`, `ref` (version/book/chapter/verse), `color`, `text`, `updatedAt` — desenhado para sync na Fase 3.
- **D-07:** Marcadores/anotações são dados de usuário (não corpus), não são precacheados.
- **D-08:** Dicionário curto para a fase: nomes próprios + termos-chave (~200-300 verbetes) curados em JSON no pipeline. Expandir em fase futura.
- **D-09:** 1 hinário de domínio público em português, ~50 hinos curados (texto), gerado no pipeline.
- **D-10:** 2 planos fixos: "Bíblia em 1 ano" e "Novo Testamento em 90 dias", definidos em JSON; progresso local persistido em IndexedDB.
- **D-11:** Seção "O que a Bíblia diz" com temas curados (ex: amor, fé, perdão) apontando para versículos-chave; conteúdo em JSON estático no pipeline.

### the agent's Discretion

- Detalhes técnicos de implementação (componentização, composição do índice FTS, schema exato do store IndexedDB, exclusão de BLIVRE do precache) ficam a cargo do researcher/planner. Opções apresentadas foram as recomendadas e confirmadas pelo usuário.

### Deferred Ideas (OUT OF SCOPE)

- Dicionário completo (ex: Smith's Bible Dictionary) — fase futura, após curto validado.
- Múltiplos hinários — fase futura.
- Planos de leitura configuráveis pelo usuário — fase futura.
- Áudio devocional, Rota 66, vídeos, sync Supabase — Fase 3 (ROADMAP).

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LEI-02 | Trocar entre traduções com troca instantânea | Versão dinâmica no reader (estado + `?v=` + localStorage); `getChapter` já parametrizado; swap sem reload via estado React |
| LEI-04 | Buscar texto nas traduções baixadas | MiniSearch 7.2.0, índice pré-computado por tradução em `/data/search/{code}.json`, carregamento lazy + filtro por tradução |
| EST-04 | Dicionário bíblico integrado | `/data/study/dictionary.json` (200–300 verbetes), precacheado, busca client-side simples |
| EST-05 | Planos de leitura progressivos com progresso | `/data/study/plans.json` (2 planos gerados no pipeline) + store IDB `plans` |
| EST-06 | Seção "O que a Bíblia diz" | `/data/study/themes.json` (temas + versículos-chave com texto embarcado) |
| PER-01 | Marcar versículos com cores diferentes | Store IDB `study` (D-06 schema), 5 cores via estilo inline, painel de ações no versículo |
| PER-02 | Criar e ver anotações por versículo | Mesmo store `study` (campo `text`), painel de ações + lista de anotações na aba Estudo |
| PER-03 | Acessar hinários (texto) | `/data/study/hymns.json` (~50 hinos) — **conteúdo precisa ser curado** (ver Open Questions OQ-1) |
| OFF-02 | Traduções adicionais baixáveis sob demanda | BLIVRE em `public/data/blivre/**` não precacheada (filtro no `collectPublicFiles`); download → IDB `chapters` + meta `downloadedVersions` + índice de busca em IDB |

</phase_requirements>

## Project Constraints (from AGENTS.md)

- **Next.js 16 não é o Next que você conhece:** APIs, convenções e estrutura de arquivos podem diferir do training data. **Ler o guia relevante em `node_modules/next/dist/docs/` antes de escrever qualquer código.** Heed deprecation notices. (única diretiva do AGENTS.md do projeto — block re-adicionado pelo `next dev`)
- Do harness (raiz `AGENTS.md`): TypeScript estrito sem `any`; TDD RED-GREEN-REFACTOR; alterações cirúrgicas (karpathy-guidelines); revisão obrigatória via `open-code-review` antes de merge; nomes PT-BR ou EN consistentes dentro do arquivo.
- A Fase 2 não toca em: rotas de servidor, Supabase, auth, deploy. Não reconfigurar `next.config.ts` além do filtro de exclusão da BLIVRE.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Troca de tradução instantânea | Browser (client) | API/Backend (fetch estático) | Estado React + URL + localStorage; dados estáticos servidos por `/data/` |
| Busca FTS <1s | Browser (client) | Build-time (pipeline) | Índice pré-computado no build; busca em memória no client (zero rede) |
| Marcadores/anotações | Browser (IndexedDB) | — | Dados de usuário (D-07); IDB local-first, sync na Fase 3 |
| Download BLIVRE | Browser (fetch + IDB) | CDN/Static | Arquivos em `public/data/blivre/**` servidos quando online; IDB é a fonte offline |
| Dicionário/temas/hinos/planos | Build-time (pipeline) | Browser (leitura) | Conteúdo curado embarcado e precacheado; client só renderiza |
| Navegação/estado | Browser (client) | — | URL como estado navegável (`?b=&c=&v=`), shell de página única |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| minisearch | ^7.2.0 | FTS em memória no navegador | Único dep novo da fase. Serialização em JSON único (`toJSON`/`loadJSON`), API estável, 2M downloads/semana, 8 anos de projeto, sem postinstall, repo `lucaong/minisearch` [VERIFIED: npm registry 7.2.0, 2025-09-16 + gsd-tools package-legitimacy OK] |
| (nenhum outro runtime dep) | — | — | IDB raw já é o padrão do projeto (bible.ts) — **não** adicionar `idb`/`Dexie`; não adicionar TanStack Query (estado local/IDB basta; sem server state) |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| minisearch (no pipeline) | ^7.2.0 | Construir índice no build (Node) | Mesmo pacote, roda em `scripts/generate-data.mjs` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| minisearch | flexsearch (0.8.212) | FlexSearch é mais rápido e índice menor, mas `export()` fragmenta em múltiplos key/data (exige formato container custom no build); docs mais pobres; API mudou entre 0.7/0.8. Em 31k docs a diferença de perf é irrelevante. MiniSearch vence em simplicidade/robustez [VERIFIED: npm registry + docs oficiais via Context7] |
| minisearch | idb + busca linear (Array.filter) | Sem índice: scan de ~31k versos por query é ~10–50ms mas sem relevância/prefix/fuzzy; e o índice serializado já resolve snippet + destaque. MiniSearch custa ~2–4MB por tradução — aceitável |
| Filtro no `collectPublicFiles()` | `globIgnores` do injectManifest | `globIgnores` é da API de config genérica do Serwist; o projeto já substituiu o scan interno por `additionalPrecacheEntries` (walk custom em next.config.ts) — o filtro no walk é o único mecanismo que se aplica aqui sem refatorar a config [CITED: serwist.pages.dev/docs/next/config + VERIFIED: next.config.ts:22-42] |

**Installation:**

```bash
npm install minisearch@^7.2.0
```

**Version verification:** `npm view minisearch version` → `7.2.0` (2025-09-16) [VERIFIED: npm registry]. Publicado há 8 anos, 2.004.703 downloads/semana, sem `postinstall`, não deprecado, repo `lucaong/minisearch` — gsd-tools `package-legitimacy check` → `OK` (ver audit abaixo).

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| minisearch | npm | 8 anos | 2.0M/sem | github.com/lucaong/minisearch | OK | Approved |
| flexsearch | npm | ~7 anos | 1.3M/sem | github.com/nextapps-de/flexsearch | OK | Not installed (descartado na comparação) |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none
**Postinstall check:** `npm view minisearch scripts.postinstall` → `null` (nenhum script pós-instalação) [VERIFIED: npm registry via gsd-tools]

*Nota de proveniência: os nomes `minisearch`/`flexsearch` foram confirmados como bibliotecas legítimas via Context7 (docs oficiais) + `package-legitimacy` (OK, sem postinstall, repo público, downloads altos). Versões confirmadas no registry npm.*

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────── PWA (Next.js 16, página única "/") ───────────────────────────────┐
│                                                                                                  │
│  Shell (tab bar): Leitura │ Busca │ Estudo                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────────────────────────────────┐    │
│  │ ReaderView       │  │ SearchView       │  │ StudyView                                   │    │
│  │  versão dinâmica │  │  lazy-load index │  │  dicionário │ temas │ hinos │ planos │ notas │    │
│  │  ?b=&c=&v=       │  │  minisearch      │  │  (sub-navegação client-side)                │    │
│  │  clique versículo│  │  ?b=&c= (volta)  │  └─────────────────────────────────────────────┘    │
│  │  → painel ações  │  └────────┬─────────┘                                                      │
│  └────────┬─────────┘           │                                                                 │
│           ▼                    ▼                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐           │
│  │  DATA ACCESS (client)                                                           │           │
│  │  src/lib/bible.ts — IDB: chapters │ meta │ search │ study │ plans                │           │
│  │  getChapter(v, b, c) fetch-on-miss → /data/{v}/{abbrev}.json (SW NetworkFirst)    │           │
│  │  src/lib/search.ts — MiniSearch.loadJSON('/data/search/{v}.json') lazy           │           │
│  │  src/lib/settings.ts — localStorage (bs-version, bs-theme, bs-font-scale)        │           │
│  └──────────────────────────────────────────────────────────────────────────────────┘           │
│                          ▲                                   ▲                                    │
│            fetch (online)│                                   │ precache SW (tb, alm1911, estudo)  │
│  ┌───────────────────────┴──────────────────────────────────┴─────────────────────────────────┐  │
│  │  public/data/  index.json · tb/** · alm1911/** (precache)                                  │  │
│  │  · search/{tb,alm1911}.json (precache) · search/blivre.json (NÃO precache)                 │  │
│  │  · blivre/** (NÃO precache — download sob demanda → IDB)                                   │  │
│  │  · study/{dictionary,themes,hymns,plans}.json (precache)                                   │  │
│  └────────────────────────────────────────────────────────────────────────────────────────────┘  │
```

Fluxo principal (SC1): Leitor → usuário troca tradução → `setVersion()` → `getChapter(novaVersão, b, c)` → IDB (miss → fetch `/data/{v}/{book}.json`) → re-render capítulo → `replaceState('?b=&c=&v=')` + localStorage. **Sem reload**: troca é estado React; URL só espelha.

Fluxo SC2: Busca → `SearchView` monta → lazy `fetch('/data/search/{v}.json')` → `MiniSearch.loadJSON` (cache em memória) → `search(term, {prefix:true})` → resultados com snippet/destaque → clique → `?b=&c=&v=` → ReaderView.

Fluxo SC5: Baixar BLIVRE → modal com progresso → loop 66 livros `fetch('/data/blivre/{abbrev}.json')` → `put` no store `chapters` (versão "blivre") → `fetch('/data/search/blivre.json')` → store `search` → meta `downloadedVersions=["blivre"]`.

### Recommended Project Structure

```
src/
├── lib/
│   ├── bible.ts            # IDB v2: +stores study/plans/search; meta downloadedVersions; DB_VERSION 1→2
│   ├── search.ts           # NOVO: MiniSearch.loadJSON + normalizeTerm + tipos de resultado
│   ├── settings.ts         # +readVersion/writeVersion (bs-version)
│   └── study.ts            # NOVO: tipos + getters dictionary/themes/hymns/plans (fetch /data/study/*.json)
├── components/
│   ├── reader.tsx          # versão dinâmica + clique no versículo
│   ├── version-picker.tsx  # NOVO (padrão book-picker): lista versões + status download BLIVRE
│   ├── verse-actions.tsx   # NOVO: bottom-sheet 5 cores + anotação
│   ├── book-picker.tsx     # inalterado
│   ├── search-view.tsx     # NOVO
│   ├── study-view.tsx      # NOVO: tabs dicionário/temas/hinos/planos/notas
│   └── download-modal.tsx  # NOVO: progresso BLIVRE
└── app/
    ├── page.tsx            # shell: tab bar + view ativa (sem rotas novas)
    └── ~offline/           # inalterado
scripts/
├── generate-data.mjs       # +BLIVRE, +search/*.json, +study/*.json, +index.json blivre
└── search-build.mjs        # NOVO (ou função no generate-data): constrói índices MiniSearch
data/raw/                   # +dictionary.json, +themes.json, +hymns.json (curados — ver OQ-1)
```

### Pattern 1: Índice FTS pré-computado + loadJSON lazy

**What:** índice construído no build (Node) com o mesmo pacote usado no client; serializado com `JSON.stringify(miniSearch)`; no client `MiniSearch.loadJSON(json, options)` — **options idênticas às do build** (ver Pitfall 1).

**When to use:** corpus imutável e estático (Bíblia). Nunca indexar no client (CPU/custo no celular) — D-04.

**Example:**
```js
// scripts (build) — options MIRROR em src/lib/search.ts
import MiniSearch from "minisearch";
const miniSearch = new MiniSearch({
  fields: ["text"],
  storeFields: ["book", "chapter", "verse", "text"], // snippet + destaque sem ler IDB
  idField: "id",                                     // id = `${book}:${chapter}:${verse}`
  processTerm: (term) => { /* strip diacritics + lowercase; null p/ stopwords PT */ },
  searchOptions: { prefix: true, fuzzy: 0.1, combineWith: "AND" },
});
miniSearch.addAll(docs); // ~31.100 docs por tradução
await fs.writeFile(out, JSON.stringify(miniSearch)); // um JSON por tradução
```
```ts
// client — carregado uma vez, cache em memória
// Source: docs oficiais MiniSearch (loadJSON)
const ms = MiniSearch.loadJSON(await (await fetch(`/data/search/${v}.json`)).json(), SEARCH_OPTIONS);
const results = ms.search(term, { prefix: true }); // {id, score, terms, match:{...}}
```

### Pattern 2: Download sob demanda → IDB (reuso de loadBookIntoStore)

**What:** BLIVRE embarcada em `/data/blivre/**` mas fora do precache; download = fetch de cada livro + `put` no store `chapters` existente (keyPath `["version","book","chapter"]` — versão "blivre"); meta `downloadedVersions` registra o download. Leitura offline = mesmo `getChapter("blivre", ...)` da Fase 1.

**Example (extensão de bible.ts, mesmos primitivos já existentes):**
```ts
// bible.ts — reutiliza loadBookIntoStore(db, "blivre", book) (linhas 135-163) com concurrency limitada
export async function downloadTranslation(versionCode: string, onProgress: (done: number, total: number) => void): Promise<void> {
  const index = await getIndex();
  const version = index.versions.find((v) => v.code === versionCode);
  if (!version) throw new Error(`Versão desconhecida: ${versionCode}`);
  const db = await openDb();
  let done = 0;
  for (const book of index.books) {            // 66 livros, sequencial ou chunks de 4
    await loadBookIntoStore(db, versionCode, book);  // idempotente (put sobrescreve)
    onProgress(++done, index.books.length);
  }
  await writeMeta(db, "downloadedVersions", JSON.stringify([...await readDownloaded(db), versionCode]));
}
```

### Pattern 3: Versículo clicável → bottom-sheet de ações

**What:** cada versículo vira elemento clicável (acessível: `<button>`/`onClick` + `aria-label`), abre painel inferior (padrão visual do `book-picker.tsx`: overlay + sheet bottom). 5 cores com **hex fixo aplicado via style inline** (Pitfall 3). Persistência: store `study`, keyPath `id` = `\`${version}:${book}:${chapter}:${verse}\`` — um registro por versículo com `color` e `text` no mesmo record (D-06).

```ts
// D-06 schema (verbatim no src/lib/bible.ts proposto)
interface StudyRecord {
  id: string;                      // `${version}:${book}:${chapter}:${verse}`
  ref: { version: string; book: number; chapter: number; verse: number };
  color: string | null;            // hex das 5 cores, ou null
  text: string | null;             // anotação, ou null
  updatedAt: number;               // para sync Fase 3
}
```

### Anti-Patterns to Avoid

- **Rota nova por feature (Busca/Dicionário/etc.):** arrisca HTML de rota fora do precache → offline cai no `~offline`; e quebra o "sem recarregar". Em vez disso: shell de página única com tab bar client-side.
- **Indexar no client na primeira busca:** 31k docs × parse de termo no celular custa segundos. Índice é pré-computado (D-04).
- **Carregar todos os índices FTS no boot:** 2–4MB cada; carregar só o da tradução selecionada, na abertura da Busca, lazy.
- **Precachear a BLIVRE junto (esquecer o filtro):** explode o install do SW em ~45MB+ e viola D-03.
- **Classes Tailwind dinâmicas para as 5 cores de marcador:** JIT não enxerga strings montadas → cor some no build. Usar style inline.
- **`JSON.stringify`/`loadJSON` com options divergentes build↔client:** índice silenciosamente errado ou erro em runtime (Pitfall 1).
- **`ensureDataVersion` apagando BLIVRE baixada sem aviso:** a cada build novo, `dataVersion` muda → `clearChapters` (bible.ts:127-133) apaga a BLIVRE do IDB. Comportamento aceitável **se** o meta `downloadedVersions` for limpo junto (senão UI mente: diz "baixada", dados sumiram).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Busca full-text (tokenização, relevância, prefix, fuzzy) | Scanner próprio / `Array.filter` com includes | MiniSearch 7.2.0 | Relevância BM25-ish, prefix/fuzzy/combine, serialização pronta; ~30 linhas de código vs motor de busca |
| Índice FTS serializado | Formato custom de posting lists | `MiniSearch.toJSON()` / `MiniSearch.loadJSON` | Formato estável do projeto, 8 anos de uso real |
| Precache/offline de estáticos | Custom cache no SW | Serwist (`additionalPrecacheEntries` + `defaultCache`) | Já instalado e funcionando (Fase 1); só filtrar no walk |
| Persistência local estruturada | localStorage para dados estruturados | IndexedDB raw (padrão bible.ts) | localStorage 5MB, string-only; IDB já tem chapters/meta |

**Key insight:** as quatro dificuldades desta fase (busca, serialização de índice, precache seletivo, persistência) já têm solução madura no stack atual — a fase é **integração** de peças existentes, não engenharia nova.

## Common Pitfalls

### Pitfall 1: `loadJSON` sem as options do build (MiniSearch)
**What goes wrong:** `MiniSearch.loadJSON` produz busca com comportamento errado (stopwords não removidas, processTerm ausente, storeFields vazios) ou erro de runtime ao buscar campo inexistente.
**Why it happens:** o JSON serializado contém o índice, mas não as options; loadJSON exige re-passá-las.
**How to avoid:** constant `SEARCH_OPTIONS` compartilhada — no repo, única fonte: `src/lib/search-options.ts` importada pelo client **e** pelo script de build (`scripts/search-build.mjs`) [CITED: docs oficiais MiniSearch loadJSON].
**Warning signs:** busca devolve resultados sem `match.terms`; stopwords aparecem como termos de busca.

### Pitfall 2: esquecer de excluir a BLIVRE do precache
**What goes wrong:** `collectPublicFiles()` embarca 3,8MB+ da BLIVRE + índice blivre no SW → install gigante, viola D-03 (~45MB).
**Why it happens:** `additionalPrecacheEntries` substitui o scan interno — a exclusão **não** é um glob; é um `if` no walk.
**How to avoid:** no walker de `next.config.ts`, `if (childRel.startsWith("blivre") || childRel.startsWith("search/blivre")) continue;` — cobrir tanto `/data/blivre/**` quanto `/data/search/blivre.json`. Conferir o precache gerado no build (tamanho do SW).
**Warning signs:** `next build` reporta precache com centenas de entradas novas após adicionar BLIVRE ao pipeline.

### Pitfall 3: cores de marcador via classe Tailwind dinâmica
**What goes wrong:** cor some no build de produção (JIT purge).
**Why it happens:** Tailwind gera classes estáticas; `color-${name}` em runtime não é detectado.
**How to avoid:** hex fixo via `style={{ backgroundColor: palette[color] }}` — 5 cores constantes.
**Warning signs:** marcador aparece no dev, some no `next build`/prod.

### Pitfall 4: `history.replaceState` com objeto `URL` → DataCloneError
**What goes wrong:** exceção `DataCloneError` ao salvar URL com parâmetro novo (`?v=`).
**Why it happens:** replaceState exige string; passando objeto `URL` falha (documentado na Fase 1 / STATE.md).
**How to avoid:** `history.replaceState(null, "", url.toString())`.
**Warning signs:** exceção no console ao trocar tradução.

### Pitfall 5: `ensureDataVersion` zera a BLIVRE baixada
**What goes wrong:** após cada `next build`/deploy, `dataVersion` muda (BLIVRE entra no index.json → hash muda) e o `clearChapters` apaga a BLIVRE do IDB; a UI pode continuar dizendo "baixada".
**Why it happens:** `ensureDataVersion` (bible.ts:127-133) limpa só `chapters` e `meta.dataVersion` — não limpa `downloadedVersions`.
**How to avoid:** no `ensureDataVersion`, limpar também `downloadedVersions` + store `search` (índice blivre). Tratar BLIVRE como cache versionado: após update, usuário re-baixa (UX: badge "atualizar download").
**Warning signs:** usuário offline abre BLIVRE após update e cai no fetch-on-miss (sem rede).

### Pitfall 6: segunda tradução nunca entra no IDB porque o índice meta não registra
**What goes wrong:** `getChapter` sempre refaz fetch-on-miss ao trocar para ALM1911/BLIVRE.
**Why it happens:** Fase 1 só persistia TB; o padrão de "baixar" por tradução depende do fluxo `loadBookIntoStore` — trocar de tradução sem disparar o store deixa cache frio.
**How to avoid:** na troca de versão, além de trocar estado, garantir `loadBookIntoStore(db, v, book)` para a versão ativa (mesmo caminho da BLIVRE). Para TB/ALM1911 precacheadas é opcional (fetch rápido); para BLIVRE é obrigatório após download.
**Warning signs:** NETWORK requests repetidos para o mesmo livro em sessões seguidas.

### Pitfall 7: busca global sem filtro por tradução
**What goes wrong:** SC2 pede escopo na tradução selecionada; resultado misto confunde.
**Why it happens:** índice por tradução (tb/alm1911/blivre) → é natural pesquisar no índice ativo, mas o UI precisa deixar explícito "em qual tradução".
**How to avoid:** aba/filtro por tradução no SearchView (D-05); resultado mostra `book abbrev + chapter:verse + snippet` + tradução.
**Warning signs:** resultado de TB aparecendo quando usuário está na ALM1911.

## Code Examples

### Construção do índice no build (scripts/search-build.mjs)
```js
// Source: docs oficiais MiniSearch (toJSON/serialization) — aplicado ao pipeline
// Options MIRROR importadas de src/lib/search-options.ts (Pitfall 1)
import MiniSearch from "minisearch";
import { SEARCH_OPTIONS } from "../src/lib/search-options.ts";

export function buildSearchIndex(translationCode, docs, outDir) {
  const ms = new MiniSearch(SEARCH_OPTIONS);
  ms.addAll(docs);
  const json = JSON.stringify(ms);            // índice completo num único JSON
  await fs.mkdir(path.join(outDir, "search"), { recursive: true });
  await fs.writeFile(path.join(outDir, "search", `${translationCode}.json`), json);
  return json.length;                         // reportar tamanho no log do pipeline
}
```

### Carga lazy + busca no client (src/lib/search.ts)
```ts
// Source: docs oficiais MiniSearch (loadJSON + search)
import { SEARCH_OPTIONS } from "./search-options";
const cache = new Map<string, MiniSearch>(); // por tradução
export async function getSearch(v: string): Promise<MiniSearch> {
  let ms = cache.get(v);
  if (ms) return ms;
  ms = MiniSearch.loadJSON(await (await fetch(`/data/search/${v}.json`)).json(), SEARCH_OPTIONS);
  cache.set(v, ms);
  return ms;
}
export type SearchResult = { id: string; score: number; terms: string[]; match: Record<string, string[]> };
// id = `${book}:${chapter}:${verse}` → navegação direta (reader via ?b=&c=&v=)
```

### Exclusão da BLIVRE no walker (next.config.ts)
```ts
// Source: estrutura existente next.config.ts:22-42 (collectPublicFiles) — 1 modificação mínima
// dentro do walk: pular blivre + índice blivre
if (childRel.startsWith("blivre") || childRel.startsWith("search/blivre")) {
  continue; // NÃO entra no additionalPrecacheEntries (D-03)
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Busca server-side / indexação no client | Índice FTS pré-computado embarcado + loadJSON client-side | padrão PWA offline desde ~2020 (MiniSearch 2.x em diante) | Busca instantânea offline, zero custo de server |
| Leitura single-translation fixa | Tradução dinâmica + multi-tradução (D-01/D-02) | esta fase | Suporte a múltiplos acervos (BLIVRE baixável) |
| Conteúdo de estudo não estruturado | `/data/study/*.json` precacheado (dicionário, temas, hinos, planos) | esta fase | Crescível: dicionário completo/hinários múltiplos são fases futuras |
| Dados de usuário só em localStorage | IDB estruturado (stores study/plans) | esta fase | Base para sync Supabase na Fase 3 (D-06 `updatedAt`) |

**Deprecated/outdated:**
- FlexSearch 0.7 API (migração 0.7→0.8 quebrou serialização): motivo de não escolher FlexSearch aqui.
- `globIgnores` do Serwist injectManifest: não aplicável a este projeto — o scan interno foi substituído por `additionalPrecacheEntries` custom (next.config.ts:15-20).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Conteúdo curado (dicionário ~200–300 verbetes, ~50 hinos, ~10 temas) será produzido durante a fase (dados/raw/ hoje só tem BLIVRE/ALM1911/TB) | Requirements | Se não houver fonte, EST-04/EST-06/PER-03 atrasam; mitigação: aceitar verbetes "essenciais" (~100) + hinos clássicos de domínio público |
| A2 | Índice FTS por tradução ~2–4 MB JSON; parse mobile 200–500 ms (dentro do SC2 <1s) | Stack | Se índice passar de ~6 MB, split por testamento (2 arquivos/versão) — decisão de tuning pós-medida |
| A3 | BLIVRE + índice não precacheados mantêm app ~45MB (D-03) | Stack | Se `study/*.json` crescer demais (hinos longos), reavaliar — improvável |
| A4 | `MiniSearch.loadJSON` aceita o JSON de `toJSON` do mesmo pacote (7.2.0) sem versão específica no client | Code Examples | Documentado nos docs oficiais; mitigação: pinar `^7.2.0` e testar no build |
| A5 | Tab bar client-side sem rotas novas mantém offline intacto | Architecture | Se planner decidir rotas, precisa E2E offline por rota — decisão aberta (OQ-3) |
| A6 | `navigator.storage.estimate()` disponível no target (moderno) para exibir tamanho no download | Pitfalls/UX | Feature detect; se ausente, ocultar estimativa |

## Open Questions (RESOLVED)

1. **OQ-1 — Origem do conteúdo curado (dicionário/hinos/temas):** dicionário ~200-300 verbetes, ~50 hinos de domínio público PT, ~10 temas. Quem produz/fornece? (planner precisa de tarefa de curadoria ou fonte JSON)
   - O que sabemos: `data/raw/` hoje só tem traduções (BLIVRE/ALM1911/TB).
   - O que está claro: sem conteúdo, EST-04/EST-06/PER-03 não têm dados para pipeline.
   - Recomendação: default — pipeline aceita qualquer entrada JSON; curadoria pode ser feita em lote pequeno (verbetes essenciais) para não bloquear a fase; expandir em fase futura.
   - **RESOLVED (02-02 T2 + 02-03 T2):** curadoria virou tarefas de plano — dicionário (~100-300 verbetes, mitigação A1) e temas em 02-02 T2; hinos (~50 PD, mínimo aceito 30) em 02-03 T2; backstop registrado em must_haves.truths (verification: backstop) de cada plano.
2. **OQ-2 — Tamanho real do índice FTS:** estimativa 2–4 MB/versão.
   - Recomendação: medir no build (log `search/*.json` length) antes de fechar plano de tuning.
   - **RESOLVED (02-02 T1):** log de tamanho no search-build.mjs — `console.log(\`${code}: ${(bytes/1024).toFixed(1)}KB, ${docs.length} docs\`)` por tradução no build.
3. **OQ-3 — Rotas novas vs tab bar client-side:** pesquisa recomenda tab bar (A5); planner deve confirmar se aceita ou exige rotas (`/busca`, `/estudo`).
   - **RESOLVED (02-02 T1):** tab bar client-side no shell de página única (app/page.tsx) — sem rotas novas (A5 confirmada).
4. **OQ-4 — UX de re-download pós-update:** quando `dataVersion` muda, BLIVRE é invalidade; exibir "atualizar download" ou re-baixar silencioso? (recomendo badge, sem auto)
   - **RESOLVED (02-01 T3 + Pitfall 5):** badge re-download — `ensureDataVersion` limpa `downloadedVersions` + store `search` junto com chapters; UI volta a mostrar "Baixar" (sem re-baixar automático).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | build pipeline | ✓ | (Fase 1 funcionou — verificar `node --version` no execute) | — |
| npm | instalar minisearch | ✓ | — | — |
| Next.js 16.3.0 | app | ✓ | 16.3.0 | — |
| Serwist (@serwist/next) | SW | ✓ | (Fase 1) | — |
| Browser moderno (IDB, fetch, storage.estimate) | app PWA | ✓ | — | feature-detect storage.estimate |
| Conteúdo curado (dictionary/themes/hymns JSON) | pipeline EST-04/06, PER-03 | ✗ | — | **ver OQ-1 — bloqueia conteúdo** |

**Missing dependencies with no fallback:** conteúdo curado (dicionário/hinos/temas) — precisa ser criado/curado durante a fase (não é lib, é dado).
**Missing dependencies with fallback:** `storage.estimate` (ocultar estimativa se ausente).

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | app 100% local/offline, sem login |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | yes | termo de busca sanitizado: MiniSearch trata como string; exibição com escaping React; **nunca** `dangerouslySetInnerHTML` para snippets (destaque via `mark`/span) |
| V6 Cryptography | no | dados locais, sem segredos |

### Known Threat Patterns for {stack}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via anotação de usuário | Tampering | React escaping por padrão; anotações renderizadas como texto (`{text}`), nunca HTML |
| XSS via conteúdo de corpus (hinos/dicionário curados) | Tampering | mesma regra: texto puro, sem HTML injection |
| Data tampering local | Tampering | IDB é local; sync Fase 3 tratará auth/RLS (fora do escopo desta fase) |

## Sources

### Primary (HIGH confidence)
- [VERIFIED: código do projeto] `src/lib/bible.ts`, `src/components/reader.tsx`, `next.config.ts`, `app/sw.ts`, `package.json` (Next 16.3.0) — lidos nesta sessão; valores citados verbatim (ex: `const VERSION = "tb"` em reader.tsx:8; `DB_VERSION = 1`, stores `chapters`/`meta` em bible.ts:29-33; walker `collectPublicFiles` next.config.ts:22-42)
- [VERIFIED: npm registry] minisearch 7.2.0 (2025-09-16), flexsearch 0.8.212 — `npm view` + gsd-tools `package-legitimacy` OK
- [VERIFIED: node_modules] @serwist/next `index.worker.mjs` — defaultCache roteia `*.json` → NetworkFirst "static-data-assets" com ExpirationPlugin maxEntries 32

### Secondary (MEDIUM confidence)
- [CITED: docs oficiais MiniSearch via Context7] `toJSON`/`loadJSON`/`searchOptions`/`processTerm` — serialização single-JSON e requirement de options idênticas
- [CITED: serwist.pages.dev] config Next — `additionalPrecacheEntries` substitui glob scan; `globIgnores` é da API injectManifest (não aplicável aqui)

### Tertiary (LOW confidence)
- [ASSUMED] tamanho estimado dos índices (2–4 MB/versão) e parse mobile (200–500 ms) — a medir no build
- [ASSUMED] conteúdo curado disponível/produzível na fase (OQ-1)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — minisearch verificado (registry + docs + legitimacy); nenhuma outra lib nova
- Architecture: HIGH — padrões reusam código existente lido nesta sessão (bible.ts, next.config.ts, reader.tsx)
- Pitfalls: HIGH para as 6 primeiras (baseadas em código lido + docs); MEDIUM para UX/re-download (decisão de produto)
- Estimativas (tamanho índice, parse time): MEDIUM — a validar no build

**Research date:** 2026-08-11
**Valid until:** 2026-09-10 (30 dias — stack estável; minisearch 7.x maduro)


