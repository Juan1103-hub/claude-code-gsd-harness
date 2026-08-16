import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import MiniSearch from "minisearch";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(PROJECT_ROOT, "public", "data");

/**
 * MANTENHA EM SINCRONIA COM src/lib/search-options.ts
 * (Pitfall 1: o build não importa TS; duplicamos as options aqui e o verify
 * do plano confere igualdade via deep-equal das duas constantes).
 */
const SEARCH_OPTIONS = {
  fields: ["text"],
  storeFields: ["book", "abbrev", "chapter", "verse", "text"],
  idField: "id",
  processTerm: (term) => {
    const normalized = term
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    const STOP = new Set([
      "a",
      "de",
      "do",
      "da",
      "em",
      "e",
      "o",
      "os",
      "as",
      "um",
      "uma",
      "que",
      "para",
      "dos",
      "das",
      "nao",
      "se",
      "com",
    ]);
    if (STOP.has(normalized) || normalized.length < 2) return null;
    return normalized;
  },
};

export { SEARCH_OPTIONS };

async function buildSearchIndex(versionCode) {
  const versionDir = path.join(OUT_DIR, versionCode);
  const searchDir = path.join(OUT_DIR, "search");
  await fs.mkdir(searchDir, { recursive: true });

  if (!(await fs.stat(versionDir).catch(() => null))) {
    console.warn(`skip ${versionCode} (diretório ausente)`);
    return;
  }

  const indexJson = JSON.parse(
    await fs.readFile(path.join(OUT_DIR, "index.json"), "utf8"),
  );
  const version = indexJson.versions.find((v) => v.code === versionCode);
  if (!version) {
    console.warn(`skip ${versionCode} (não está em index.json)`);
    return;
  }

  const docs = [];
  for (const book of indexJson.books) {
    const bookFile = path.join(versionDir, `${book.abbrev}.json`);
    if (!(await fs.stat(bookFile).catch(() => null))) continue;
    const bookData = JSON.parse(await fs.readFile(bookFile, "utf8"));
    for (let ch = 0; ch < bookData.chapters.length; ch++) {
      const verses = bookData.chapters[ch];
      for (let v = 0; v < verses.length; v++) {
        docs.push({
          id: `${book.id}:${ch}:${v}`,
          book: book.id,
          abbrev: book.abbrev,
          chapter: ch,
          verse: v,
          text: verses[v],
        });
      }
    }
  }

  const ms = new MiniSearch(SEARCH_OPTIONS);
  ms.addAll(docs);
  const serialized = JSON.stringify(ms);
  const outputPath = path.join(searchDir, `${versionCode}.json`);
  await fs.writeFile(outputPath, serialized, "utf8");
  const bytes = serialized.length;
  console.log(
    `${versionCode}: ${(bytes / 1024).toFixed(1)}KB, ${docs.length} docs`,
  );
}

async function main() {
  const indexJson = JSON.parse(
    await fs.readFile(path.join(OUT_DIR, "index.json"), "utf8"),
  );
  for (const version of indexJson.versions) {
    await buildSearchIndex(version.code);
  }
}

// Roda o build apenas quando executado diretamente; quando importado (ex.:
// check de paridade) expõe só SEARCH_OPTIONS sem efeitos colaterais.
// No Windows a comparação de caminho ignora maiúsculas/minúsculas.
const isDirectRun =
  process.argv[1] &&
  (process.platform === "win32"
    ? fileURLToPath(import.meta.url).toLowerCase() ===
      path.resolve(process.argv[1]).toLowerCase()
    : fileURLToPath(import.meta.url) === path.resolve(process.argv[1]));
if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
