# Pitfalls Research

**Domain:** Deep Bible study platform (multi-version reading, original-language texts + lexicon, dictionary/concordance, maps/timelines/genealogies, advanced notes, later AI theology tutor)
**Researched:** 2026-08-06
**Confidence:** HIGH

---

# Critical Pitfalls

## Pitfall 1: Treating "public domain" as a single safe category

**What goes wrong:**
The plan assumes "public domain translations (KJV, ASV, WEB, Almeida)" are uniformly safe. KJV is not the same in every jurisdiction, and "public domain" hides attribution and derivative-license traps. Study notes, commentaries, maps, timelines, and cross-reference systems built from "public academic data" carry their own separate copyrights you would not expect until a legal notice arrives.

**Why it happens:**
The ancient source text is public domain, so the assumption generalizes to "everything on the page is free." But KJV sits under perpetual Crown Copyright in the UK (Letters Patent; printing requires authorization from Cambridge University Press, Oxford University Press, or Collins), while it is fully public domain in the US. The editorial packaging (notes, cross-reference systems like the Treasury of Scripture Knowledge, maps, charts, headings) is a separate copyright from the translation — quoting 200 KJV verses is fine, but re-publishing a curated cross-reference or study-note structure is an independent infringement. Also, "open" source texts often carry CC-NC or share-alike conditions that forbid or complicate monetization (ads or a subscription).

**How to avoid:**
- Build a **licensing ledger** per content asset before shipping: (a) text license (public domain / CC-BY / CC-BY-SA / restricted), (b) jurisdiction scope, (c) whether commercial use is allowed, (d) citation/attribution obligations. API.Bible's terms are a good model — they require a credits page with translation name, abbreviation, IP holder, and link. Make the Credits page a first-class feature, not an afterthought.
- Prefer texts the project can defend: KJV (US-only distribution unless we add UK clearance), ASV, WEB (dedicated public domain / CC-BY), BSB (CC0, used by AddictiveBible). Document each in the ledger.
- Do NOT vendor TSK-style cross-reference data or commentary/map structures without checking their license — re-digitized editions carry their own rights even when the original eighteenth-century text is public domain.
- Flag any CC-NC source as non-monetizable before any subscription or ad ships.

**Warning signs:**
- Content pulled from a website with no visible license line — treat as unlicensed until proven.
- The team says "public domain" generically while linking three sources with three different licenses.
- No credits/copyright page exists anywhere in the design.

**Phase to address:**
Phase 1 (foundation / data ingestion). This gate blocks the entire text pipeline. If an ingestion phase imports unvetted text and it ships, the fix is removal and replacement, not an edit.

---

## Pitfall 2: AI theology bias presented as "unbiased" (doctrinal flattening + hallucination)

**What goes wrong:**
The flagship differentiator is "impartial AI with sources." Research on Bible AI apps (Bible Society / Cambridge CCCT, Jan 2026) shows mainstream chatbots implicitly privilege US evangelical interpretations, present one tradition as definitive, omit symbolic / sacramental / tradition-based readings, and flatten denominational differences. A Springer "AI and Ethics" study (2026) shows high precision (0.80-0.86) but low recall (0.42-0.56): models state many true claims but omit most of each tradition's teaching, and occasionally contradict core doctrine (e.g., describing the Eucharist as merely symbolic — a direct denial of Catholic and Orthodox real presence). This violates both EST-13 (sources) and EST-14 (impartiality).

**Why it happens:**
Models reflect the statistical dominance of Western evangelical discourse in training data. "Neutrality" is impossible — every output expresses a hermeneutic. The speed and confident tone of AI make users treat answers as factual, which reduces critical engagement. The common shortcut is letting a base model answer theology with no curation layer.

**How to avoid:**
- Treat impartiality as a **system design problem**, not a prompt. Do not ship a single-denomination model, and do not fake neutrality.
- Adopt a **tradition-explicit layer**: answers always name the interpretive lens(es) they draw on (Catholic, Orthodox, Protestant, Jewish) and surface divergent readings rather than one definitive answer.
- Ground answers in cited, authored sources (RAG over a curated, license-safe corpus of commentaries and confessions), requiring a citation to a specific source for every theological claim.
- Ship a **doctrinal safety layer** separate from the model: flag overframing ("All Christians believe...") and contradictions during generation. Make it surface the range of readings honestly rather than an official single answer.
- Document the point where the model stops being "impartial judge" and instead presents a curated tradition-specific view (per user preference or group context).
- Do NOT let generic base LLMs answer theology without the curation layer — that is exactly the failure mode of every studied Bible app.

**Warning signs:**
- AI answers say "the Bible says..." but never "the Catholic tradition teaches X, the Protestant tradition teaches Y."
- A contested question (Eucharist, eschatology, salvation) returns one reading with no mention of alternatives.
- No citations, or citations that do not link to a real, obtainable source.
- No concept of which tradition the model is currently expressing.

**Phase to address:**
Deferring AI into a later phase is correct. But state the impartiality policy and the tradition-explicit citation schema during the **foundation data phase** (so curated content supports it), and build an eval harness for the safety layer in the **AI phase (post-v1)** before any user-facing release. v1 curated content must already be tradition-labeled so the AI layer later inherits it.

---

## Pitfall 3: Loading the whole Bible dataset (31k verses x multiple versions + lexicons + maps) as one payload

**What goes wrong:**
The app hosts multiple side-by-side translations PLUS Hebrew/Aramaic/Greek originals PLUS lexicon entries PLUS maps. One translation is ~3.5-4.5 MB of JSON; several translations times originals plus indexes can exceed 20 MB. Bundling it all into client startup causes poor first loads; one full-text scan or one large JSON parse that works in a demo stutters on mobile.

**Why it happens:**
It is the "just index the whole thing" engineering reflex. For a reading app the text is the product, so preloading feels natural. But an offline PWA must balance an upfront download (which kills the install / first-open experience) against lazy and streamed data.

**How to avoid:**
- Keep a **small core always loaded** (one default translation; the currently-viewed chapter across chosen versions) and **lazy-load** the rest per book / chapter. Proven approaches (ScriptureGen, AddictiveBible) load per book, compressed, indexed and normalized once.
- Split the dataset by book/testament; keep a full-text **search index** as a lazy module loaded only when the user opens Search, run in-memory (single-digit ms), instead of a server query per keystroke.
- Store translations in **compressed form** (a compressed blob per book, not a parsed-object graph at launch); consider SQLite-WASM (as in Biblesearch) for cross-version search and offline.
- Originals + lexicon are fetched only when the user requests that depth layer (the "zoom progressive" mechanic). This honors the data model and the PWA budget.
- For "random verse" / "related verses", use positional (coordinate) edge lookups, not SQL row scans.

**Warning signs:**
- Mobile shows a minutes-long "working / download everything" dialog (Blue Letter Bible's "initialize resources" took minutes and was heavily criticized).
- A single "all translations + originals" JSON sits in `public/data/`.
- Full-text search always hits a server against one table.
- Offline mode means a single "download whole app" button.

**Phase to address:**
The study-view data layer / PWA caching (first slice that builds the reader plus original text). The lazy schema is foundational; retrofitting it later is very costly.

---

## Pitfall 4: Trusting original-language data blindly (broken Strong's mappings, conflated lexemes, morphology errors)

**What goes wrong:**
Hebrew/Greek "original" features depend on tagged data that is community-maintained, not a single authoritative source. Strong's numbers were assigned to a specific underlying edition (KJV/TR); layering them onto a different base yields mismatches — e.g., the CrossWire TR module in which several words are mis-tagged. MorphGNT and Nestle-1904 lemmatization differ from each other and from other bases in both versification and text itself, producing many lemma/Strong's errors that require human correction (Tauber logged many thousands, correcting some). Strong's also conflates distinct lexemes into a single number, so one "meaning" actually spans a range of terms.

**Why it happens:**
The underlying texts are hand-corrected and inconsistent. A project takes a "join to Strong's number from an edition" shortcut and never seeks a second source. Output appears internally consistent, so the mapping looks correct.

**How to avoid:**
- Choose a **known and lemmatized/morph base of record** (MorphGNT / Nestle-1904 or another morphed edition); document the intended source and its known-error profile.
- Do a **reconciliation pass**: cross-check a bridged Strong's/lexicon mapping against a second reference; flag disagreements for human curation rather than directly showing a potentially-wrong lemma to all users.
- Use the word's own **lemma + parse** as the join key (modern lexeme-reference systems) rather than a mapping only on Strong's.
- Be honest in the UI: display the entry under the lemma, and when a mapping is uncertain show it as "possible." Do not lean on Strong's as gospel.
- Provide a **report-a-data-error** affordance and an upstream-fix pipeline versioned over time.

**Warning signs:**
- A single "join on Strong's number" everywhere, no per-word reconciliation.
- Spot-check vs BDAG / Liddell-Scott and the tagged lemma does not match.
- No disclaimer that Strong's is a convention with conflations.
- The UI shows "the original" with no hint of which base text (Nestle-Aland vs TR vs MT vs LXX).

**Phase to address:**
Original-language phase (EST-03). Source choice and reconciliation lock here, before UI is built on it.

---

## Pitfall 5: Walled-garden notes lock users in — sync as an afterthought

**What goes wrong:**
The notes system (EST-05) — highlights, categories, verse links, own studies, groups — is core. If users cannot get data out (export/print) or in (import from Olive Tree / Logos / YouVersion), and if sync is unreliable, the product becomes lock-in. A sync failure after weeks of annotation is a severe trust breach. Competitors show the pattern — Selah offers JSON export/backup and Supabase sync; Olive Tree treats notes as a first-class cross-device layer. Blue Letter Bible's weak sync (manual-only export, no automatic sync) and crash risk made its core strength a liability.

**Why it happens:**
Notes are built after the reader. The data model is implicit (tags as strings, relationships as metadata or text), and export/backup is deprioritized; relational links are denormalized and do not survive export.

**How to avoid:**
- Model notes/highlights as a **graph** (verse-verse, note-verse, note-group) with **stable verse citations** (a canonical "Psalms 23:1") rather than private row IDs — so links survive export and re-import.
- Ship **export** (documented JSON + Markdown / print) and **import** (at least the common reference variants) in v1 — portability is a feature, not a "later."
- Persist via **Supabase RLS-synced** storage plus an offline-first local store; define a conflict policy (for a single-user draft, last-writer-wins with a conflict log; before shipping groups, switch to a mergeable policy).
- Offer "local, no-account" and account sync both; data always survives a lost phone.
- Provide **backup flows** (export JSON + periodic reminder). Users are never locked out of their own study.

**Warning signs:**
- Tags/relationships built via columns, not a linked graph.
- Export is a "TODO"; import "later"; sync only one-way to cloud.
- Notes stored only locally, easily wiped.
- A user annotating a verse has no "what did I mark here" back-links index.

**Phase to address:**
Notes/annotations phase (EST-05). But lock the canonical verse-reference scheme in Phase 1 so maps, timelines, and AI citations are all consistent.

---

## Pitfall 6: One surface for everyone either overwhelms novices or hides depth

**What goes wrong:**
The product promises "novice to theologian, whatever depth you want." Two distinct failures: (a) show every feature up front to a novice → "I just wanted to read" → they churn in minutes; (b) hide the original languages and lexical data behind a power-user-only surface → a theologian ultimately goes to a professional tool (Logos, Accordance) for real scholarship.

**How to avoid:**
- Make **"zoom progressive" the mechanism**: a clean verse pane; at each word / verse the user can add exactly the resource (original text, lexicon, Strong's, commentary, cross-references, maps) on demand. Initial view is light (one translation). Depth arrives in layers, so the same panel never dumps everything.
- Use **personas** (devotional vs study vs deep research) that adjust default panels and starting depth — same data underneath, different default arrivals.

**Warning signs:**
- The first-run demo is a six-panel layout on a single verse.
- Theologians describe "you will use about 10% for the first few months" (the Logos review literally reports this; its interface is called a "power-user IDE").
- Novice churn during onboarding.

**Phase to address:**
v1 deep-study slice. The layered-panel containment and persona defaults must ship in the first vertical slice; refactoring depth later is expensive.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Pattern | Why it seems fine | Long-term cost | Better |
|---------|-------------------|----------------|--------|
| Single "all-bible.json" in client / repo | easy demo, fast | multi-MB per load; cache invalidates as a block; no incremental text updates | one-per-book, compressed, per-verse, built once |
| Bible text and user notes in one root table | one table, fast v1 | citations vs user data have different RLS and lifecycle; migration is painful | separate content data from user data |
| Strong-only mapping with no second reference | visible in deep study only | lemma errors that scholars will find | reconcile; mark "possible" where uncertain |
| Notes last-writer-wins with no conflict path | works for one device preview | note loss once groups/offline land; trust breach | mergeable conflict policy before groups |
| "The text is free" with no license review | quick | legal exposure (UK Crown, CC-NC, TSK rights) | licensing ledger + credits budget item |
| Offline = "download all" | simpler | broken installs, huge first-run | incremental per-book cache; tell the user what "offline" means |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| A commercial/modern source via API (BibleHub, API.Bible) | Copy vs licensing; ignoring per-verse quote rules | License the exact use; respect credits/attribution page |
| Morph source from community data (MorphGNT) | Blindly trusting per-verse tags | Duplicate-check with another module; document error profile |
| External import (Olive Tree, YouVersion, Logos) | Non-standard reference IDs | A reference-expanding import layer; surface hints when a reference is unknown |
| Vercel bundle with 4.5MB+ data | App JS bundle becomes huge | Serve data edge/lazy/CDN, never in the built bundle |
| Supabase / auth / RLS | Leaving a default-open policy | RLS on every user table; server-only keys (see harness deploy rules) |
| Search | Only whole-text scan | Lazy per-book in-memory index; offline-capable |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Notes:** Export and re-import of a real user export — run an actual export/import round-trip test.
- [ ] **Original languages:** A scripted spot-check that a Greek/Hebrew word's lemma is correct vs a second source.
- [ ] **Offline:** Simulate a fresh cache + offline first-verse open; confirm the viewed chapter works.
- [ ] **Sync:** An offline edit then reconnect honestly reports no lost data and shows the conflict log.
- [ ] **AI:** On a contested passage, the answer arrays several traditions — a single "one answer" behind a friendly icon is a bug.
- [ ] **UX:** A mocked novice session opens one default panel.
- [ ] **Legal:** The credits page exists and lists every text source and external asset with the correct attribution.

## Summary

The decisive thing everything else depends on: **a License Ledger materialized as an always-current asset with an attribution page.** Without it nothing else is stable. Original-language data must be treated as quality-sensitive (reconcile against a second source, mark "possible"). The data pipeline must stay lazy so offline/PWA stays fast. Notes must guarantee export and no lock-in. And the AI feature must present multiple traditions with sources — not a single-confessional bot hiding under a friendly icon.

---

## Sources

- **Licensing / law:** API.Bible Terms (attribution requirement); Bible Gateway "Why are modern Bible translations copyrighted?"; LegalClarity — "Who owns the copyright to the Bible and its translations?" (KJV UK Crown Copyright nuance; editorial packaging has separate copyright); UGA "The King James Copyright" (derivative-translation originality).
- **AI theology:** Springer "AI and Ethics" (2026) — "Detecting doctrinal flattening in AI generated responses" (precision 0.80-0.86, recall 0.42-0.56, omission as first-class error); Lausanne Global Analysis (Oct 2025) — "AI-powered Spiritual Formation"; Bible Society / Cambridge CCCT (Jan 2026) — "AI, Bible Apps and Theological Bias".
- **Original-language data:** J. K. Tauber — MorphGNT (community corrections); Greek Lemma Mappings "Missing Strongs" — discrepancies between authoritative sources; CrossWire TR module MOD-349 (Strong's mis-tagging).
- **Performance / PWA:** ScriptureGen "Indexing 31,102 Verses" (zero-latency API dividing a 4.5MB dataset); AddictiveBible (~1.5MB full corpus, per-book lazy); Biblesearch (SQLite-WASM offline search).
- **Competitor / UX:** Blue Letter Bible 3-minute "initialize resources" and crash reports (AppPicker review); Logos review (steep learning curve, "you'll use about 10% for the first few months", power-user IDE); Olive Tree review (notes and sync as first-class features).

---
*Pitfalls research for: deep Bible study platform (Estudo Bíblico Profundo)*
*Researched: 2026-08-06*
