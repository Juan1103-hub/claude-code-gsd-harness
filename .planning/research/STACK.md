# Stack Research

**Domain:** Data-heavy deep Bible study web app (PWA) — multi-version reader, original-language texts, lexicons, maps/timelines, notes, offline, Supabase backend
**Researched:** 2026-08-06
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Next.js** | 16.x (LTS, current 16.3.0) | App framework, App Router, RSC | Next.js 15 hits EOL 2026-10-21; a greenfield app started now must begin on 16. Turbopack builds are the default path, typed routes stable, and it is the only framework with first-class React 19 + RSC support on Vercel. Next.js 16.2.10 is the minimum supported line; pin `^16.3.0`. |
| **React** | 19.x (19.2.x) | UI runtime | Shipped as the peer dependency of Next.js 16 and the current shadcn/ui base. React 19's `use()` for async data in RSC and compiler-backed rendering are table stakes in 2026. |
| **TypeScript** | ^5.x (5.8+; TS 7 is NOT yet supported by Next.js — Next.js currently rejects TypeScript 7.0) | Type safety | Strict mode is a harness rule. Note: Next.js explicitly rejects TS 7.0+ with an actionable error until the compiler catches up — stay on TS 5.x. |
| **Tailwind CSS** | 4.x (current 4.3+) | Styling | Tailwind v4 (released Jan 2025) is now the stable default: CSS-first `@theme` config, automatic content detection, no `tailwind.config.js` needed, ~70% smaller CSS output, 100x faster incremental builds. Use `@tailwindcss/postcss` (Next.js uses PostCSS integration, NOT the Vite plugin). |
| **shadcn/ui** | CLI 4.x (current shadcn@4.16.2) | Component system | The standard component layer for Tailwind v4 + React 19 + Next.js. `npx shadcn@latest init` scaffolds into your repo (copy-in, no runtime dep). Base UI is the default primitive base; Radix still fully supported; React Aria is now a first-class option. Use `new-york` style, OKLCH palette, `sonner` for toasts (deprecates old `toast`). |
| **Supabase** | @supabase/supabase-js ^2.112.x, @supabase/ssr ^0.5.x, @supabase/realtime-js (bundled) | Auth, Postgres data, RLS, Realtime, Storage | Harness standard (`.claude/rules/deploy.md`). supabase-js 2.112.1 is current (2026-08-05); requires Node 22+ (Node 20 EOL Apr 2026 dropped in 2.110.0). RLS policies gate ALL business data; `service_role` key is server-only. Plan for the `@supabase/ssr` package for cookie-based sessions with Next.js App Router (server components + middleware). |
| **Vercel** | platform | Deploy/hosting | Harness standard. Native Next.js 16 support, ISR/SSR, edge. Deploy per `.claude/rules/deploy.md` (security headers, env vars in dashboard). |
| **TanStack Query** | @tanstack/react-query ^5.101.x | Server-state cache | Supabase-js fetches data but does NOT manage client state. TanStack Query v5 is the standard pairing: caching, dedup, optimistic updates, refetch-on-reconnect, infinite scroll for concordance results. v5 renamed `isLoading`→`isPending`; `onSuccess`/`onError` removed from `useQuery` (use `useMutation` callbacks or effects). Requires `.throwOnError()` on Supabase calls or errors silently surface as `data: undefined`. |
| **idb** | ^8.x | IndexedDB Promise wrapper | The offline data floor for this PWA. Thin Promise wrapper (by Jake Archibald, Workbox's own choice) — right size for a sync queue and cached verse/lexicon reads. Prefer `idb` over Dexie unless you need live queries/observables (see Alternatives). |
| **Serwist** | ^9.x | Service worker / PWA layer | Modern, actively-maintained successor to `next-pwa` and Workbox-for-Next. Designed cleanly for Next.js 16 App Router, generates precache manifest from build output, TypeScript-first `sw.ts`. Skip `next-pwa` (stale, App Router support unreliable). Caching per the strategy matrix in ARCHITECTURE.md. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **Tiptap** (@tiptap/react) | ^3.29.x | Rich-text notes editor | Notes/highlights/study editor. Headless ProseMirror wrapper, MIT, extension-based, React 19 compatible (has `'use client'` directive). Enables custom nodes for inline verse references, Hebrew/Greek spans, and later collaborative editing via Y.js/Hocuspocus. Do NOT use in SSR — mount client-side. |
| **@tiptap/extension-collaboration + yjs** | ^3.x / ^13.x | CRDT collaboration (later phase) | If multi-user editing of shared studies becomes a requirement (EST-12). Tiptap's official collab path. For v1 single-user notes, skip — Supabase Realtime for presence is enough. |
| **react-leaflet + leaflet** | react-leaflet ^5.x, leaflet ^1.9.x | Interactive biblical maps | Free, no API key, OpenStreetMap tiles (mitigate: use a tile provider with proper attribution, e.g. OpenStreetMap or Stadia/Carto free tier). Supports markers, GeoJSON overlays, polylines for journeys, clustering. Load dynamically (no SSR — `next/dynamic` with `ssr: false`). This is the exact stack a reference implementation of a Christian holy-sites map app uses. |
| **lucide-react** | ^0.5xx | Icons | Harness standard. |
| **framer-motion** | ^12.x | Animations/transitions | Harness standard. Use sparingly — the reader is content-heavy; animation is a feel multiplier, not the core. |
| **clsx + tailwind-merge** | ^2.x / ^3.x | `cn()` util | shadcn/ui standard for conditional class merging. |
| **next-themes** | ^0.4.x | Dark mode | Reader apps are dark-mode-heavy. Avoids hydration mismatch; sets `class` on `<html>`. |
| **zod** | ^4.x | Runtime validation | Validate Bible reference parsing, user input, and API boundaries. AI SDK 5 also expects zod ^4. |
| **@supabase-cache-helpers/postgrest-react-query** | ^1.x | Typed Supabase + TanStack Query integration | Optional DX win: auto query keys + typed fetchers from Supabase tables. Consider early — it removes whole classes of query-key bugs. |
| **@vercel/analytics** | ^1.x | Analytics | Harness/template standard. |
| **react-markdown / unified** | ^9.x / ^11.x | Render curated content and user notes as Markdown | Curated study content (context, dictionary articles) lives as markdown-friendly structured data; export path reuses it. |

### Original-Language & Reference Data Layer (the app's spine)

This is the highest-risk domain-specific part of the stack. **Recommendation: self-host all reference datasets (Bible texts, interlinear, lexicons) in Supabase/Postgres and serve via API — do NOT depend on any third-party hosted Bible API as a runtime dependency.** Rationale: your product is a *reader with full-text and lexical querying*, which requires your own indexes and schema. Public APIs are fine for prototypes; they are rate-limited, hobby-maintained, or push licensing variance onto your users. Data is cheap to store (~200–500MB total), immutable, and perfectly cacheable.

| Dataset | License | Use | Source (confidence) |
|---------|---------|-----|---------------------|
| **Public-domain translations** (KJV 1769, ASV, WEB, Almeida, Leningrad Codex, Textus Receptus) | Public domain / free redistribution | Multi-version reader, side-by-side | **midvash/bible-data** — 33 PD versions across 22 languages, JSON + SQLite, OSIS book codes, consistent schema (HIGH). Includes WLC, TR, Vulgate, Luther, Segond, Almeida 1819. |
| **Greek NT: SBLGNT** | SBLGNT EULA + CC BY 4.0 text | Original Greek with morphology | **LogosBible/SBLGNT** (text, CC BY 4.0) + **morphgnt/sblgnt** (morphology/lemmatization, CC BY-SA 3.0) (HIGH). Use SBLGNT, not NA28 — NA28 is commercially restricted. |
| **Hebrew OT: Westminster Leningrad Codex (WLC)** | WLC text = public domain | Original Hebrew | **openscriptures/morphhb** — WLC text PD + lemma/morphology CC BY 4.0, OSIS XML → publish JSON via npm `morphhb` (HIGH). **WARNING:** the *Westminster Hebrew Morphology* database itself (Groves Center) requires commercial licensing for commercial use — the OpenScriptures CC BY 4.0 re-tagging avoids this. Use OSHB/morphhb, not raw Groves files. |
| **Strong's dictionaries** | Public domain (KJV-era); CC BY-SA 4.0 tags in openscriptures | Dictionary/concordance spine | **openscriptures/strongs** — Hebrew H1–H8674 + Greek G1–G5624 with original script, transliteration, pronunciation, definitions (HIGH). |
| **BDB Hebrew lexicon** | BDB text public domain; OSHB compilation CC BY 4.0 | Deep Hebrew lexical entries | **openscriptures/HebrewLexicon** — BDB + Strong's + TWOT cross-referenced (MEDIUM-HIGH; marked "work in progress" — entries partially completed). |
| **STEPBible datasets** | CC BY 4.0 | Curated scholarly cross-references, extended Strong's, genealogical/name data, interlinear tagging | **STEPBible/STEPBible-Data** (Tyndale House) — includes TAGNT/TAGHB (extended Strong's word-by-word), genealogies, proper names with Hebrew/Greek, toponyms (HIGH). Valuable for EST-02/03/04/06/07/10. |
| **Smith's / Hastings' / Nave's / Torrey's dictionaries & topical index** | Public domain | Dictionary + topical cross-references | **spearssoftware/gnosis** aggregates these into clean JSON/SQLite with Strong's links (MEDIUM — community-curated; verify attribution). Or pull originals directly from eBible.org / sacred-texts mirrors. |
| **bible-cross-references** (midvash) | Free redistribution | Related-passage links (EST-10) | midvash companion dataset (MEDIUM-HIGH). |

**Dataset licensing flags (do-not-miss):**
- **Commercial modern translations (NIV, ESV, NAA, NVI, NLT) are a commercial dead-end for v1** — cost, quotes, and redistribution restrictions. ESV is *the* common trap: STEPBible's TTESV tags reference it, but the ESV *text* is a separate commercial license. Your PROJECT.md already scopes these out — this research confirms it (HIGH).
- SBLGNT is CC BY 4.0 but has its own EULA terms; fine for commercial use with attribution.
- The **Westminster Hebrew Morphology** (Groves Center) is NOT free for commercial — the OpenScriptures OSHB morphhb tagging (CC BY 4.0) is the legal path.
- **Midvash's bible-data** is the pragmatic single-source starter (one schema, OSIS codes, SQLite export) — import it, then enrich with SBLGNT/morphhb/STEPBible. Do not treat any hosted midvash/helloao API as production runtime infrastructure.

### Search Layer (on Supabase/Postgres)

| Technology | Purpose | Why |
|------------|---------|-----|
| **Postgres FTS (`tsvector`/`tsquery`/`ts_rank`, GIN index)** | Full-text search across translations + curated content | Built into Supabase, zero extra infra. English + Portuguese need separate GIN expression indexes (`to_tsvector('english', ...)` OR `to_tsvector('portuguese', ...)`) with `GREATEST(ts_rank(...))` — this dual-language PT/EN pattern is proven (HIGH). For verse search, index a generated `search_vector` column. |
| **`pg_trgm`** | Fuzzy name/place/word matching, autocomplete, typo tolerance | Language-agnostic trigram similarity — perfect for biblical names and Strong's transliterations where users will misspell ("philippi", "Jeshu"). GIN trigram index. |
| **`pgroonga`** | (Optional) CJK support | Only needed if you add Chinese/Japanese UI — the native PG FTS parser doesn't tokenize CJK. SKIP for v1 (PT/EN/ES). |
| **`pgvector`** | Semantic search + AI tutor RAG (post-foundation phase) | Later, for the AI theology tutor with sources: embed verses/curated content, HNSW index, hybrid search (FTS + vector with score fusion). Defer — not v1. |
| **`unaccent`** | Accent-insensitive search | Bible names carry diacritics (hé, résurrection); strip before indexing/querying. |
| **Typesense / Meilisearch / Algolia** | — | NOT recommended for v1. Your corpus is a few million rows at most and read-mostly; Postgres handles it. Re-evaluate only if autocomplete p95 > 50–100ms or you hit >10M docs. |

### Offline / PWA Layer (verified pattern for this app class)

Confirmed by 2026 research (LogRocket Next.js 16 PWA guide, local-first architecture analyses, Supabase+IndexedDB production writeups):

| Technology | Role | Why |
|------------|------|-----|
| **Serwist** service worker | App shell precache, strategy matrix | Stale-while-revalidate for hashed JS/CSS; network-first (3s timeout) for API/verse data; cache-first for images/fonts. Never intercept navigation to fake "offline" errors. |
| **IndexedDB via `idb`** | Local verse/lexicon cache + notes outbox | Reference data (bible texts, lexicons) is immutable and *should* be fully offline-cacheable after first read. User notes/studies write to IndexedDB first (optimistic), sync to Supabase on reconnect (Local-first pattern: device = primary copy, Supabase = sync peer). |
| **Background Sync API** | Queue replay when connectivity returns | Progressive enhancement — Safari/Firefox lack it; degrade to in-page retry + online-event listener. |
| **`navigator.storage.persist()`** | Protect origin from eviction | Bible dataset is ~200–500MB; must request persistence. Note iOS 7-day auto-clear wipes idle PWAs — design re-cache strategy accordingly. |

The dataset fits offline comfortably: whole-bible JSON for one translation ~2–4MB (1.5MB brotli-compressed for all books per fetch.bible data); WLC Hebrew ~13MB; SBLGNT ~4MB. A curated offline bundle of 2–3 translations + WLC + SBLGNT + Strong's is under 100MB — realistic for an installable PWA with `storage.persist()`.

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Node.js | ^22 LTS (or 24) | supabase-js 2.110.0+ dropped Node 20. Next.js 16 requires Node 20.9+ but recommend 22 LTS for the supported window. |
| pnpm (or npm) | Package manager | pnpm preferred for monorepo/workspace; harness uses npm — either works. |
| Supabase CLI (`supabase`) | Local dev + migrations | `supabase start` for local stack, `supabase db push` for migrations — NEVER edit production schema by hand (harness deploy rule). |
| `create-next-app` | Scaffold | `npx create-next-app@latest --typescript --tailwind --eslint --app --src-dir` — ships Tailwind v4 wired already. |
| shadcn CLI | Component install | `npx shadcn@latest init` then `npx shadcn@latest add [component]` per screen. |
| Vitest | Testing | Harness testing rule: TDD RED-GREEN-REFACTOR. Vitest is the standard for Vite/Turbopack tooling. |
| ESLint + typescript-eslint | Linting | `next lint` is deprecated (Next 15.5+); use ESLint 9 flat config directly. |

## Installation

```bash
# Scaffold (Tailwind v4 + TypeScript wired automatically)
npx create-next-app@latest bible-study --typescript --tailwind --eslint --app --src-dir
cd bible-study

# Core framework + UI
npm install @tanstack/react-query@^5 lucide-react framer-motion next-themes zod clsx tailwind-merge
npm install @supabase/supabase-js@^2.112 @supabase/ssr @supabase-cache-helpers/postgrest-react-query

# shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button tabs dialog sheet dropdown-menu scroll-area tooltip sonner separator skeleton

# Notes editor + maps
npm install @tiptap/react @tiptap/starter-kit @tiptap/pm
npm install react-leaflet leaflet

# PWA / offline
npm install serwist @serwist/next idb

# Dev dependencies
npm install -D vitest @vitejs/plugin-react @types/leaflet

# Supabase
npx supabase init
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js 16 (App Router) | Vite + React SPA | Only if you abandon SSR/SEO and Vercel ISR. The reader's per-verse routes (`/read/GEN.1.1`, `/study/GEN.1.1`) benefit from ISR + static generation; a pure SPA loses SEO for shareable verse links and the AI tutor's streaming SSR route. |
| Next.js 16 | Next.js 15 (LTS) | Only to match existing codebases. Starting greenfield in Aug 2026 on 15 means a forced migration within ~3 months (EOL 2026-10-21). Do not start new on 15. |
| Tailwind v4 | Tailwind v3 | v3 is still widely deployed but v4 is the default for new projects: smaller CSS, faster builds, CSS-first config. No reason to start v1 of this app on v3. |
| Serwist | next-pwa / @ducanh2912/next-pwa | next-pwa is stale with weak App Router support. @ducanh2912/next-pwa works but Serwist is the actively maintained, TS-first choice with a documented Next 16 path. |
| idb | Dexie.js | Dexie wins when you need observable live queries and a heavier schema (multi-tab sync, RxJS). For a sync queue + read-through verse cache, `idb`'s minimalism is correct. Upgrade path is additive. |
| Self-hosted reference data (Supabase) | Hosted APIs (api.bible, bible-api.com, helloao, midvash, fetch.bible) | Third-party APIs are fine for a prototype demo; NOT for the product. api.bible's *free* tier excludes most copyrighted translations and has rate limits; bible-api.com is a hobby service explicitly rate-limited and may go down; helloao/midvash are community-run. Your app is a reader+searcher — you need the schema, indexes, and full-text in your own DB. |
| Postgres FTS + pg_trgm | Typesense / Meilisearch / Elasticsearch | Corpus is ~31K verses × N translations + ~14K lexicon entries + curated content — a few million rows. Postgres GIN handles this at <50ms. Add a dedicated engine only if you need faceting/synonyms/huge-scale autocomplete. |
| SBLGNT + OSHB | NA28 / Nestle-Aland, BHS print-critical | NA28 text requires commercial licensing; SBLGNT (CC BY 4.0) and OSHB WLC (PD) are the scholarly-standard open route with morphology. |
| Tiptap | Lexical (Meta), Slate, Plate | Lexical is Meta-backed but React tooling/extension ecosystem is thinner and verse-reference inline nodes are more work; Slate is lower-level (your team maintains a lot). Tiptap v3's React story (declarative `<Tiptap />` component, `useEditorState`) and 100+ extensions fit the notes/study editor with custom verse-reference marks. |
| react-leaflet | Mapbox GL JS, MapLibre, Google Maps | Mapbox/Google require API keys + commercial tiers; MapLibre needs a self-hosted tile vector stack. react-leaflet + OSM raster is free, zero-key, and plenty for biblical maps (routes, markers, regions). |
| sql.js / OPFS-SQLite | IndexedDB (idb) | OPFS-SQLite WASM is the "ceiling" for browser relational offline. Overkill for v1: your offline corpus is static JSON (read-through cache) + a notes outbox (document-shaped). Revisit only if client-side concordance queries over 100MB+ become a requirement. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Commercial Bible translations (NIV, ESV, NAA, NVI, NLT, NAA)** | Licensing: quotes required, redistribution restricted, API usage fees (api.bible charges for copyrighted translations). A commercial wall for a study app whose core is reading multiple versions. ESV especially — its STEPBible "tags" are licensed separately from the ESV text. | Public domain: KJV 1769, ASV, WEB, Almeida, Leningrad Codex, Textus Receptus. |
| **Nestle-Aland / NA28 GNT, BHS (Hebrew)** | Commercial critical-text editions; can't redistribute, no per-word lemma/morphology in open form. | SBLGNT (CC BY 4.0) + morphgnt; OSHB WLC + morphhb. |
| **Westminster Hebrew Morphology (Groves Center files)** | Commercial use requires licensing fees (explicitly stated). | OpenScriptures OSHB `morphhb` (CC BY 4.0 re-tagging of the same WLC base). |
| **next-pwa** | Stale; App Router support is unreliable; `output: export` assumptions fight the App Router's RSC/SSR model. | Serwist (active, Next 16-native). |
| **`next lint`** | Deprecated since Next 15.5. | ESLint 9 flat config + typescript-eslint directly. |
| **TypeScript 7.x** | Next.js currently rejects TS 7.0 with an explicit error (compiler not ready). | Pin TypeScript ^5.x (5.8+). |
| **Node.js 20** | EOL Apr 2026; supabase-js dropped support at 2.110.0. | Node 22 LTS (or 24). |
| **localStorage for offline data** | Sync, string-only, ~5MB cap — cannot hold verse/lexicon cache or a notes outbox. | IndexedDB via `idb`. |
| **Google Maps / Mapbox for biblical maps** | API keys, commercial billing, ToS friction; no real benefit for region/marker/routes maps. | react-leaflet + OpenStreetMap tiles. |
| **React State only for server data (useState/useEffect fetch everywhere)** | Duplicate fetches, no caching, no dedup, no optimistic updates — fatal for a data-heavy reader. | TanStack Query v5 for all server state. |
| **tone / inflection-based Bible navigation wheels reinvented per-component** | Reference parsing (e.g. "João 3:16-18") is core and error-prone. | Centralize a reference-parsing util (zod-validated) as a shared lib; use OSIS book codes as canonical keys end-to-end (matching bible-data/morphhb schemas). |
| **WordPress/plugin-based Bible rendering** | Irrelevant to a first-class app architecture. | Native React reader components. |

## Stack Patterns by Variant

**If you ship v1 without the AI tutor** (recommended per PROJECT.md scope):
- Stack above unchanged; `pgvector` and `@ai-sdk/*` and Tiptap collaboration extensions are NOT in v1.
- Reserve the `pgvector` schema (embeddings table + HNSW index) and the AI SDK route shape now, so the later phase slots in without a re-architecture.

**If you later add the AI theology tutor (EST-13):**
- Add **Vercel AI SDK 5.x** (`ai@^5`, `@ai-sdk/react`, provider package, `@ai-sdk/anthropic` or OpenAI). AI SDK 5 is the standard streaming toolkit for Next.js + React 19: SSE streaming default, provider-agnostic (Anthropic/OpenAI/Gemini swap in one line), `useChat`/`useObject` hooks, RSC generative UI. Latest is v7 line for the `ai` core (`ai@^7.0.55`, `@ai-sdk/react@^4.0.x`) — use the current stable major, not 4.x.
- Ground answers with **sources**: RAG over curated content via `pgvector` HNSW + FTS hybrid; the model must cite verse/lexicon IDs it was retrieved from (your core value demands impartial sourcing).
- **zod ^4** for structured tool/object streaming.
- The `ai` package now defaults to Vercel AI Gateway — set your provider SDK directly (`@ai-sdk/anthropic`) to avoid gateway coupling.

**If you add real-time collaborative study groups (EST-12):**
- **Supabase Realtime** is sufficient for v1 collaboration: Postgres Changes (persisted shared notes/comments), Presence (who's online/editing), Broadcast (typing indicators, live cursors, throttled to ≤20 events/s). Constraints: Pro plan 500 connections, 100 channels/connection, 100 presence users/channel; re-track on `visibilitychange` (stale presence bug); always `removeChannel` on unmount; feature-detect Background Sync (Safari/Firefox lack it).
- Only if you need true multi-user CRDT editing of a *single* document (docs-style) do you add **Y.js + Hocuspocus** — and that is a distinct, later, higher-cost decision. Tiptap's collab extension exists and works; do not conflate "shared studies" (rows in Supabase) with "live doc editing" (Y.js).

**If you need CJK-language UI (Chinese/Japanese users):**
- Native PG FTS can't tokenize CJK — add **pgroonga** (N-gram tokenizer, `&@~` operator) or zhparser. Not a v1 concern (PT/EN/ES).

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| next@^16.3 | react@^19.2, @types/react@^19 | Next 16 requires React 19. |
| next@16.x | typescript ^5.x | Next rejects TypeScript 7.0 (explicit error). Stay ≤5.9. |
| tailwindcss@^4.3 | @tailwindcss/postcss | Next.js uses the PostCSS integration, NOT `@tailwindcss/vite`. |
| shadcn CLI ^4.16 | tailwind v4 + react 19 | `--base aria` option exists; default Base UI is fine. New-york style default; toasts via `sonner`. |
| @supabase/supabase-js ^2.112 | Node ≥22 | Node 20 support dropped at 2.110.0 (EOL 2026-04-30). |
| @supabase/supabase-js ^2.112 | TypeScript ≥5.0 | TS 4.7–4.9 dropped Jan 2027. |
| @tanstack/react-query ^5.101 | react 19 | `isPending`/`useSuspenseQuery` semantics; remove `onSuccess` from `useQuery`. |
| @tiptap/react ^3.29 | react 19, Next 16 | Add `'use client'`; set `immediatelyRender: false` in SSR contexts; use `useEditorState` for perf. |
| react-leaflet ^5 | react 19, next 16 | Must render client-side: `import dynamic from 'next/dynamic'; const Map = dynamic(() => import('@/components/Map'), { ssr: false })`. |
| serwist ^9 / @serwist/next ^9 | next 16 | Documented App Router + Next 16 path; generates `sw.js` from `app/sw.ts`. |
| AI SDK (ai@^7, @ai-sdk/react@^4) | next 16, react 19, zod ^4 | Later phase; not in v1 install. |

## Key Domain-Specific Decisions Summary

1. **Self-host all Bible/reference data in Supabase/Postgres.** Design a schema around canonical OSIS book codes + consistent verse keys so translations, WLC, SBLGNT, Strong's, cross-references all join on `(book, chapter, verse)` and `(strong_number)`. Ship a data-import pipeline (SQL seed scripts via `supabase db push`) rather than runtime API calls.
2. **Translation set for v1:** PT + EN public domain — Almeida (1819/RC variants), KJV, ASV, WEB, plus original-language WLC + SBLGNT (interlinear-ready). This satisfies side-by-side reading and original-language study (EST-01, EST-03) entirely on public-domain/licensed-open data.
3. **The offline story is a core feature, not an afterthought** for a study app (bible users study in churches/offline contexts): Serwist + IndexedDB read-through cache for immutable scripture data, plus a local-first notes outbox synced to Supabase (mirrors the documented Next.js+IndexedDB+Supabase production pattern).
4. **Search is Postgres-native** (FTS PT+EN dual GIN indexes + pg_trgm + unaccent) until the corpus forces otherwise; semantic search via pgvector is the AI-phase addition.
5. **Notes editor = Tiptap**, maps = react-leaflet, dark-mode-first UI = next-themes + shadcn, everything server state = TanStack Query. These five choices cover the functional breadth (reader, lexical study, notes, maps, search) without bespoke engine-building.

## Sources

- Next.js releases/EOL: endoflife.date/nextjs, endoflife.ai/nextjs, versionlog.com/nextjs/15, nextjs.org/blog/next-15-5 — verified current stable 16.3.0; 15 EOL 2026-10-21. [HIGH]
- TypeScript 7 rejection + security advisories: releases.sh/vercel/nextjs. [HIGH]
- Tailwind v4: tailwindcss.com/blog/tailwindcss-v4, official Next.js install guide (nextjs.org/docs/app/getting-started/css, Next 16.3.0), tailgrids Next.js 16 + Tailwind v4 guide. [HIGH]
- shadcn/ui: ui.shadcn.com/docs/tailwind-v4, changelog (March 2026 CLI v4, React Aria base, sonner), npm shadcn@4.16.2. [HIGH]
- Supabase JS: npm @supabase/supabase-js (2.112.1), GitHub releases, supabase.com/changelog (Node 20 drop, TS 5.0 requirement). [HIGH]
- Bible data: midvash/bible-data & bible-data-js (33 versions/22 langs, PD), openscriptures/morphhb (WLC + CC BY 4.0 morphology), LogosBible/SBLGNT + morphgnt/sblgnt (CC BY 4.0), openscriptures/strongs, openscriptures/HebrewLexicon (BDB CC BY 4.0), STEPBible-Data (CC BY 4.0), grovescenter.org licensing warning (WHM commercial), spearssoftware/gnosis. [HIGH]
- Bible APIs compared: api.bible, bible-api.com (hobby, rate-limited), bible.helloao.org, api.midvash.com, fetch.bible (per-translation terms, CDN approach). [HIGH]
- PWA/offline: LogRocket "Build a Next.js 16 PWA with true offline support" (2026-01), openreplay local-first PWA architecture, stripesys offline-first PWA, wellally Next.js+IndexedDB+Supabase production writeup, hidekazu-konishi service worker guide, youngju.dev sync-engine deep dive (Workbox 8, IndexedDB/Dexie/idb). [HIGH]
- Search: supabase.com/docs full-text-search & pgroonga, danlevy.net Postgres text search guide 2026, dev.to FTS+pgroonga, PT+EN dual tsvector PR (#167), markaicode Supabase search 2026. [HIGH]
- Realtime: supabase.com/docs/guides/realtime (Broadcast/Presence/Postgres Changes), agilesoftlabs Realtime production limits (2026), easton.dev Realtime modes & reconnection. [HIGH]
- TanStack Query: npm @tanstack/react-query (5.101.4), tanstack.com v5 docs, makerkit Supabase+React Query v5 (Jan 2026), supabase.com blog cache helpers, tomodahinata v5 guide. [HIGH]
- Tiptap: npm @tiptap/react (3.29.2), GitHub releases/changelog, tiptap.dev (React 19, `use client`, collab via Y.js/Hocuspocus). [HIGH]
- Maps: react-leaflet.js.org (v5, Leaflet 1.9), OrbDei reference implementation (Next.js + Leaflet + OSM). [MEDIUM]
- AI SDK: ai-sdk.dev v5 docs, vercel.com/blog/ai-sdk-5, npm @ai-sdk/react (4.0.58, ai 7.0.55), migration guides (4.x→5.0, zod ^4). [HIGH]

---
*Stack research for: deep Bible study web app (PWA)*
*Researched: 2026-08-06*
