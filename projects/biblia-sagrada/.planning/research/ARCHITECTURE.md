# Architecture Research

**Domain:** Deep Bible study web platform (PWA)
**Researched:** 2026-08-06
**Confidence:** HIGH (core patterns confirmed across multiple independent projects + web.dev/Edge PWA references)

---

## Standard Architecture

### System Overview

Deep Bible study apps converge on a **two-tier data split** (immutable reference data vs per-user mutable data) overlaying a **single verse-reference spine** that every feature hangs off. This is the single most important architecture fact in this domain.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       PRESENTATION (React / Next.js)                    │
│                                                                          │
│  ┌────────────┐  ┌──────────────┐  ┌───────────┐  ┌──────────────────┐  │
│  │  Reader     │  │ Interlinear/ │  │ Dictionary │  │ Timeline / Maps / │  │
│  │  (parallel  │  │ original     │  │ + Concord  │  │ Genealogy + Notes │  │
│  │  translations│ │  language    │  │           │  │ methods           │  │
│  └──────┬──────┘  └──────┬───────┘  └─────┬─────┘  └────────┬─────────┘  │
└─────────┼────────────────┼────────────────┼──────────────────┼───────────┘
          │  all read/write against the SAME reference identity (verse id)
┌─────────▼────────────────▼────────────────▼──────────────────▼──────────┐
│  DATA ACCESS LAYER (client)                                             │
│   data hooks (React Query/SWR)  ⇄  Offline store (Cache API +            │
│   IndexedDB)                                                             │
└──────────────────────────────────────────────────────────────────────────┘
┌────────────────────────────┐  ┌─────────────────────────────────────────┐
│  USER DATA (mutable)       │  │  REFERENCE DATA (immutable, global)     │
│  Supabase/Postgres + RLS   │  │  verse, lexicons, dictionaries, maps,   │
│  notes, highlights, tags,  │  │  crossrefs, people, places, events      │
│  studies, groups, share    │  │  ⟶ public read-only; cached offline     │
└────────────────────────────┘  └─────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Canonical verse/entity id (the spine)** | One stable, immutable identifier for every verse and entity (word, place, person, event, topic) that every other system keys off | Imported once from OSIS/SWORD; each feature references by id |
| **Bible text store** | Verses by translation; returns book/chapter/parallel-compare text | Reference rows keyed `(translation, book, chapter, verse)`; immutable |
| **Lexicon / interlinear store** | Word-level original-language (Hebrew/Aramaic/Greek) analysis, morphology, Strong's numbers | Reference tables `lexicon_entry`, `interlinear_word` keyed to verse + Strong's id |
| **Entity graph / crossref store** | Cross-references and people/places/events relationships | Reference tables `crossref`, `person`, `place`, `event`, `timeline` |
| **Notes / annotations store (user)** | Highlights, notes, categories/tags, relations between verses, personal studies | Supabase Postgres + RLS; rows keyed by canonical verse id (+ intra-verse anchor) |
| **Auth + user identity** | Sign-in/out, profiles, sharing between users/groups | Supabase Auth (email/Google) + `auth.users` link |
| **Search index** | Keyword and subject search over verse + notes | Postgres FTS (tsvector / pg_vector comes later); embeddings later |
| **Offline/PWA layer** | App + reference data usable without network | Service worker (Cache API) + IndexedDB + sync engine |
| **AI theology tutor (post-foundation)** | Answer with sources, show interpretation lines, tied to entity graph | Separate service, read-only consumer; NOT in core data path |

---

## Recommended Project Structure (Next.js + Supabase + Vercel)

```
projects/<nome>/
├── app/                          # Next.js App Router — routes & edge
│   ├── (reader)/                 # verse-centric surface (primary screen)
│   │   ├── [trans]/[book]/[chapter]/   # chapter + deep verse view
│   └── api/                      # route handlers, only when server runtime needed
├── lib/
│   ├── reference/                # canonical verse/entity id model, editions
│   ├── bible/                    # get-verses, chapter assembly, importers
│   ├── supabase/                 # supabase client, server client, RLS helpers
│   └── offline/                  # Dexie (IndexedDB) schema, SW cache strategy, sync engine
├── components/
│   ├── reader/                   # surface translation + verse cell
│   ├── reference/                # interlinear, dictionary, concordance panes (lazy)
│   ├── entities/                 # map, timeline, genealogy renderers (lazy)
│   └── notes/                    # annotation editor, tags, layering
├── scripts/ + data/              # one-time/CI importers of public-domain sources
└── tests/
```

### Structure Rationale

- **`lib/reference/` is the load-bearing module:** the canonical verse/entity id determines whether every connected feature rewrites or not. Get "what is the id of John 3:16" right early; own it as a first-class, tested module.
- **`lib/bible/` separate from components:** chapter assembly and translation handling stay framework-independent and testable.
- **`components/reference/` and `entities/` separate from `components/reader/`:** enables the on-demand zoom — deep panes are code-split so heavy ones (interlinear, maps) only load when pulled in. Do not bundle lexicon/maps into the reader chunk.
- **`lib/offline/` kept together:** SW + IndexedDB + sync need to be designed as one story, not three incidental concerns.

---

## Core Architectural Patterns

### Pattern 1: Canonical Verse Reference Identity (the spine)

**What:** one immutable, stable id for every verse/entity; all features (translation text, interlinear, lexicons, crossrefs, maps, annotations) key off that id, with intra-verse anchors for finer granularity. Reference data is imported once; user content is always *referenced* to a verse id, never stored inline with the verse.

**When to use:** the foundational pattern of the domain. Always.

**Trade-offs:** one-time id-stabilization effort up front; a small indirection layer worth learning. Every well-built example (bible-together, Ezra Bible App, interlinear builders) does this.

```ts
export type VerseId = `${BookId}.${string}.${number}.${number}`;
// reference (immutable): verse text, never user content
const verse = await db("verse").where({ id: "john.3.16", translation: "WEB" });
// user data: annotation keyed to the spine, not inline with the text
const note = await db.upsert("annotation", {
  userId, verseId: "john.3.16",
  strongsTokens: [3, 22],            // stable original-language token anchor
  body, visibility,
});
```

### Pattern 2: Immutable Reference vs Mutable User Data (the wall)

**What:** two physically separated stores with different cache/security rules.

- **Reference:** verses, translations, lexicons, crossrefs, maps, timeline, imagery — global, public domain, immutable per version, identical for every user. Serve read-only, cache aggressively and offline.
- **User:** notes, highlights, annotations, tags, studies, groups — per-user, mutable, private by default, RLS enforced, synced across devices referencing the same spine.

**When to use:** always. It defines offline scoping ("cache the immutable set; sync the small mutable set") and keeps RLS surface minimal.

**Trade-offs:** kept separate reads vs merged render; requires a small composition layer. Missing it is the classic cause of "everything loads from the API even though most of it is identical for every user."

### Pattern 3: Verse-Level Progressive Zoom (product UX == component boundary)

**What:** a verse renders at a surface level (one chosen translation). Each deeper feature — interlinear, lexicon, concordance, maps, timeline, genealogy — is a separate resolvable module keyed by the same verse id, expanded on demand ("zoom"). These layers are lazy-loaded and pre-fetched during idle to the offline store.

**When to use:** the whole product promise ("opens simple, user pulls depth"). Always.

**Trade-offs:** more feature boundaries + loading states. Mitigates with React.lazy per pane and idle pre-cache. **Do not** build all panes into the initial reader bundle.

**Example:**
```tsx
<VerseCell verseId={john.3.16}>
  <SurfaceText translation="WEB" />          // always
  {zoom.open && <InterlinearPane />}         // lazy, mounts on zoom
  {zoom.open && <LexiconPane />}             // lazy, mounts on zoom
  {zoom.open && <MapsPane placeIds={...} />} // lazy, async
</VerseCell>
```

### Sizing the offline cache realistically

Bible text is a few MB per translation (cache the whole text set always, e.g. via Cache API). Lexicons + concordance reach tens of MB; full interlinear + maps/timelines 50-150 MB — within mobile/PWA quota, but cache them on-access or via an explicit "install study data" action, not on first load. Store heavy structured data (lexicon, interlinear, imagery) in IndexedDB; store shell + text responses in the Cache. Never serve "the whole corpus" as one request — serve at chapter/verse granularity.

---

## Data Flow

### Request Flow (reading a chapter)

```
[Reader opens John 3]  →  /reader/[translation]/[book]/[chapter]
    ↓
[data hook (React Query/SWR)]  →  offline check → hit? render from Cache/IndexedDB
    ↓ miss → fetch superset of chapter from lib/bible
[Supabase `verse` table]  →  response → transform → render
    ↓      cache full result + pre-fetch interlinear/lexicon (idle) for future zoom
    ↓ (same for offline-first data if implemented below the surface)
```

### Request Flow (user annotations)

```
[Notation draft editor / user saves]
    ↓ optimistic local write to IndexedDB (immediate UX, offline-safe)
[sync engine queues + pushes]
    ↓ on reconnect
[supabase `annotation` upsert (user_id, verse_id, token_anchor, body, visibility)]
    ↓ RLS enforced
instant read everywhere via spine; server is authoritative cross-device
```

### State Management

- **Read-mostly reference data:** a query/data cache layer (React Query or SWR + Net pre-caching) backed by IndexedDB. No global store needed; reads are cheap and cacheable.
- **Write-oriented user data (annotations):** local-first — the device is the primary store for writes, a sync engine reconciles to Supabase in the background. Do not couple the two with a single global store (breaks the offline/cache story).

### Key Data Flows

1. **Reference canonicalization & distribution:** import public-domain sources → normalize to spine → load read-only into `verse`/`lexicon`/`interlinear` → serve publicly, cache on device.
2. **Annotation attach/detach:** user annotates a verse → row keyed by spine id → sync to server (RLS) → visible cross-device via the same spine.
3. **Interlinear → lexicon:** verse → words (each holds Strong's number) → lexicon entry by Strong id; cross-reference on Strong id.
4. **Entity graph lookups:** verse/entity ids  →  `person`/`place`/`event`  →  maps (place coords), timeline (event), imagery (person).

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|---------------------------|
| 0-1k users | One Next.js app + one Supabase project; reference data fully cached client-side. Monolith is completely fine. |
| 1k-100k users | Optimize the first bottlenecks: cache reference tables + CDN (Vercel edge), index the `annotation` table (user_id, verse_id), move heavy search to pg_search/FTS. |
| 100k+ users | Reference data ships as frozen build/import artifacts (not live DB round-trips); semantic/vector search to pg; consider moving heavyweight computation off the main pass. |

### Scaling Priorities

1. **First bottleneck: the sync engine.** Cross-device/offline sync is the hardest thing to get right and the first to break at real multi-device scale — solve it early, in the foundation.
2. **Second bottleneck: search.** Naive LIKE search degrades quickly; move to Postgres FTS early (then vector-based semantic search in the AI stage).

---

## Anti-Patterns

### Anti-Pattern 1: Mixing reference data and user data in one verse "record"

**What people do:** store annotations and other per-user content inline inside the same verse row / blob object.

**Why it's wrong:** breaks privacy (the same blob must be private for you and public for everyone), duplicates verses, destroys the cache-vs-offline split, and makes the layout ripple on every schema addition.

**Instead:** one canonical immutable verse record; all user content lives in separate RLS-protected rows keyed by the spine id.

### Anti-Pattern 2: Bundling every deep pane into the first page load

**What people do:** all pane modules + their data render on every verse in the same bundle/fetch.

**Why it's wrong:** destroys the progressive-zoom promise, hurts mobile/novice path, heavy initial load is the worst first impression.

**Instead:** surface-first; deep panes are lazy and fetch on-demand; idle pre-load into IndexedDB. Separate `reference/`/`entities/` components from `reader/` in code-splitting.

### Anti-Pattern 3: Anchoring annotations to a mutable rendering string

**What people do:** store character offsets relative to the displaying translation string — then any text normalization/correction silently shifts every highlight/annotation.

**Why it's wrong:** anchors rot silently and are hard to notice.

**Instead:** anchor-seal anchors to stable semantic units — verse id + token index from the original-language (Strong's-token) sequence, not the cosmetic rendering string.

### Anti-Pattern 4: Full-dataset re-sync on every launch / every version

**What people do:** try to sync the entire collection every sync/update — slow first-run (15+ min), storage churn on every build release.

**Why it's wrong:** wasteful, frequently broken, bad UX.

**Instead:** scoped/incremental sync — plain text translations now; lexicon/maps on-access or via an explicit "download for offline study" action; incremental with schema-versioned local migrations.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Supabase (Postgres + Auth) | Canonical home for user data + auth + RLS; reference store as public read-only | Follow harness deploy rules (RLS everywhere, no `service_role` client bundle) |
| Vercel | Edge/Serverless for pages + `app/api`; CDN; PWA/offline caching via SW | Serve verse API as fast/edge as possible |
| pgvector (Supabase) | Semantic search over verses + notes | Later (query/AI stage); not foundation |
| Public domain sources (open-bibles, SBLGNT, TAHOT/TAGNT, OSIS/XML, maps, Nave's) | One-time/CI import into canonical tables | Versioned importers; stable id freeze |
| External AI (future Claude/AI) | Read-only consumer of spine + entity graph for the theology tutor | Separate infra; never blocks core read path; cite returned sources |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `reference/spine` → everything | shared id model + id helpers | Version + freeze this; everything depends on it |
| `bible` (read) ↔ `offline` (cache-write) | fetch-on-miss + cache write | reference read path is fully cacheable |
| `notes` ↔ `supabase` ↔ `offline` | local-first + sync engine | offline mutations queue → server → sync → RLS |
| `reference/*` panes ↔ `entity` store | read-only queries per verse/entity | can pre-render at build time |

---
*Architecture research for: Deep Bible Study app*
*Researched: 2026-08-06*