/**
 * Baixa a tradução ACF (Almeida Corrigida Fiel) do repositório `damarals/biblias`
 * (MIT) para `data/raw/ACF.json`, no formato do pipeline (array de 66 livros
 * com { abbrev, name, chapters }).
 *
 * Uso:
 *   node scripts/fetch-acf.mjs
 *
 * Normalizações aplicadas (diferenças de abreviação vs. o canônico do projeto):
 *   - "1Tn" → "1Tm" (1 Timóteo; o repositório usa "1Tn", o projeto "1Tm")
 *
 * Obs.: `data/raw/` é gitignored (convenção do projeto) — o `prebuild` de
 * `npm run build` exige que este arquivo exista localmente. Em um clone novo,
 * rode este script antes do build. ⚠️ ACF é © SBTB (ver docs/DECISIONS.md).
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const RAW_DIR = path.join(PROJECT_ROOT, "data", "raw");
const SOURCE_URL = "https://raw.githubusercontent.com/damarals/biblias/main/inst/json/ACF.json";

/** Normaliza abreviações divergentes da fonte vs. o canônico do projeto. */
const ABBREV_FIXES = { "1Tn": "1Tm" };

const res = await fetch(SOURCE_URL);
if (!res.ok) {
  throw new Error(`Falha ao baixar ACF (HTTP ${res.status}): ${SOURCE_URL}`);
}
const books = (await res.json());
if (!Array.isArray(books) || books.length !== 66) {
  throw new Error(`ACF: esperado array de 66 livros, recebido ${Array.isArray(books) ? books.length : typeof books}`);
}
for (const book of books) {
  const fix = ABBREV_FIXES[book.abbrev];
  if (fix) {
    console.log(`abbrev "${book.abbrev}" (${book.name}) → "${fix}"`);
    book.abbrev = fix;
  }
}

await fs.mkdir(RAW_DIR, { recursive: true });
const outPath = path.join(RAW_DIR, "ACF.json");
await fs.writeFile(outPath, JSON.stringify(books), "utf8");
const totalVerses = books.reduce((a, b) => a + b.chapters.reduce((x, c) => x + c.length, 0), 0);
console.log(`OK: ${outPath} (${books.length} livros, ${totalVerses} versículos)`);
