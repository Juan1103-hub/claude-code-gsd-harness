# Phase 1: Fundação de Dados e Leitura - Research

**Researched:** 2026-08-07
**Domain:** Data pipeline (Bible corpus import into a Supabase/Postgres canonical spine + original-language Strong's analysis) + multi-version synchronized reader (Next.js app)
**Confidence:** HIGH

## Summary

Phase 1 is the founding slice: a canonical immutable verse-ID "spine", public-domain translations self-hosted in Supabase/Postgres (no external runtime Bible dependency), original-language texts (SBLGNT Greek + OSHB Hebrew) with per-word Strong's tokens that anchor the Phase 3 interlinear, a data-driven Licensing Ledger, and a proof-of-concept multi-translation synchronized reader. The engineering commitment is the **data pipeline**, not the UI (STATE.md: "spine + pipeline + ledger são gates duros da primeira fatia, antes de UI"). The plan must therefore front-load data (D-07 IMPORT, D-08 idempotent seed) ahead of the reader surface.

The validated data path is: **midvash/bible-data** (`kjv`, `asv`, `web`, `almeida-livre`) for the 4 public-domain translations [VERIFIED: schema + metadata verified from the repo's SCHEMA.md and README this session], **openscriptures/morphhb** (npm `morphhb@2.0.2`) for Hebrew WLC text + lemma with Strong-based ids [VERIFIED: npm registry version + CC BY 4.0 from repo README], and **morphgnt/sblgnt** (SBLGNT text = EULA, morphology = CC BY-SA 3.0) for Greek [VERIFIED: repo README]. Two critical caveats confirmed this session: (1) **midvash lists its own WLC under `wlc-license`, not public-domain** — so OSHB/morphhb is the correct Hebrew source (a CC BY 4.0 re-tag of the same WLC base), and (2) **midvash carries only Almeida 1819 (`almeida-livre`), not a modern Almeida** — a legitimate public-domain choice satisfying D-06 "Almeida".

**Locked (from CONTEXT.md D-01..D-09):** reader = synchronized 1-3 columns sharing one canonical verse anchor; whole chapter per column; URL `/read/:OSIS` is the state (the anchor moves everything); IMPORT pipeline is deterministic node/TS; seed via idempotent migrations+seeds; ledger is data-driven. Reader surface exists (this Phase has UI), so `hallmark` + `responsive-design` skills apply.

**Top planning risk (environment, verified this session):** the dev machine runs Node v24.14.0 / npm 11.18.0 with the Supabase CLI 2.x installed, but **Docker is NOT installed** and the `gh` CLI / supabase login is unauthenticated. `supabase start` (the standard local Postgres) depends on Docker; seeding the 66-book + originals corpus requires a running Postgres. The IMPORT/seed toolkit is pure Node and needs no Docker, but loading into local Postgres does. The plan MUST include a Docker install step (or route the seed to a remote Supabase project) before the seed tasks, else the "seed the whole corpus" gate silently blocks.

**Primary recommendation:** Segment the Phase into (1) `spine` schema + OSIS parser/reference util (TDD), (2) deterministic IMPORT script that pins input sources (commit/tag) and produces idempotent SQL seeds + ledger metadata, (3) seed loading into Postgres, (4) reader surface anchored on the `/read/:OSIS` route (D-03), (5) gates (ledger verification + reader SC checks). Use Supabase CLI migrations + seeded inserts keyed by an immutable verse id; verify data provenance via a license gate before ship (D-09 / DATA-05).

**Source hierarchy note:** all web-search providers (`exa`, `tavily`, `brave`, `firecrawl`, `jina`, etc.) are disabled in `.planning/config.json`, so no third-party web search was available. Evidence in this doc comes only from (a) upstream dataset repos/schemas fetched directly, and (b) the npm registry. Anything not face-to-face with those is tagged `[ASSUMED]`.

## User Constraints

> Copied verbatim from `01-CONTEXT.md`. Locked decisions the plan MUST honor.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Visualização por colunas sincronizadas — 2-3 colunas de traduções selecionáveis, sincronizadas no mesmo âncora de versículo. Abre simples (KJV + 1 coluna extra), usuário adiciona mais colunas. — Reversible
- **D-02:** Cada coluna mostra um capítulo inteiro da tradução (rolagem sincronizada pelo âncora), não apenas um versículo focado — preserva a fluência de leitura. — Reversible
- **D-03:** Âncora mantido via URL canônica + links internos — rota canônica (`/read/:OSIS`) e links de referência que saltam/voltam. URL é o estado; back/forward funciona. "O âncora move tudo". — Costly
- **D-04:** Preferência por reversibility gate no modelo de rota — optar por URL canônica AGORA.
- **D-05:** O skeleton prova a corrente inteira: 1 livro, 2 traduções (KJV + WEB) do mesmo livro, sincronizadas — spine a seed a leitor.
- **D-06:** Corpus completo na Fase 1: spine dos 66 livros + traduções KJV/ASV/WEB/Almeida completas + originais SBLGNT (grego) + OSHB (hebraico) com tokens Strong por palavra, consultáveis. — Costly
- **D-07:** IMPORT pipeline (node/TS): ferramenta determinística que lê fontes (ex. midvash/bible-data) e grava via migrations + seeds idempotentes no Postgres local. Fonte primária de dados fica fora do DB.
- **D-08:** Seed por migrations + seeds idempotentes (rodar N vezes = mesmo estado).
- **D-09:** Ledger data-driven — tabela canônica de licenças que alimenta a página de créditos automaticamente; verificação de licença como gate antes do ship. — Reversible

### Claude's Discretion
- Detalhes de implementação técnica (componentização, refetch, cache) ficam a cargo do planner/researcher.

### Deferred Ideas (OUT OF SCOPE)
- Originais do AT em profundidade (léxico BDB/Thayer, word-study) — Fase 3; Fase 1 só popula o pipeline com Strong's.
- IA-professor, grupos, redes sociais, timelines/mapas visuais — fora do escopo v1.
</user_constraints>

## Phase Requirements

| ID | Description (from REQUIREMENTS.md) | Research Support |
|----|------------------------------------|------------------|
| DATA-01 | Camada canônica de texto por-verso (livro, capítulo, versículo) com "spine" de ID imutável | "Spine Verse ID" pattern; `verse` table PK = canonical id; `lib/reference/reference.ts` |
| DATA-02 | Pipeline de dados de originais com tag Strong's por palavra | morphhb (Hebrew lemma+Strong) + SBLGNT+morphGNT formats verified; Strong mapping step needed for Greek (see Pitfall 3) |
| DATA-03 | Self-host dos textos de domínio público (KJV-US, ASV, WEB, Almeida) em Postgres | midvash verse schema verified; the 4 required slugs confirmed; self-hosted, no API dependency |
| DATA-04 | Originais livres de licença: SBLGNT (grego) + OSHB (hebraico) — nunca NA28/Westminster | verified: use OSHB/morphhb NOT Westminster; SBLGNT text EULA CC BY + morphology CC BY-SA |
| DATA-05 | Licensing Ledger + página de créditos — gate da Fase 1 | `metadata.json` per version exposes exactly the ledger fields (name, license, licenseNote, sourceUrl); LicenseTag union verified |
| READ-01 | Usuário lê em múltiplas traduções lado a lado (sincr. mesmo versículo) | Reader column-sync architecture; URL-anchor; server route + segment fetch |
| READ-02 | Usuário navega por livro/capítulo/versículo e salta/volta em referências | `next/link` internal refs (D-03); canonical OSIS parse util (zod); back/forward via URL state |
| UX-01 | "Zoom progressivo" — abre simples e o usuário puxa profundidade sob demanda | Reader opens 1 column + "Adicionar tradução"; depth layers are lazy; a gate, not a tagline |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Canonical spine (verse id) | Data/Storage | API/Backend | immutable identity in Postgres; the DB owns it, an API layer exposes it |
| Translation text storage | Data/Storage | API | `verse_text` immutable rows served read-only, read-through cached |
| Import pipeline | Backend (CLI, node/TS) | Data | reproducible ETL concatenates raw sources -> normalized rows -> seeds |
| Source-language Strong's tokens | Data/Storage | Backend | per-word `interlinear_word` rows join on `(verse_id)` + Strong; interlinear UI is Phase 3 |
| Licensing Ledger | Data/Storage | — | rows from metadata; drives the Credits page read-only |
| Reader column sync | Browser/Client | Frontend Server | synced scroll + anchor alignment is a reactive view concern; anchor read from URL |
| URL canonical state | Frontend Server | Browser | route `/read/:OSIS` normalizes the OSIS param and server-renders chapter data |
| Book/chapter navigation & jumps | Browser/Client | Frontend Server | `next/link` in-page; back/forward handles by router |

## Standard Stack

**Registry-verified this session:** `@supabase/supabase-js` 2.112.2, `@supabase/ssr` 0.12.4, `@tanstack/react-query` 5.101.4, `morphhb` 2.0.2, `supabase` (CLI) 2.112.0, `tailwindcss` 4.3.3. `bible-data-js` does NOT exist on npm (404) — midvash/bible-data is consumed as raw JSON, not an npm package.

### Core

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| Next.js | ^16.x | App Router, RSC, `/read/:OSIS` route | root framework; RSC-able reader, URL-anchored |
| React | 19.x | peer of Next 16 | `use()` for async data in RSC; shadcn base |
| TypeScript | ^5.8 | type safety incl. schema | strict-mode harness rule; Next rejects TS 7 |
| Supabase + PostgreSQL | CLI 2.x; Postgres 15/16 | corpus store, migrations, seeds | harness std; deploy via `.claude/rules/deploy.md` |
| `@supabase/supabase-js` | ^2.112.2 | client fetch | v2 current |
| `@supabase/ssr` | ^0.12.4 | cookie sessions | needed Phase 2 (auth); harmless now |
| TanStack Query v5 | ^5.101.4 | server-state cache | standard pairing; `isPending` semantics |
| Tailwind CSS | ^4.3 | styling | harness std |
| shadcn/ui | ^4 | component layer | harness std (new-york / OKLCH / base-ui) |
| `morphHB` | ^2.0.2 | Hebrew morphology JSON | npm package with WLC + Strong; verified |
| `zod` | ^4 | runtime validation | the spine/OSIS parser contract |

### Internal domain libs (hand-rolled, first-class)

| Library | Purpose |
|---------|---------|
| `lib/reference/reference.ts` | canonical OSIS parse/format util (zod-validated) — the binding contract of the app |
| `lib/bible/` | `getChapter`/`getVerses` read model on DB, server-side |
| `lib/import/` | deterministic node ETL: sources -> normalized -> seeds |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|-----------|----------|---------|
| `morphHB` npm (Hebrew) | parse OSHB OSIS XML directly | npm is lighter; XML parse is extra tooling |
| One-shot import | reproducible ETL | D-07 requires determinism (pin commit SHAs) |
| In-memory columns state | URL as the anchor | D-03/D-04 demand URL; in-memory breaks back/deep-link (costly) |
| Runtime Bible API | self-host Postgres | forbidden; product is a reader (own indexes/FTS) |

**Installation (inside `projects/<nome>/` only, per harness):**
```bash
cd projects/<nome>
npm install @supabase/supabase-js@^2.112 @supabase/ssr @tanstack/react-query@^5 zod
npm install morphhb
npx supabase init   # then supabase db init for migrations
```

## Package Legitimacy Audit

Verified against the npm registry this session:

| Package / dataset | Registry | Version | Verdict | Notes |
|-------------------|----------|---------|---------|-------|
| `morphHB` | npm | 2.0.2 | OK | OSHB morphology; CC BY 4.0 tagging |
| `@supabase/supabase-js` | npm | 2.112.2 | OK | harness core |
| `@tanstack/react-query` | npm | 5.101.4 | OK | harness std |
| `sblgnt` | npm | 1.0.0 | OK (exists) | Greek text; use morphGNT CSV from the repo instead |
| `bible-data-js` | npm | — | **DOES NOT EXIST (404)** | never install; consume midvah/bible-data as raw JSON |
| midvash/bible-data (repo) | GitHub | latest | n/a (repo, not npm) | seam rated SUS only because it is a repo, not a package; it IS the valid source |

**Packages removed:** `bible-data-js` — 404; does not exist on npm. Do not add to package.json.
**Suspicious:** none. The SUS on the repo is a false positive (a GitHub repo through an npm-legitimacy seam). No human-verify install gate required beyond the standard license gate in the ledger.

## Architecture Patterns

### System Architecture Diagram

```
 machine DATA PIPELINE (node/TS, deterministic, pins commit SHAs)
   ┌────────────────────┐
   │ source repos       │
   │  midvash/bible-    │  @fetch per book JSON
   │     data           │  -> normalization to spine -> idempotent seeds
   │  morphHB/WLC       │
   │  morphGNT/SBLGNT   ├─────────────► service_role (server-only) seed
   └────────────────────┘
                                     ▼
                        ┌──────────────────────────────────┐
                        │  Supabase / PostgreSQL  (corpus) │
                        │   verse (spine, PK=canonical id) │
                        │   verse_text (4 translations)    │
                        │   interlinear_word (originals)    │
                        │   license (ledger)      ▼        │
                        └───────────▲──────────────────────┘
                                    │ public read-only (TanStack Query)
 ┌───────────────────────────────────────────────────────────┐
 │ NEXT.JS reader (App Router)                              │
 │  app/(reader)/read/[osis] -> RSC chapter fetch            │
 │   │  synchronized columns (1-3)                           │
 │   └──  anchor = URL param; columns scroll-into-view      │
 │  internal jumps -> next/link /read/:osis                 │
 │  credits page <- license ledger (read-only)             │
 └───────────────────────────────────────────────────────────┘
```

### Recommended Project Structure

```
projects/<nome>/
├── app/
│   ├── (reader)/read/[osis]/        # canonical route (RSC)
│   ├── creditos/                    # Credits page (ledger-driven)
│   └── ...
├── lib/
│   ├── reference/reference.ts        # spine: OSIS parse+validate (unit-tested)
│   ├── bible/                         # getChapter/read-only reads
│   ├── import/                        # ETL: fetch -> normalize -> seed.sql
│   ├── supabase/{client,server}.ts
│   └── seeds/ + supabase/migrations/
├── components/reader/                 # Reader, ReaderColumn, VerseRow, AnchorMarker
├── components/ui/                      # shadcn copy-in (skeleton, sheet, tabs, ...)
└── tests/
```

### Spine Verse ID (DATA-01 — the architectural contract)

"Qual o id de João 3:16" must be settled once. The spine uses an immutable string id = OSIS.book + chapter + verse:

```ts
// lib/reference/reference.ts
import { z } from 'zod';
import { OSIS_BOOKS } from './books';   // Set of 66 canonical OSIS codes

export type OsisRef = `${string}.${number}.${number}`; // e.g. "John.3.16"

export const OsisSchema = z
  .string().regex(/^[a-zA-Z]+\.\d+\.\d+$/)
  .refine(s => OSIS_BOOKS.has(s.split('.')[0].toLowerCase()), { message: 'unknown book' });

// canonical immutable verse identity in the DB
export function verseId(book: string, chapter: number, verse: number): string {
  return `${book.toLowerCase()}.${chapter}.${verse}`; // "john.3.16"
}
```
The `verse` table's primary key is that string; all resources (translations, originals, later notes) join on it. Do NOT anchor by mutable string (STATE.md blocker).

### Original-Language & Strong's storage (DATA-02 / DATA-04)

Phase 3's interlinear joins on `verse_id` + Strong. Store per-word rows separately from the plain `verse_text`:

```sql
-- supabase/migrations/0003_original.sql (partial)
create table interlinear_word (
  id            integer primary key generated always as identity,
  verse_id      text references verse(id),            -- "john.3.16"
  language      text not null check (language in ('hebrew','greek','aramaic')),
  word_number   integer not null,                     -- position within the verse
  strong        text,                                  -- "H5529" / "G3056"
  lemma         text,                                  -- language-normalized lemma
  raw           text,                                  -- original script
  unique (verse_id, language, word_number)
);
```
Anchor intra-verse by the **stable Strong index**, not by mutable translation strings (STATE.md blocker: anchors must not drift when a translation is corrected).

### The data source formats (verified verbatim)

Provenance-tagged facts verified this session:

- **midvash/bible-data** — Book files under `versions/<lang>/<slug>/books/<OSIS>.json`; `Chapter { chapter: number; verses: Verse[] }`, `Verse { number: number; text: string }`. `metadata.json` per version: `slug, name, year, language, license, licenseNote, attribution, sourceUrl, stats, readerUrl`. LicenseTag union in the schema doc: `'public-domain' | 'cc0' | 'cc-by' | 'cc-by-sa' | 'wlc-license'`. Confirmed the 4 needed slugs: `en/kjv`, `en/web`, `en/asv`, `pt/almeida-livre`. The WLC version in midvash is tagged `wlc-license` (not public-domain), so OSHB is the correct Hebrew source. [VERIFIED: README + SCHEMA.md fetched]
- **morphHB (npm `morphhb@2.0.2`)** — OSIS XML -> JSON: object book -> chapter -> verse -> words, each word `[wordString, lemma, morphology]`. Generation flags: `--stripPointing --removeLemmaTypes --prefixLenHWithH --remapVerses` (remap aligns Hebrew to English versification). Lemma carries augmented Strong's (e.g. `c/m/6529`). Text WLC = public domain; lemma/morphology = CC BY 4.0. [VERIFIED: npm + README]
- **morphgnt/sblgnt** — CSV per book (`41-matthew.csv`), columns: `book/chapter/verse, part of speech (text), parsing code, normalized word, lemma`. SBLGNT text subject to EULA; morphology/lemmatization CC BY-SA 3.0. **IMPORTANT: the lemma is NOT Strong's** — a mapping step (e.g. to a lemma-to-Strong table / STEPBible tags) is needed; see Pitfall 3. [CITED: repo README]

### Versification alignment

Hebrew verse numbering differs from English in some books (esp. Psalms). Map the OT verse indexes to the English `(chapter, verse)` grid at import time so translations + originals share the same anchor (morphhb `--remapVerses` does exactly that for Hebrew). Accept a documented "no content" for out-of-range.

### Reader Column-Sync Architecture (D-01, D-02, D-03 — the primary surface)

Facts from UI-SPEC.md (+ this research):

- **Route is canonical, `/read/:OSIS`** (e.g. `/read/John.3.16`). The page reads the ref; the server renders chapter rows for each selected translation (default 1 column = KJV).
- **The anchor is the URL param.** All columns align to the same `(chapter, verse)` index. On anchor change (param change, or user tapping an internal reference link that `next/link`s to a new `/read/:osis`), every column runs a client-side `scroll-into-view` of its anchor row (debounced on programmatic nav, immediate on a user jump).
- Each translation column is its own scroll container showing a **whole chapter** (`D-02`); synchronized by the shared anchor, not by per-input wheel-scroll.
- **1-3 columns.** Opens with 1 (KJV) and a "Adicionar traduções" / `+` affordance; add fills the next free slot, remove closes it; column selection is NOT persisted (URL is the only state).
- **States (from UI-SPEC):** loading = skeleton chapter lines (`isPending`); error = "Não foi possível carregar este capítulo." + retry; partial = a translation lacking the chapter shows inline "Versículo não encontrado nesta tradução"; empty (0 columns) = "Nenhuma tradução exibida" copy.
- Data via TanStack Query per column (`['verseText', translation, book, chapter]`).
- The reader is dark-mode-first (next-themes), serif scripture font (Source Serif 4 / similar) + sans chrome, per UI-SPEC typography.

### Licensing Ledger (D-09 / DATA-05)

Data-driven: a `license` table (one row per source/`usage`) seeded from each source's metadata. Populated automatically at seed time; the Credits page renders it read-only. **Do not hard-code license strings** — the table is the single source of truth. The `LicenseTag` union from the midvash SCHEMA.md (`public-domain | cc0 | cc-by | cc-by-sa | wlc-license`) is a good basis for the `status` enum. Credit the relevant entities: OSHB/MorphHB project, MorphGNT, SBLGNT, the public-domain translations.

### Pattern 1: deterministic ETL / idempotent seed (D-07 / D-08)

A standalone node/TS tool (outside the Next app) that:
1. **pins** each source to a specific commit SHA or released tag (reproducibility, D-07).
2. fetches + parses with a real (midvash JSON, morphHB-mapped, SBLGNT CSV).
3. **write only schema via migrations** (`supabase/migrations/*.sql`), **data via idempotent seeded inserts** — `INSERT ... ON CONFLICT DO UPDATE` / `DO NOTHING` keyed on the canonical verse id (D-08) so a re-run yields the same state.
4. runs against a local Postgres (`supabase db push`) or a remote Supabase project (env-dependent; see Environment).
5. uses `service_role` only server-side / script-side, never bundling it into the browser client.

Seed volume: ~31k verses times (4 translations + originals). Chapter-batched inserts keep it runnable within minutes.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OSIS book codes + parse/validate | reinvent per-window | `lib/reference/reference.ts` (zod) as one shared, tested module | repeated in reader, notes, future search; error-prone if reinvented |
| Lexical/Strong normalization | homegrown alignment | upstream tables (morphHB `--remapVerses`; MorphGNT) + a reconciliation util | Strong/lemma numbering differs between sources; must resolve centrally |
| Reference identity | mutable string | spine = immutable canonical verse id + Strong token index | anchors drift if the string changes (STATE blocker) |
| Server-state fetch | hand-rolled fetch state | TanStack Query v5 | dedup / cache / `isPending`; weakness in a data-heavy reader |
| Auth session (Phase 2+) | hand-rolled cookies | Supabase Auth + `@supabase/ssr` | cookie-based SSR sessions |

**Key insight:** in a data-heavy, reference-heavy app the spine, OSIS parsing, and seed idempotency are the three "deceptively complex" things. Getting the parse/seed wrong reanimate as deep-corner bugs that surface at runtime — the costliest place to find them. Centralize and test them up front.

## Runtime State Inventory

> This phase creates the data (greenfield — no prior corpus), but it deals with runtime/environment state critical to provisioning.
- **Stored data:** None yet. The `verse`/`verse_text`/`interlinear_word` corpus is the first semantic data, loaded during this phase.
- **Live service config:** no app services yet. BUT the environment lacks a local Postgres (Docker missing) — see Environment.
- **OS-registered state:** none.
- **Secrets / env vars:** no secrets this phase; the seed may need a Supabase project URL + service/pg password as env (server-side only; never committed).
- **Build artifacts:** none.

**Action:** the seed task needs a DB endpoint to exist — this is a real setup gate, not a "renamer" migration.

## Common Pitfalls

### Pitfall 1: Docker not installed -> the corpus seed can't run locally
**What goes wrong:** `supabase db push` / seeding fails because there is no local Postgres; `supabase start` needs Docker containers.
**Why:** the Supabase CLI spins Postgres via Docker.
**How to avoid:** settle the DB home EARLY in the plan: (a) install Docker + `supabase start`, or (b) point the seed at a remote Supabase project. Gate every seed task on a `test -f`/`supabase status` connectivity check first.
**Warning signs:** seed task fails with "cannot connect to Docker daemon" or a `psql` connect error.

### Pitfall 2: "public domain" conflated
**What:** naive list of "public domain" hides KJV=US-only, editorial packaging copyright, and the `wlc-license` tag.
**Why:** PD is not uniform; harness blocker.
**Avoid:** the license ledger table keys from the data per version; treat "public domain" per source; note KJV = PD-US.

### Pitfall 3: SBLGNT lemma is not Strong's
**What fails:** the original-original interlinear (Phase 3 / DATA-02) needs Strong numbers, but SBLGNT's column is a lemma, not Strong's.
**Why:** different annotation scheme (morph → Strong requires a separate mapping / other data (e.g. STEPBible tags or a lemma-to-Strong dictionary).
**Avoid:** include a mapping step in the ETL before load, and accept a `null`/pending for unmapped tokens if the source lacks them. Do NOT pretend the lemma == Strong.

### Pitfall 4: versification divergence (OT numbering)
**What:** Hebrew vs English verse numbering differ (Psalms, etc.); naive join comes out misaligned.
**Avoid:** use the parse alignment (for Hebrew `--remapVerses`; for Greek join on verse index) and test a sample book with heavy versification divergence (e.g. Psalm 119).

### Pitfall 5: bundling `service_role` into the client
**What:** any client bundle exposing the Supabase service key breaks the harness deploy gate.
**Why:** `service_role` keys grant god-mode on the DB.
**Avoid:** only server/script code reads the secret; a build check ensures it never ships.

## Code Examples

### Example 1 — OSIS parse util (zod)
```ts
// lib/reference/reference.ts
import { z } from 'zod';
import { OSIS_BOOKS } from '@/lib/reference/books';

const OsisSchema = z
  .string()
  .regex(/^[a-z]+\.\d+\.\d+$/i)
  .refine(s => OSIS_BOOKS.has(s.split('.')[0].toLowerCase()), 'unknown book');

export function refToId(ref: string): string {
  const ok = OsisSchema.parse(ref);
  return ok.toLowerCase(); // "John.3.16" -> "john.3.16"
}
```

**Example 2 — server route fetches a chapter for the reader**
```tsx
// app/(reader)/read/[osis]/page.tsx
import { getChapter } from '@/lib/supabase/server';
export default async function ReadPage({ params }: { params: { osis: string } }) {
  const p = params.osis.split('.');        // validated by lib elsewhere
  const chapter = await getChapter(p[0], Number(p[1]), firstChapter); // returns rows
  const anchor = params.osis;
  return <Reader pageRows={chapter} anchor={anchor} />;
}
```

**Example 3 — idempotent seed (SQL)**
```sql
-- supabase/migrations/00XX_seed_verse.sql (run N = same state)
insert into verse (id, book, chapter, verse)
select id, book, chapter, verse from seed_staging
on conflict (id) do nothing;
```

## State of the Art

| Old approach | Current | When | Impact |
|--------------|---------|------|--------|
| Depend on an external Bible API | self-host Postgres | now | deterministic offline, license-side |
| `next-pwa`/manual SW | Serwist ^9 | 2026 | App Router-native (Phase 4 offline) |
| NA28 / Westminster (commercial) | SBLGNT (morphGNT) + OSHB / morphHB | current | license-compliant interlinear readiness |
| React Query v4 / SWR | TanStack v5 | verified | current |
| Rigid single global store | URL-as-state + query cache | now | reader deep-link + back/forward |

**Deprecated:** `next lint`; TypeScript 7 (Next rejects); `localStorage` for offline data; `bible-api`/`api.bible` as runtime dependency.

## Assumptions & Open Questions

**Assumptions** (need user/plan confirmation):

| # | Claim | Impact if wrong |
|---|-------|-----------------|
| A1 | `almeida-livre` (Almeida 1819) satisfies D-06 "Almeida"; it's the only Almeida midvash carries | if "Almeida" must be modern/RevCorr, the source differs (licensing changes). |
| A2 | morphHB `--remapVerses` aligns Hebrew to English verse numbers | if not, OT offsets; test a book first. |
| A3 | SBLGNT -> Strong mapping is a required extra pipeline step | Greek interlinear Strong token is empty (DATA-02 fails) unless mapped. |
| A4 | Local Postgres will be available at seed time (Docker or remote) | seed can't run locally -> plan must gate on DB home. |
| A5 | The 4 translations cover the ledger's "every row has its source in metadata" | ok for the scheme; if a translation's licensing deviates, the ledger row is the record. |

**Open Questions**
1. Which DB host for the phase seed — install Docker + `supabase start`, or a remote Supabase project? (Environment risk — resolve in the plan / discuss.)
2. Which "Almeida"? Only Almeida 1819 is public-domain in midvash; Ok to use Almeida 1819 for D-06 SC1 (KJV + WEB side-by-side) — confirm if a later RevCorr is wanted (licensing later).
3. Do the Success Criteria 1 and 2 require two translation columns live side by side for the skeleton (D-05) at gate time? Likely yes — SC1 explicitly says "2+ traduções lado a lado".

## Validation Architecture

> nyquist_validation = true (config.json). Include.

### Test framework
| Property | Value |
|----------|-------|
| Framework | Vitest (harness rule: TDD RED-GREEN-REFACTOR) |
| Config | `vitest.config.ts` (project root) |
| Quick run | `vitest run lib` |
| Full suite | `npx vitest run` |

### Requirements -> Test Map
| Req | Behavior | Type | Command | Note |
|-----|----------|------|---------|------|
| READ-01 | parse/format OSIS | unit | `vitest run lib/reference` | boundary cases (bad codes, ranges) |
| READ-01 | getChapter returns folded rows for 2 translations | integration | `vitest run` with a test DB | needs a seeded DB |
| READ-02 | back/forward restores anchor | e2e (light) | — | manual / back-end check (URL) |
| DATA-01 | seed is idempotent (re-run = same state) | integration | a seed self-check | CI or script |
| DATA-05 | ledger has a row for every data source | integration | SQL / test | ensures none missed |
| DATA-02 | interlinear solved for a sampled verse | integration | SQL check | e.g. John 3:16 |

### Wave 0 Gaps
- None yet (greenfield). First gap: create `tests/lib/reference` + Vitest config, and the seed-idempotency test.

## Security Domain

**security_enforcement = true** (config). Include ASVS.
### Applicable ASVS
| ASVS | Applies | Standard control |
|------|---------|------------------|
| Input validation (V5) | yes | zod on the OSIS param and route realm; allow-list of book codes |
| Access control (V4) | partial | bible data & ledger are public read-only; no user data to protect this Phase |
| Auth/Session (V2/V3) | no | Phase 2 |
| Cryptography (V6) | no | none needed this Phase |

**Threat patterns:**
| Pattern | STRIDE | Standard mitigation |
|---------|--------|---------------------|
| OSIS/URL injection | Tampering | zod parse; parametrized SQL; never raw string SQL |
| Malicious seed data (compromised source) | Tampering | treat corpus data as foreign; validate/escape on insert; server-only key |
| `service_role` in client bundle | Information disclosure | never bundle; server/ETL only |

## Sources

### Primary (HIGH, verified this session)
- midvash/bible-data — SCHEMA.md (Verse/Book/Metadata/LicenseTag) & README (list: `kjv`, `web`, `asv`, `almeida-livre`; `wlc-license`). [VERIFIED]
- openscriptures/morphhb — README (lemma/morph/id attributes; OSIS XML->JSON npm; flags incl `--remapVerses`; CC BY 4.0 tagging of public-domain WLC) [VERIFIED]
- morphgnt/sblgnt — README (CSV columns; SBLGNT EULA text; morphology/lemma CC BY-SA 3.0; lemma not Strong) [CITED]
- npm registry — pkg versions verified (see stack + legitimacy tables) [VERIFIED]

### Secondary (MEDIUM)
- `.planning/research/STACK.md` — data layer (OSHB/STEPBible/HebrewLexicon, licensing flags, FTS). [CITED]
- `.claude/CLAUDE.md` — harness stack (Next 16.3, React 19, Tailwind v4, shadcn 4). [CITED]
- `.planning/phases/01/01-UI-SPEC.md` — reader contract (colors, timing, states, mobile). [CITED]

### Tertiary (LOW)
- Macro web/secondary-arch evidence not confirmed (web-search providers disabled this session).

## Metadata

- **Confidence breakdown:** stack HIGH (registry-verified); dataset HIGH (schemas fetched); pipeline/ETL MEDIUM (Docker unavailability raises the seed's runtime risk); architecture HIGH.
- **Research date:** 2026-08-07.
- **Valid until:** 2026-09-05 (30 days; the dataset is slow-changing; reconsider on plan/execution).