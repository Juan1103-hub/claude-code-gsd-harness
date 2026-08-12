/**
 * Extrai a tradução NTLH de um APK fornecido pelo usuário para data/raw/NTLH.json
 * (formato do pipeline: array de 66 livros com { abbrev, name, chapters }).
 *
 * Uso:
 *   node scripts/extract-ntlh.mjs <caminho-do-APK> [caminho-do-sqlite-extraido]
 *
 * O script descompacta internamente `assets/flutter_assets/assets/NTLH.sqlite`
 * do APK (é um ZIP) — não requer passo manual de unzip. Se o segundo argumento
 * for informado, usa o SQLite já extraído em vez de abrir o APK.
 *
 * Obs.: `data/raw/` é gitignored (convenção do projeto) — o `prebuild` de
 * `npm run build` exige que este arquivo exista localmente para regenerar
 * `public/data/ntlh/**`. Em um clone novo, rode este script antes do build.
 */
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const RAW_DIR = path.join(PROJECT_ROOT, "data", "raw");
const APK_ASSET = "assets/flutter_assets/assets/NTLH.sqlite";

async function resolveDbPath() {
  const [apkArg, dbArg] = process.argv.slice(2);
  if (dbArg) return dbArg;
  if (apkArg) {
    const apk = path.resolve(apkArg);
    try {
      await fs.access(apk);
    } catch {
      throw new Error(`APK não encontrado: ${apk}`);
    }
    const outDir = await fs.mkdtemp(path.join(os.tmpdir(), "ntlh-"));
    // APK é um ZIP: extrai apenas o SQLite da NTLH.
    const { spawnSync } = await import("node:child_process");
    const res = spawnSync("unzip", ["-o", "-j", apk, APK_ASSET, "-d", outDir], { encoding: "utf8" });
    if (res.status !== 0) {
      throw new Error(
        `Falha ao extrair ${APK_ASSET} do APK (unzip status ${res.status}). ` +
          `Confirme que o arquivo é o APK 'biblia-sagrada-ntlh' e que 'unzip' está no PATH.`,
      );
    }
    const extracted = path.join(outDir, path.basename(APK_ASSET));
    try {
      await fs.access(extracted);
    } catch {
      throw new Error(`'${APK_ASSET}' não encontrado dentro do APK — APK inesperado?`);
    }
    console.log(`SQLite extraído: ${extracted}`);
    return extracted;
  }
  throw new Error(
    "Uso: node scripts/extract-ntlh.mjs <caminho-do-APK>  (ou passe o caminho do NTLH.sqlite já extraído)",
  );
}

const dbPath = await resolveDbPath();
const db = new DatabaseSync(dbPath);

// 1) Livros na ordem canônica (id do SQLite é a ordem canônica: 1=Gn ... 66=Ap).
const books = db.prepare("SELECT id, name, abbr FROM book ORDER BY id").all();

// 2) Versículos agrupados por livro/capítulo, ordenados por verse.
const verses = db.prepare("SELECT book_id, chapter, verse, text FROM verse ORDER BY book_id, chapter, verse").all();

const byBook = new Map();
for (const v of verses) {
  if (!byBook.has(v.book_id)) byBook.set(v.book_id, new Map());
  const ch = byBook.get(v.book_id);
  if (!ch.has(v.chapter)) ch.set(v.chapter, []);
  ch.get(v.chapter).push(v.text);
}

const booksOut = [];
let totalVerses = 0;
for (const book of books) {
  const chaptersMap = byBook.get(book.id);
  if (!chaptersMap) throw new Error(`livro ${book.id} (${book.abbr}) sem versículos`);
  const chapterNumbers = [...chaptersMap.keys()].sort((a, b) => a - b);
  const chapters = chapterNumbers.map((n) => chaptersMap.get(n));
  booksOut.push({ abbrev: book.abbr, name: book.name, chapters });
  totalVerses += chapters.reduce((a, c) => a + c.length, 0);
}

// 3) Validação contra o canonical do projeto (abbrev e nº de capítulos por livro).
const rawIndex = JSON.parse(await fs.readFile(path.join(PROJECT_ROOT, "public", "data", "index.json"), "utf8"));
const canonical = rawIndex.books;
if (booksOut.length !== canonical.length) {
  throw new Error(`NTLH: ${booksOut.length} livros, canonical espera ${canonical.length}`);
}
for (let i = 0; i < booksOut.length; i++) {
  const b = booksOut[i];
  const c = canonical[i];
  if (b.abbrev !== c.abbrev) {
    throw new Error(`NTLH: posição ${i}: abbrev "${b.abbrev}" ≠ canonical "${c.abbrev}"`);
  }
  if (b.chapters.length !== c.chapters) {
    throw new Error(`NTLH: ${b.abbrev}: ${b.chapters.length} capítulos ≠ canonical ${c.chapters}`);
  }
}

await fs.mkdir(RAW_DIR, { recursive: true });
const outPath = path.join(RAW_DIR, "NTLH.json");
await fs.writeFile(outPath, JSON.stringify(booksOut), "utf8");
console.log(`OK: ${outPath} (${booksOut.length} livros, ${totalVerses} versículos)`);
