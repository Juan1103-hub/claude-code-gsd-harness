export interface BibleVersionMeta {
  code: string;
  label: string;
  shortLabel: string;
  books: number;
  totalVerses: number;
}

export interface BibleBook {
  id: number;
  abbrev: string;
  name: string;
  chapters: number;
}

export interface BibleIndex {
  dataVersion: string;
  versions: BibleVersionMeta[];
  books: BibleBook[];
}

export interface Chapter {
  book: BibleBook;
  version: BibleVersionMeta;
  chapter: number;
  verses: string[];
}

const DB_NAME = "biblia-sagrada";
const DB_VERSION = 2;
const CHAPTERS_STORE = "chapters";
const META_STORE = "meta";
const STUDY_STORE = "study";
const PLANS_STORE = "plans";
const SEARCH_STORE = "search";
const DATA_VERSION_KEY = "dataVersion";
const DOWNLOADED_KEY = "downloadedVersions";

let dbPromise: Promise<IDBDatabase> | null = null;
let indexCache: BibleIndex | null = null;

/** Serializa a transição de versão de dados (clear + write meta), evitando race. */
let versionQueue: Promise<void> = Promise.resolve();
function runExclusive(task: () => Promise<void>): Promise<void> {
  const run = versionQueue.then(task, task);
  versionQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

/** Deduplica a carga em andamento de um mesmo livro (fetch único por livro). */
const inFlightLoads = new Map<string, Promise<void>>();

function openDb(): Promise<IDBDatabase> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB não está disponível no servidor"));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(CHAPTERS_STORE)) {
          db.createObjectStore(CHAPTERS_STORE, { keyPath: ["version", "book", "chapter"] });
        }
        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE);
        }
        // IDB v2 (plano 02-01): stores das fases seguintes criados aqui, idempotente.
        if (!db.objectStoreNames.contains(STUDY_STORE)) {
          db.createObjectStore(STUDY_STORE, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(PLANS_STORE)) {
          db.createObjectStore(PLANS_STORE, { keyPath: "planId" });
        }
        if (!db.objectStoreNames.contains(SEARCH_STORE)) {
          db.createObjectStore(SEARCH_STORE, { keyPath: "versionCode" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        dbPromise = null;
        reject(request.error);
      };
      request.onblocked = () => {
        dbPromise = null;
        reject(new Error("Abertura do IndexedDB bloqueada"));
      };
    });
  }
  return dbPromise;
}

export async function getIndex(): Promise<BibleIndex> {
  if (typeof window === "undefined") {
    throw new Error("getIndex só está disponível no cliente");
  }
  if (indexCache) return indexCache;
  const res = await fetch("/data/index.json");
  if (!res.ok) {
    throw new Error(`Falha ao carregar índice de dados (HTTP ${res.status})`);
  }
  indexCache = (await res.json()) as BibleIndex;
  return indexCache;
}

async function readMeta(db: IDBDatabase, key: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, "readonly");
    const request = tx.objectStore(META_STORE).get(key);
    request.onsuccess = () => resolve((request.result as string | undefined) ?? null);
    request.onerror = () => reject(request.error);
  });
}

async function writeMeta(db: IDBDatabase, key: string, value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, "readwrite");
    tx.objectStore(META_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function clearChapters(db: IDBDatabase): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CHAPTERS_STORE, "readwrite");
    tx.objectStore(CHAPTERS_STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function clearStore(db: IDBDatabase, storeName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Garante que a versão de dados persistida é a mesma do build atual.
 * Se o índice indicar outra versão (build novo com dados regenerados),
 * descarta o cache local (chapters + search + downloadedVersions) e
 * repopula sob demanda — Pitfall 5: a UI nunca diz "baixada" para dados
 * apagados; traduções baixadas viram cache versionado (badge some, usuário
 * re-baixa na nova dataVersion).
 */
async function ensureDataVersion(db: IDBDatabase, index: BibleIndex): Promise<void> {
  const current = await readMeta(db, DATA_VERSION_KEY);
  if (current !== index.dataVersion) {
    await clearChapters(db);
    await clearStore(db, SEARCH_STORE);
    await writeMeta(db, DOWNLOADED_KEY, "[]");
    await writeMeta(db, DATA_VERSION_KEY, index.dataVersion);
  }
}

/** Códigos de tradução baixadas por completo (meta downloadedVersions). */
export async function getDownloadedVersions(): Promise<string[]> {
  const db = await openDb();
  const raw = await readMeta(db, DOWNLOADED_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Guarda o índice de busca serializado (plano 02-02) para uso offline. */
export async function putSearchIndex(versionCode: string, json: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SEARCH_STORE, "readwrite");
    tx.objectStore(SEARCH_STORE).put({ versionCode, json });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getSearchIndex(versionCode: string): Promise<string | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SEARCH_STORE, "readonly");
    const request = tx.objectStore(SEARCH_STORE).get(versionCode);
    request.onsuccess = () => {
      const row = request.result as { json: string } | undefined;
      resolve(row ? row.json : null);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Baixa todos os 66 livros de uma tradução para o store chapters (fetch único
 * por livro via loadBookIntoStore, idempotente). Se public/data/search/<v>.json
 * existir, também o persiste no store search (Pitfall 6: índice pode ainda não
 * existir no build atual — 404 vira skip silencioso). Ao final, registra a
 * tradução em downloadedVersions.
 */
export async function downloadTranslation(
  versionCode: string,
  onProgress: (done: number, total: number) => void,
): Promise<void> {
  const index = await getIndex();
  const version = index.versions.find((v) => v.code === versionCode);
  if (!version) {
    throw new Error(`Versão desconhecida: ${versionCode}`);
  }
  const db = await openDb();
  const total = index.books.length;
  let done = 0;
  for (const book of index.books) {
    await loadBookIntoStore(db, versionCode, book);
    done += 1;
    onProgress(done, total);
  }
  // Índice de busca do plano 02-02: persiste quando existir; 404/erro é silencioso.
  try {
    const res = await fetch(`/data/search/${versionCode}.json`);
    if (res.ok) {
      await putSearchIndex(versionCode, await res.text());
    }
  } catch {
    /* sem rede — índice de busca só é pré-requisito do plano 02-02 */
  }
  const downloaded = await getDownloadedVersions();
  if (!downloaded.includes(versionCode)) {
    downloaded.push(versionCode);
    await writeMeta(db, DOWNLOADED_KEY, JSON.stringify(downloaded));
  }
}

async function loadBookIntoStore(db: IDBDatabase, versionCode: string, book: BibleBook): Promise<void> {
  const res = await fetch(`/data/${versionCode}/${book.abbrev}.json`);
  if (!res.ok) {
    throw new Error(`Falha ao carregar ${book.name} (${versionCode}) — HTTP ${res.status}`);
  }
  const payload = (await res.json()) as { chapters: unknown[] };
  if (!Array.isArray(payload.chapters) || payload.chapters.length !== book.chapters) {
    throw new Error(
      `Dados inválidos para ${book.abbrev} (${versionCode}): esperado ${book.chapters} capítulos, recebido ${
        Array.isArray(payload.chapters) ? payload.chapters.length : "não-array"
      }`,
    );
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CHAPTERS_STORE, "readwrite");
    const store = tx.objectStore(CHAPTERS_STORE);
    for (let ch = 0; ch < payload.chapters.length; ch++) {
      const verses = payload.chapters[ch];
      if (!Array.isArray(verses)) {
        tx.abort();
        reject(new Error(`Dados inválidos para ${book.abbrev} (${versionCode}): capítulo ${ch + 1} não é um array`));
        return;
      }
      store.put({ version: versionCode, book: book.id, chapter: ch, verses: verses as string[] });
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function ensureBookLoaded(db: IDBDatabase, versionCode: string, book: BibleBook): Promise<void> {
  const key = `${versionCode}/${book.id}`;
  const existing = inFlightLoads.get(key);
  if (existing) return existing;
  const load = loadBookIntoStore(db, versionCode, book).finally(() => inFlightLoads.delete(key));
  inFlightLoads.set(key, load);
  return load;
}

async function getStoredChapter(db: IDBDatabase, versionCode: string, bookId: number, chapter: number): Promise<string[] | null> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CHAPTERS_STORE, "readonly");
    const request = tx.objectStore(CHAPTERS_STORE).get([versionCode, bookId, chapter]);
    request.onsuccess = () => {
      const row = request.result as { verses: string[] } | undefined;
      resolve(row ? row.verses : null);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retorna os versículos de um capítulo, baixando e persistindo o livro inteiro
 * em IndexedDB no primeiro acesso (fetch único por livro).
 */
export async function getChapter(versionCode: string, bookId: number, chapter: number): Promise<Chapter | null> {
  if (typeof window === "undefined") {
    throw new Error("getChapter só está disponível no cliente");
  }
  const index = await getIndex();
  const version = index.versions.find((v) => v.code === versionCode);
  const book = index.books.find((b) => b.id === bookId);
  if (!version || !book) return null;
  if (chapter < 0 || chapter >= book.chapters) return null;

  const db = await openDb();
  await runExclusive(() => ensureDataVersion(db, index));

  let verses = await getStoredChapter(db, versionCode, bookId, chapter);
  if (!verses) {
    await ensureBookLoaded(db, versionCode, book);
    verses = await getStoredChapter(db, versionCode, bookId, chapter);
  }
  if (!verses) return null;

  return { book, version, chapter, verses };
}
