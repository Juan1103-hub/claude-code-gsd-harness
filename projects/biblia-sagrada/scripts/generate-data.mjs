import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const RAW_DIR = path.join(PROJECT_ROOT, "data", "raw");
const OUT_DIR = path.join(PROJECT_ROOT, "public", "data");

const VERSIONS = [
  { code: "tb", label: "Tradução Brasileira", shortLabel: "TB" },
  { code: "alm1911", label: "João Ferreira de Almeida (1911)", shortLabel: "ALM 1911" },
  { code: "blivre", label: "Bíblia Livre", shortLabel: "BLIVRE", downloadable: true },
  { code: "ntlh", label: "Nova Tradução na Linguagem de Hoje", shortLabel: "NTLH", downloadable: true },
  { code: "acf", label: "Almeida Corrigida Fiel", shortLabel: "ACF", downloadable: true },
  { code: "arc", label: "Almeida Revista e Corrigida", shortLabel: "ARC", downloadable: true },
];

function chapterCounts(books) {
  return books.map((b) => b.chapters.length);
}

function verseCounts(books) {
  return books.map((b) => b.chapters.map((c) => c.length));
}

function assertValidShape(books, versionCode) {
  const seenAbbrevs = new Set();
  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    if (!book || typeof book.abbrev !== "string" || !book.abbrev || typeof book.name !== "string" || !book.name) {
      throw new Error(`${versionCode}: livro ${i} inválido (abbrev/name ausentes)`);
    }
    if (seenAbbrevs.has(book.abbrev)) {
      throw new Error(`${versionCode}: abbrev duplicado "${book.abbrev}"`);
    }
    seenAbbrevs.add(book.abbrev);
    if (!Array.isArray(book.chapters) || !book.chapters.every((c) => Array.isArray(c) && c.every((v) => typeof v === "string"))) {
      throw new Error(`${versionCode}: livro ${book.abbrev} tem estrutura de capítulos inválida`);
    }
  }
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const metaByCode = {};
  let booksCanonical = null;
  let baseVerseCounts = null;

  for (const version of VERSIONS) {
    const rawPath = path.join(RAW_DIR, `${version.code.toUpperCase()}.json`);
    const raw = JSON.parse(await fs.readFile(rawPath, "utf8"));

    if (!Array.isArray(raw) || raw.length !== 66) {
      throw new Error(`${version.code}: esperado array de 66 livros, recebido ${Array.isArray(raw) ? raw.length : typeof raw}`);
    }
    assertValidShape(raw, version.code);

    const chapters = chapterCounts(raw);
    const verses = verseCounts(raw);

    if (booksCanonical === null) {
      booksCanonical = raw.map((book, i) => ({
        id: i,
        abbrev: book.abbrev,
        name: book.name,
        chapters: chapters[i],
      }));
      baseVerseCounts = verses;
    } else {
      for (let i = 0; i < 66; i++) {
        // Pitfall 7: abreviação fora do padrão canônico (ex.: ACF usa "1Tn" para
        // 1 Timóteo) geraria arquivo com nome errado e o search-build pularia o
        // livro em silêncio → tradução incompleta sem erro. Falha aqui em vez disso.
        if (raw[i].abbrev !== booksCanonical[i].abbrev) {
          throw new Error(`${version.code}: livro ${i} abbrev "${raw[i].abbrev}" ≠ canonical "${booksCanonical[i].abbrev}"`);
        }
        if (chapters[i] !== booksCanonical[i].chapters) {
          throw new Error(`${version.code}: livro ${booksCanonical[i].abbrev} tem ${chapters[i]} capítulos, base espera ${booksCanonical[i].chapters}`);
        }
      }
      const verseDiffs = verses
        .map((capVerses, bookIdx) => {
          const bookDiffs = capVerses
            .map((n, chIdx) => (n === baseVerseCounts[bookIdx][chIdx] ? null : `${chIdx + 1}:${baseVerseCounts[bookIdx][chIdx]}/${n}`))
            .filter(Boolean);
          return bookDiffs.length ? `${booksCanonical[bookIdx].abbrev}[${bookDiffs.join(", ")}]` : null;
        })
        .filter(Boolean);
      if (verseDiffs.length) {
        console.warn(`${version.code}: variações de versículos por capítulo (ignoradas, cada tradução mantém seu capítulo):`);
        for (const d of verseDiffs.slice(0, 10)) console.warn(`  - ${d}`);
      }
    }

    const versionDir = path.join(OUT_DIR, version.code);
    await fs.mkdir(versionDir, { recursive: true });

    for (let i = 0; i < raw.length; i++) {
      const book = raw[i];
      const filePath = path.join(versionDir, `${book.abbrev}.json`);
      const payload = JSON.stringify({ chapters: book.chapters.map((c) => c.map((v) => v.trim())) });
      await fs.writeFile(filePath, payload, "utf8");
    }

    metaByCode[version.code] = {
      ...version,
      books: 66,
      totalVerses: verses.reduce((a, b) => a + b.reduce((x, y) => x + y, 0), 0),
    };
    console.log(`${version.code}: 66 livros, ${metaByCode[version.code].totalVerses} versículos, capítulos=${JSON.stringify(chapters.slice(0, 3))}...`);
  }

  // Títulos de seção (NTLH, extraídos do site oficial da SBB via bibliajfa).
  // Formato: { "<abbrev>": { "<capitulo>": [{ "v": n, "title": "..." }] } }
  // Usado pelo leitor como subtítulos editoriais acima dos versículos.
  const titlesRawPath = path.join(RAW_DIR, "ntlh-titles.json");
  try {
    const titlesRaw = JSON.parse(await fs.readFile(titlesRawPath, "utf8"));
    await fs.writeFile(path.join(OUT_DIR, "titles.json"), JSON.stringify(titlesRaw), "utf8");
    const totalTitles = Object.values(titlesRaw).reduce(
      (a, chapters) => a + Object.values(chapters).reduce((x, list) => x + list.length, 0),
      0,
    );
    console.log(`titles.json gerado (${Object.keys(titlesRaw).length} livros, ${totalTitles} títulos de seção)`);
  } catch (err) {
    console.warn(`Aviso: sem data/raw/ntlh-titles.json (${err.message}) — leitor sem títulos de seção.`);
  }

  const indexBody = {
    versions: Object.values(metaByCode),
    books: booksCanonical,
  };
  const dataVersion = createHash("md5").update(JSON.stringify(indexBody)).digest("hex").slice(0, 12);
  const index = { dataVersion, ...indexBody };
  await fs.writeFile(path.join(OUT_DIR, "index.json"), JSON.stringify(index), "utf8");
  console.log(`index.json gerado (dataVersion=${dataVersion}) com`, index.books.length, "livros e", index.versions.length, "traduções");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
