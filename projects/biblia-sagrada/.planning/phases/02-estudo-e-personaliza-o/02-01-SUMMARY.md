---
phase: 02-estudo-e-personaliza-o
plan: "01"
subsystem: ui
tags: [react, nextjs, indexeddb, pwa, offline-first]

requires:
  - phase: 01-fundacao-leitor-offline
    provides: "Leitor offline-first com Serwist, IDB v1, getChapter via loadBookIntoStore"
provides:
  - "Versão dinâmica via estado React (URL ?v= + localStorage bs-version)"
  - "BLIVRE embarcada em public/data/blivre/** (66 livros) sem entrar no precache do SW"
  - "IDB v2: stores study/plans/search + meta downloadedVersions"
  - "downloadTranslation(code, onProgress) -> 66 livros -> IDB chapters + search index persistido"
  - "Seletor de tradução bottom-sheet com badges Em uso / Baixada / Baixar"
  - "Modal de download com progresso N/66, estado done/error, navigator.storage.estimate feature-detect"
affects: ["02-02 (busca FTS consome putSearchIndex/getSearchIndex + store search)", "02-03 (estudo/personalização consome stores study/plans)"]

actuals:
  tokens: 9976
  tasks: 3
  commits: 4

tech-stack:
  added: []
  patterns:
    - "URL ?v= como estado navegável via history.replaceState(null, '', url.toString()) — Pitfall 4: nunca objeto URL"
    - "BLIVRE fora do precache via filtro no walk de collectPublicFiles (startsWith data/blivre ou data/search/blivre)"
    - "ensureDataVersion estendido: clearChapters + clearStore(search) + writeMeta DOWNLOADED_KEY=[] garante badge honesto pós-build (Pitfall 5)"
    - "downloadTranslation reusando loadBookIntoStore (Fase 1) por livro, idempotente; 404 do search index é skip silencioso (Pitfall 6)"
    - "State local downloaded sincronizado no mount via getDownloadedVersions(); atualizado em handleDownloadDone"

key-files:
  created:
    - src/components/version-picker.tsx
    - src/components/download-modal.tsx
    - scripts/task1-e2e.cjs
    - scripts/task2-verify.cjs
  modified:
    - src/lib/bible.ts
    - src/lib/settings.ts
    - src/components/reader.tsx
    - scripts/generate-data.mjs
    - next.config.ts
    - eslint.config.mjs

key-decisions:
  - "D-01: troca sem reload via estado React (useState version) — removido const VERSION fixo"
  - "D-02: URL ?v= é o estado navegável (vence localStorage no deep-link); replaceState exige string, nunca URL (Pitfall 4)"
  - "D-03: BLIVRE fora do precache via filtro no walk, não via globIgnores (API injectManifest não aplica)"
  - "Pitfall 5: ensureDataVersion limpa search + downloadedVersions junto com chapters; UI nunca mente sobre estado baixado"
  - "Pitfall 6: fetch /data/search/<v>.json no downloadTranslation tenta persistir índice; 404/erro vira skip silencioso (índice pode não existir ainda)"
  - "A6: navigator.storage.estimate() feature-detect no DownloadModal — ocultar quando API ausente"

patterns-established:
  - "Seletor bottom-sheet: overlay bg-black/40 + painel rounded-t-3xl + Escape handler + aria-current (padrão book-picker reusado)"
  - "Download sob demanda com IDB (corpus não-precacheado): loadBookIntoStore por livro + onProgress + meta downloadedVersions"

requirements-completed: [LEI-02, OFF-02]

coverage:
  - id: D1
    description: "Troca de tradução tb↔alm1911 sem reload no mesmo capítulo com URL ?v= e persistência localStorage"
    requirement: LEI-02
    verification:
      - kind: e2e
        ref: "scripts/task1-e2e.cjs#swap-and-persist"
        status: unknown
    human_judgment: true
    rationale: "E2E Playwright exige servidor dev ativo e navegador — não executado inline nesta sessão; verificador manual deve percorrer fluxo tb→alm1911→tb em João 3 conferindo texto muda, URL ?v= e bs-version"
  - id: D2
    description: "BLIVRE baixável sob demanda (66 livros -> IDB) com modal de progresso e leitura offline pós-download"
    requirement: OFF-02
    verification:
      - kind: other
        ref: "node scripts/generate-data.mjs + node -e asserções index.json (versions.length===3, has blivre) + public/sw.js não contém data/blivre"
        status: pass
      - kind: other
        ref: "npx tsc --noEmit (exit 0) + npm run build (exit 0)"
        status: pass
    human_judgment: true
    rationale: "Fluxo de download BLIVRE completo (modal -> 66/66 -> badge) + reload offline exige E2E Playwright ativo — ainda não executado end-to-end nesta sessão"

duration: 32min
completed: 2026-08-11
status: complete
---

# Phase 2 Plan 01: Troca de Traduções + Download BLIVRE Summary

**Troca instantânea tb↔alm1911 via estado React + URL `?v=` e download sob demanda da Bíblia Livre (66 livros) para IndexedDB v2 com precache do SW preservado em ~45MB**

## Performance

- **Duration:** ~32 min (3 tasks + 1 fix de verificação)
- **Started:** 2026-08-11T11:35Z (commit 8b3eaa8)
- **Completed:** 2026-08-11T12:07Z (commit 102dff1)
- **Tasks:** 3
- **Files modified:** 10 (6 modified, 4 created)

## Accomplishments
- Troca de tradução sem recarregar visivelmente: estado React `version` via `useState` inicializado por `?v=` da URL (fallback `readVersion()` em localStorage `bs-version`); efeito re-renderiza capítulo automaticamente; URL `?v=` espelha estado via `history.replaceState(null, "", url.toString())` (Pitfall 4 respeitada — nunca objeto URL)
- BLIVRE embarcada em `public/data/blivre/**` (66 livros, 31102 versículos) pelo pipeline `scripts/generate-data.mjs`; `index.json` lista 3 traduções; Service Worker precache **exclui** BLIVRE via filtro `startsWith("data/blivre")` / `startsWith("data/search/blivre")` no `walk()` de `collectPublicFiles()` (D-03, app mantém ~45MB)
- IDB v2 com stores `study`, `plans`, `search` (idempotentes no `onupgradeneeded`); meta `downloadedVersions` rastreia traduções baixadas; `ensureDataVersion` limpa `chapters + search + downloadedVersions` em mudança de `dataVersion` (Pitfall 5: badge honesto pós-update)
- `downloadTranslation(code, onProgress)` baixa 66 livros via `loadBookIntoStore` reusado, tenta persistir search index (404=skip silencioso — Pitfall 6)
- DownloadModal com barra de progresso `done/total`, estado done/error com "Tentar novamente", `navigator.storage.estimate()` feature-detect
- VersionPicker bottom-sheet com badges `Em uso` / `Baixada` / `Baixar` (BLIVRE não baixada); aria-current no item atual

## Task Commits

1. **Task 1 (tracer): Troca de traduções instantânea tb↔alm1911 sem reload** — `8b3eaa8` (feat) + `task1-e2e.cjs` (E2E Playwright sob demanda)
2. **Task 2: BLIVRE no pipeline + exclusão do precache** — `e90009c` (feat,generate-data.mjs) + `8a5f1dd` (fix,next.config.ts filtro — split por arquivo, mesmo task; verificado por `task2-verify.cjs` com asserções index.json + sw.js)
3. **Task 3: IDB v2 + downloadTranslation + DownloadModal + estado no seletor** — `102dff1` (feat, 4 arquivos: bible.ts, download-modal.tsx, reader.tsx, eslint.config.mjs)

## Files Created/Modified
- `src/lib/bible.ts` — `DB_VERSION=2`; stores `study`/`plans`/`search`; `DOWNLOADED_KEY`; `getDownloadedVersions`, `putSearchIndex`, `getSearchIndex`, `downloadTranslation`; `ensureDataVersion` estendido (`clearStore` + `writeMeta DOWNLOADED_KEY="[]"`); `clearStore` helper genérico
- `src/lib/settings.ts` — `VERSION_KEY="bs-version"`, `SUPPORTED_VERSIONS` (`["tb","alm1911","blivre"]`), `readVersion`/`writeVersion`
- `src/components/reader.tsx` — estado `version` via `useState(initialVersion)`; efeito `getChapter(version, ...)` reage a `version`; `writeVersion(version)` no efeito de capítulo; `downloaded` + `downloadTarget` + `handleDownloadDone`; `<DownloadModal>` + `<VersionPicker onManageDownload>` wired
- `src/components/version-picker.tsx` — NOVO: bottom-sheet Padão book-picker: `aria-current`, `Em uso`/`Baixada`/`Baixar`
- `src/components/download-modal.tsx` — NOVO: `downloadTranslation(code, onProgress)`, barra de progresso, estado done/error com retry, `navigator.storage.estimate()` feature-detect
- `scripts/generate-data.mjs` — 3ª entrada `blivre` (label "Bíblia Livre", shortLabel "BLIVRE")
- `next.config.ts` — filtro `childRel.startsWith("data/blivre") || childRel.startsWith("data/search/blivre")` no `walk()`
- `eslint.config.mjs` — `scripts/*.cjs` fora do lint TS (E2E CommonJS ad-hoc)
- `scripts/task1-e2e.cjs` — E2E Playwright para swap tb↔alm1911 (URL `?v=`, texte do capítulo, `bs-version`, sem reload)
- `scripts/task2-verify.cjs` — asserções `index.json (versions.length===3, has blivre)` + `public/sw.js` sem `data/blivre` / `search/blivre`

## Decisions Made
- **D-01** Troca sem reload via estado React (`useState<string>` em reader.tsx:65 carregado por `initialVersion`). Removido `const VERSION = "tb"` (linha 8 original) — `version` vira dep do efeito de capítulo e da `prefetchAdjacent`.
- **D-02** URL `?v=` é o estado navegável: no deep-link (`?b=42&c=2&v=alm1911`), vence `localStorage`. Efeito separado: quando `index` carrega, se `?v=` presente e válido (`SUPPORTED_VERSIONS`), sobrescreve o `version` inicial.
- **D-03** Filtro no `walk()` de `collectPublicFiles` (não globIgnores — API injectManifest não aplica). Cobre `public/data/blivre/**` E `public/data/search/blivre.json` (este último disponível após 02-02 gerar o índice).
- **Pitfall 5 (backstop)** `ensureDataVersion` estendido: além de `clearChapters`, chama `clearStore(db, SEARCH_STORE)` e `writeMeta(db, DOWNLOADED_KEY, "[]")` em mudança de `dataVersion`. Badge Baixada some — usuário re-baixa na nova versão de dados honestamente.
- **Pitfall 6** `downloadTranslation` tenta `fetch /data/search/${versionCode}.json` e `putSearchIndex` quando `res.ok`. 404/erro → `catch` silencioso (índice pode ainda não existir; gerado no 02-02).
- **A6** `DownloadModal`: `if (typeof navigator === "undefined" || !navigator.storage?.estimate) return;` antes de chamar — ocultar "Espaço em uso ~X MB" quando a API não existe.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] E2E CommonJS excluído do lint TS**
- **Found during:** Task 1 (E2E Playwright em `scripts/task1-e2e.cjs`)
- **Issue:** `eslint.config.mjs` não ignorava `scripts/*.cjs` (CommonJS ad-hoc, fora do build TS) — lint falhava ao parsear `require`/`module.exports` em ESM config.
- **Fix:** Adicionado `"scripts/*.cjs"` ao `ignores` do flat config.
- **Files modified:** eslint.config.mjs
- **Verification:** `npm run lint` roda sem erros em `scripts/*.cjs`.
- **Committed in:** `8b3eaa8` (Task 1) e complementado no commit `102dff1` (Task 3) quando o arquivo ainda estava sujo na árvore

---

**Total deviations:** 1 auto-fixed (Rule 2 — infra de teste)
**Impact on plan:** Infra de teste mínima, sem scope creep.

## Issues Encountered
- Executor inline anterior (sessão prévia) completou Tasks 1 e 2 atomicamente mas a Task 3 ficou parcialmente na árvore de trabalho (src/lib/bible.ts + src/components/reader.tsx modificados, src/components/download-modal.tsx untracked) e o SUMMARY nunca foi escrito. Esta sessão completou o commit da Task 3 (`102dff1`) e produziu este SUMMARY, normalizando o estado do plano.

## Known Stubs
Nenhum. Todo fluxo está wired: `downloadTranslation` -> `loadBookIntoStore` -> IDB chapters; `DownloadModal` chama em `open + versionCode`; `VersionPicker` dispara `onManageDownload("blivre")`; `reader.tsx` mantém `downloaded` via `getDownloadedVersions()` no mount.

## Threat Flags
Nenhuma nova superfície de ameaça fora do `<threat_model>` do plano. Renderização de versículos permanece texto puro via React (sem `dangerouslySetInnerHTML` — verificado por `grep -rn "dangerouslySetInnerHTML" src/` retornar 0).

## User Setup Required
Nenhum — sem serviços externos nesta fase.

## Next Phase Readiness
- **02-02** pode construir FTS (MiniSearch) em `/data/search/<v>.json`: o store `search` já existe no IDB, `putSearchIndex`/`getSearchIndex` expostos, `downloadTranslation` já persiste o índice.
- **02-03** pode usar stores `study` (anotações, marcadores) e `plans` (planos de leitura) já criados no `onupgradeneeded`.
- `SUPPORTED_VERSIONS` em `settings.ts` é a fonte canônica esperada por `02-02` (SEARCH_OPTIONS espelhada em `src/lib/search-options.ts`).
- Reconstrução do pipeline de dados NÃO necessária para 02-02/02-03 (BLIVRE já embarcada).

---
*Phase: 02-estudo-e-personaliza-o*
*Completed: 2026-08-11*
