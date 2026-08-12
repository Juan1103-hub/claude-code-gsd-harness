import { DatabaseSync } from "node:sqlite";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const RAW_DIR = path.join(PROJECT_ROOT, "data", "raw");
const DB_PATH = process.env.NTLH_DB_PATH ?? path.join(os.tmpdir(), "ntlh_extract", "NTLH.sqlite");

const db = new DatabaseSync(DB_PATH);

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
