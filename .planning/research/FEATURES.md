# Feature Research

**Domain:** Deep Bible study platform (web/PWA) — multi-version reading + verse-by-verse study (historical/cultural/geographical/archaeological context), original languages (Hebrew/Aramaic/Greek) with transliteration and lexicon, dictionary/concordance, interactive maps + timelines, advanced notes (highlights/categories/verse relationships/sharing), sermon/study creation, thematic study, smart search, later an AI theology tutor with sources.
**Researched:** 2026-08-06
**Confidence:** MEDIUM (domain well-documented by multiple 2026-dated market comparisons, cross-checked against vendor primary help docs)

## Feature Landscape

### What "Deep Study" Apps Do That Simple Readers (YouVersion) Don't

This is the organizing question of the whole product. YouVersion is the 1-billion-install consumer standard and is **deliberately shallow**: no first-party Greek/Hebrew interlinear, no verse-by-verse commentary pane, and search that is "functional, not powerful." It solves the problem of reading consistency, not depth. Every feature below is the delta between "a reading habit" and "a study workbench." If a feature can be gotten from YouVersion, it is not differentiating.

The category's proving ground is the **per-verse study surface**: tap any word -> Strong's number -> original lemma -> parsing -> lexicon entry -> every-other-occurrence list -> click any cross-reference -> jump there and back. This "one-click depth" loop is what Blue Letter Bible (free, gold-standard word workflow) and Bible Hub (30+ translations + commentary wall) do well, what Logos escalates with research-grade morphology and syntax search, and what YouVersion structurally lacks.

---

## Table Stakes (Users Expect These)

Features users assume exist in *any* deep-study app. Missing these (especially the per-verse study surface, or breaking sync/offline) makes the product feel incomplete and users leave for Blue Letter Bible or Bible Hub.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Multiple translations side-by-side (parallel view) | Bible Hub is "unmatched for translation comparison" (30+ versions stacked per verse) — the most-used free study pattern; e-Sword and Olive Tree both sync panes to the same verse | MEDIUM | Public-domain first (KJV/ASV/WEB/Almeida) per PROJECT.md; side-by-side plus synchronized vertical stack |
| Strong's-tagged interlinear (click word -> Greek/Hebrew, lemma, transliteration, parsing) | BLB and Bible Hub built their reputations on this as the standard "tap any word" study loop | HIGH | Core edge. The data pipeline (tagging every word of public-domain texts with original lemma + Strong's) is the heaviest engineering lift in the domain; the whole deep-study stack composes on it |
| Word study = click word -> lexicon entry -> every-other-occurrence list | BLB's core loop; "every place that root appears" is part of the free 70% of the study workflow | MEDIUM | Lexicon lookup + occurrence list; depends on the interlinear tagging foundation |
| Concordance / dictionary (Strong's, Easton's, BDB/Thayer) | "Strong's + BDB + Thayer" appears in every free-tool value proposition | MEDIUM | Public-domain dictionaries exist; needs a reference-data layer on top of the tagged text |
| Verse-to-verse cross-references (Treasury of Scripture Knowledge) | BLB ships TSK crosslinked for free; "50+ references vs YouVersion's ~5" is the standard depth complaint | HIGH | Public-domain TSK (572K cross-refs) is the free backbone; organized-by-relevance is the quality bar |
| Synchronized panes / clickable references (click verse -> jump -> return) | e-Sword and Olive Tree: a click moves Bible/commentary/lexicon/notes all to the same verse | MEDIUM | Core UX that separates study from reading; the "verse anchor moves everything" pattern |
| Notes + highlights anchored to verses | Every app has it, even the casual-reader floor | LOW | Verse-anchor is table-stakes; word-anchor is a differentiator (below) |
| Reliable cross-device sync (notes, highlights, bookmarks, progress) | Olive Tree's "genuinely first-class" sync is a review cornerstone; e-Sword's absence is a top complaint; broken sync is a top 1-3-star complaint across ALL apps | MEDIUM | Not optional when notes/study are core; lives on Supabase. Unreliable sync kills perceived value |
| Offline access to the readable text | Top complaint category (BLB, YouVersion edges); study apps must at least read offline | MEDIUM | PWA local caching; licensed translations complicate offline (avoid in v1 by staying public-domain) |

### Dependencies — the deep-study data layer

Almost everything deep hangs off one foundation:

```
Canonical tagged text (public-domain + original Greek/Hebrew lemma + Strong's per word)   [P0]
    |--enables-->  interlinear / word study / lexicon / concordance / every-occurrence   (EST-03)
    |--enables-->  better search
    |--enables-->  word-anchored notes
    |--enables-->  transliteration + pronunciation
```

**The whole product rests on one foundational bet: a canonical, per-word-tagged representation of the public-domain texts with original-language lemma and Strong's mappings.** This is the P0 engineering commitment. Everything else (word study, lexicon, concordance, note anchors, smart search, context dossiers, AI grounding) composes on it.

**Dependency notes:**
- **Word-level lexicon / interlinear / concordance requires the tagged layer** — there is no word study without it.
- **Verse-anchored notes do NOT require the tagged layer** — a minimal v1 could ship public-domain text + verse notes + parallel translation before the full word layer lands. This allows phased delivery.
- **Maps, timelines, and archaeology/culture content are independent graph layers** (people/places/events linked to verses): dependency is at design time (a verse reference dataset), not runtime.

---

## Differentiators (Competitive Advantage)

These align with the project's Core Value ("Deep, organized, personalized — context, originals, connections at a click") and the persona-balance principle ("all equally; zoom to depth").

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Zoom-to-depth / progressive depth UX (open simple, pull layers)** | Logos' #1 complaint is "interface daunting, overwhelming, needs training"; Olive Tree's is "store is a maze." A deep-study app that does not overwhelm attacks the exact weakness every incumbent is criticized for | MEDIUM | A design principle applied to all features, not a feature itself; the "anti-Logos-immense" move |
| **Verse-relationship data model (cross-verse links, themes, categories, own studies)** | The "connections" at the center of the product thesis; Logos uses notebooks/graphs; Olive Tree uses tags + categories | MEDIUM/HIGH | Data-model bet; graph-shaped queries; enables study-sharing and thematic study |
| **Word-level annotations (highlight a single WORD)** | Olive Tree distinguishes verse-based vs word-based annotation; word-anchored notes follow the word across translations | LOW-MED | Small on top of the tagged layer; a polish differentiator |
| **Advanced notes: categories + custom studies + share + small groups** (EST-05/12) | Logos shares notebooks (public or group collaborate); no free tool does social notes with category organization | MEDIUM-HIGH | Differentiation at the EST-05/12 nexus; the edge is sharing and small-groups |
| **Group study communities (small groups only, no global feed)** | Logos shares a notebook to a group for collaboration; YouVersion social-with-feed is heavily criticized in 1-3-star reviews | HIGH | Supabase/RLS; after individual notes + sync; the project explicitly keeps the feed out |
| **Interactive maps + timeline atlas (biblical geography + history)** | Logos Atlas (place -> events -> people) + Advanced Timeline ("what was happening in the world during David's reign?") — no free app does maps well | HIGH | Independent data surface; engaging differentiator; = EST-06/07 |
| **Thematic study mode (whole book / theme auto-connection)** | Logos Passage/BibleBook guide is "the killer 15-year feature that compresses hours into minutes"; BibleProject does whole-Bible orientation via video | MEDIUM/HIGH | Automates "connection" across a passage; after the relationship layer + word layer |
| **Study-creation tools (sermons/lessons/devotionals/groups)** | Logos Sermon Builder is its killer workflow; no free tool has a clean guided study builder | HIGH | Teacher-facing workflow; after notes + categories; = EST-08 |
| **Smart/topic search (find half-remembered verse by subject)** | YouVersion search is "functional, not powerful"; Bible Hub has a topic browser; Logos has Smart Search + Factbook entity search; matches the "even without remembering the exact verse" vision | MEDIUM | Search/embeddings over the tagged data; after the data layer |
| **AI "impartial professor with sources" (post-v1)** | The biggest long-lead differentiator AND cost/risk; Logos AI is the only incumbent with any integrated AI; nobody does "impartial multi-line interpretation with citations" | MOST-HIGH (deferred) | Deliberately a post-foundation phase (per decisions) to separate cost/risk from v1 |
| **Fidelity / multiple interpretation lines (EST-14)** | Project commitment "the user draws their own conclusions"; presenting interpretation lines fairly is nearly absent in the market | MEDIUM | A philosophy carried through all surfaces + AI; a trust differentiator on its own |

---

## Anti-Features (deliberately NOT built)

| Anti-Feature | Why Requested | Why Problematic | Alternative / What Instead |
|---------------|----------------|-----------------|---------------------------|
| The "do-everything immense" all-in-one package | "more = better" marketing; Logos is immense | THE category's #1 complaint: "immense, overwhelming, daunting, modules bolted on"; it scares off the mid-tier reader, which is the entire persona spectrum goal | Zoom-to-depth: open simple, expose layers; curated default surfaces |
| A social feed / algorithmic home / friend stream / heavy push | YouVersion/Faithlife engagement; "community" | #1 negative cluster in 1-3-star reviews across apps ("algorithmic feed in a quiet-reading context", notification frequency, streak anxiety); the project explicitly says NO social feed (it destroys study focus) | Small-group + shared notes only; open to the text, not to a feed (project's own Out-of-Scope) |
| Gamification (streaks, badges) on devotional completion | Retention (YouVersion Habits) | Follow-up #1 cluster: "streak-loss anxiety", "you completed 2 of 7 readings" pop-ups at odds with the contemplative posture | Track and review study progress as a user tool; no external gamification score |
| Aggressive ads / interstitials in chapter view / paywall pop-ups | Revenue vs free-tier reality (Bible Hub, Olive Tree, YouVersion Plus) | Top cross-app complaint: ads in the reading surface, "I thought I owned it" paywall confusion, coercive checkout | Honest free core + one clear value proposition; no ads inside the reading surface at v1 |
| Commercial-translation lock-in at v1 | Users expect NIV/ESV/NLT immediately | Paywalled licensing and subscription-tier confusion are top complaints; the project already decided public-domain-first | Public-domain first (KJV/ASV/WEB/Almeida = free, legal translations); commercial/regional added much later if the model supports it |
| A research-grade academic original-language stack (morphology/syntax trees/semantic search) from day 0 | To match Logos' depth | Very expensive to build, academic domain, serves a minority power-user rather than the beginner-to-theologian spectrum | The mid-depth per-word study + lexicon covers ~90% of serious-lay need; advanced academic search is a v2-if-market decision |
| Unbounded translation sprawl ("30+ versions, all free") | The Bible Hub model | Deep maintenance + licensing rent for edge value | Keep the translation set lean and curated |
| "One true answer" theology with no sources | "the biggest differentiator" (AI) | Accuracy and faithfulness risk; a black box in a faith domain | AI always bounded and sourced — "AI as teacher with sources", presenting multiple interpretations |

---

## Feature Dependencies

```
WORD LAYER (tagged interlinear + lemma data)  [P0]
    |--enables-->  interlinear / word study / lexicon / concordance / translit / pron
    |--enables-->  word-anchored notes
    |--enables-->  smart search later

NOTES LAYER (verse-anchored, user data)
    verse-notes/highlights (base) -> categories/folders -> "own studies"
        -> sharing / small groups (EST-12)   [requires accounts + RLS]
        -> study-creation tools (EST-08)
        -> thematic study (EST-10) -> before-AI

VISUAL / CONTENT LAYERS (independent graph data):
    maps + timelines (EST-06/07)  — place/event/people linked to verses
    archaeology / culture / history context content

AI LAYER (deliberately deferred to post-foundation):
    needs: canonical tagged data to ground on, relationship data for context,
           and an impartiality/source-citation workflow as a built-in
```

**Dependencies that matter for phasing:**

| Foundation | Unlocks (enables) |
|------------|-------------------|
| Public-domain multi-translation text | Page 0 — all reading and comparison |
| Tagged-originals layer | interlinear, lexicon, concordance, transliteration, word notes — the biggest single enabler |
| Account + notes + sync | groups, sharing, studies, sermon tools, thematic |
| Verse-relationship (graph) model | cross-links, themes, study structure, deep sharing |
| AI (grounded LLM) | every AI feature needs ALL foundations + source workflow |

**Coupling to avoid in the same phase:** social-algo-feed and gamification must never be built (they are anti-features). Depth-dump-at-load (the Logos-style overwhelming surface) must not ship.

---

## MVP Definition

### Launch With (v1) — the "deep verse study" vertical slice

Validates the concept end-to-end on the feature that excites (per project decisions).

- [ ] Multi-translation parallel read (side-by-side / synced stack) — public-domain first
- [ ] Interlinear + originals (Hebrew/Greek) with Strong's/lemma, transliteration, pronunciation — the word-study proof
- [ ] Word-study surface (tap word -> lexicon -> every-occurrence list) — the "one-click depth" prover
- [ ] Verse-level study dossier (archaeology/culture/history context + classical commentary) — EST-02, the heart of the product
- [ ] Cross-references (Treasury of Scripture Knowledge into DB) — click, jump, return
- [ ] Notes + highlights, anchored and categorized, with reliable sync
- [ ] Simple search (keyword / verse locator)
- [ ] Progressive-depth onboarding (open simple, pull layers); NO ads, gamification, or feed
- [ ] Account + trustworthy cloud foundation (social later)

**Explicitly NOT v1:** AI tutor (EST-13/14); full maps + timeline (EST-06/07); study-creation for others (EST-08); semantic/smart search; commercial translations — each is a later/deferred milestone.

### After Validation (v1.x)

- [ ] Word-anchored annotations + tagging at volume
- [ ] Category/folder system for annotations + "own studies"/saved studies
- [ ] Sharing studies/groups (read + edit + invite) — the small-group solution
- [ ] Study creation / lesson / sermon tool (EST-08)
- [ ] Thematic study mode (EST-10) — after relationship data

### Future Consideration (v2+, deliberately deferred)

- [ ] AI-as-teacher (EST-13) with full sources + impartial interpretation lines (EST-14) — the biggest and priciest differentiator; always requires the source-integrity foundation
- [ ] Maps + timeline umbrella (EST-06/07)
- [ ] Smart / semantic / topical search (topic -> best verses)
- [ ] Commercial or regional translations (licensing-dependent)

---

## Feature Prioritization Matrix

**Priority key:**
- P0 — enabler: the canonical word layer and account/sync that everything deep composes on
- P1 — v1 vertical-slice must-haves
- P2 — post-validation retention / differentiation (sharing, groups, study builder)
- P3 — big-cost deferred differentiators (maps, semantic search, AI), risk-separated

| Feature | User Value | Impl. Cost | Priority | Phase |
|---------|-----------|-----------|----------|-------|
| Parallel translation reading (public-domain) | HIGH | MEDIUM | P0 | Phase 1 (text pipeline) |
| Canonical tagged interlinear + lemma layer | (enables all) | VERY-HIGH (data engineering) | P0 | Phase 1 — build the word layer |
| Strong's / interlinear clickable | HIGH | MEDIUM (on the layer) | P1 | Phase 1 |
| Word study (tap -> lexicon, every-occ) | HIGH | MEDIUM | P1 | Phase 1 |
| Verse-study dossier (context + commentary) | HIGH | MED/HIGH | P1 | Phase 1 |
| Cross-references (Treasury whole) | MEDIUM | MEDIUM | P1 | Phase 1 |
| Notes + highlights (verse-anchored) + sync | MEDIUM-HIGH | MEDIUM | P1 | Phase 1 |
| Account / cloud / auth | REQUIRED | MEDIUM | P1 | Phase 1 foundation |
| Audio / text-to-speech | MEDIUM | MEDIUM | P2 | onboarding polish |
| Word-anchored annotations | MEDIUM | LOW (on word layer) | P2 | Phase 2 |
| Category/folder system + own studies | MED-HIGH | MEDIUM | P2 | Phase 2 |
| Group / sharing (EST-12) | MED-HIGH | MED-HIGH | P2 | Phase 2 (social red-line, no feed) |
| Study-creation / lesson tool (EST-08) | MED-HIGH | HIGH | P2/P3 | teacher workflow |
| Thematic mode (EST-10) | MED-HIGH | MED/HIGH | P2/P3 | Phase 2-3 |
| Smart / semantic search (EST-09) | MED-HIGH | HIGH | P3 | after data + notes |
| Maps + timeline atlas (EST-06/07) | MED-HIGH | HIGH | P3 | content surface |
| AI teacher + sources (EST-13/14) | HIGH (biggest diff) | VERY-HIGH | P3+ | post-foundation, risk-confined |

---

## Competitor Feature Analysis

| Feature | Logos | Olive Tree | Blue Letter Bible | Bible Hub | e-Sword | Our Approach |
|---------|-------|-----------|-------------------|-----------|---------|--------------|
| Parallel translations | yes (deep) | yes | yes (fewer) | yes (30+, best) | yes | public-domain first, side-by-side + stacked |
| Interlinear / originals | yes (research-grade) | yes (Strong) | yes (gold-standard Strong) | yes (interlinear) | yes (lexicons) | built from the tagged word layer |
| Lexicon / concordance | yes (deepest) | yes (Strong) | yes (BDB/Thayer, free) | yes | yes (Strong+) | baked in via the data layer |
| Verse cross-references | yes (multi-set, academic) | small | yes (Treasury built in) | yes (Treasury) | yes | Treasury into DB as primary |
| Notes | yes (notebooks) | yes (notes + tags + categories) | limited | limited | yes (per-machine) | verse-anchor -> word-anchor -> studies |
| Sharing / groups | yes (public or group notebook) | limited | minimal | minimal | local only | group-first, beyond most incumbents |
| Word study depth | yes (research-grade) | yes | yes (gold free) | yes | yes | curated mid-depth (90% of serious-lay need) |
| Maps + timeline | yes (Atlas + Timeline, best-in-class) | no free | no | no | no | Phase 3 (only Logos has this today) |
| Thematic / book study | yes (Passage/BibleBook guide) | advances | some | some | none | Phase 2-3 |
| Sermon / study builder | yes (Sermon Builder) | none | none | none | workbench | Phase 2-3 |
| AI (with sources) | yes (Logos AI) | none | none | none | none | the post-foundation differentiator |
| Social feed | — | — | — | — | — | **deliberately none** |

Legend: yes = present · no = absent · limited/minimal = partial. **Our differentiation sits where incumbents fail:** non-overwhelming depth, free public-domain core with originals, small-group study (not a feed), and impartial sourced AI — on public-domain bedrock.

---

## Summary of the Differentiator Thesis

The contenders split cleanly:
- **Deep-study incumbents:** Logos (research-grade), Olive Tree (mid-tier ownership + great mobile UX), e-Sword (free deep-desktop word workbench), BLB/Bible Hub (free study stack).

**The gap the project occupies:** "as deep as useful for the new-convert-to-theologian spectrum, deliberately not Logos' daunting overwhelmer; free-core originals + truly interconnected verse notes + small-group sharing (non-feed) + impartial sourced AI — while no free app does maps, timelines, or thematic study well."

The table-stakes that must be nailed first are the **tagged-originals layer + word study + per-verse study dossier + reliable sync**, because real deep-study users either have these already (incumbents) or abandon any app that lacks them. Everything else — relationship notes, sharing, maps, thematic, AI — layers on top and becomes the differentiation.

---

## Sources

**Primary / secondary (2025-2026 market comparisons + vendor primary docs used to map features):**
- LearnOfChrist comparators: Logos vs Olive Tree vs e-Sword; Olive Tree vs e-Sword; Bible Hub vs Blue Letter Bible; the YouVersion review — pricing/power tiers and which feature each app wins on (e.g., "unmatched for translation comparison", "best-in-class Strong", "Treasury 572K entries", "Sermon Builder killer", "Atlas unchanged")
- WarmPeach comparators: Logos vs Olive Tree 2026; Blue Letter Bible vs Logos 2026 (library breadth, Smart Search, AI grounded in library)
- "Is Bible software getting too complicated?" (kevinpurcell.org) + Rooted Thinking Logos review — the overwhelming-UI complaint (the "anti-Logos-immense" synthesis)
- Unstar.app "5 Bible apps ranked" — 1-3-star review clusters: ads, sync failures, paywall confusion, gamification, social-feed complaints
- AppPicker Blue Letter Bible review — TSK/Strong depth vs dated UI, crashes, manual sync
- Logos Help Center (support.logos.com): Notes Tool, Notebooks, Sharing/Collaborating, Atlas, Advanced Timeline, Factbook
- Olive Tree Help: Annotation overview (verse-based vs word-based, tags, categories)
- Project context: `.planning/PROJECT.md` (EST requirements, decisions, out-of-scope)

**Confidence by area:** Feature-presence table is HIGH (grounded in vendor docs and cross-app comparisons). The frustration/complaint analysis is MEDIUM (derived from review-cluster reporting). The "word layer as P0 foundation" and "anti-overwhelm as the differentiation" are analyst syntheses grounded in the most universal complaints — MEDIUM, and candidates for feasibility research at Phase 1.

---
*Feature research for: Deep Bible Study*
*Researched: 2026-08-06*