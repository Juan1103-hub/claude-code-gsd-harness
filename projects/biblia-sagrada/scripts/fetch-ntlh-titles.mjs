// Baixa capítulos da NTLH (site bibliajfa.com.br, versão SSR) e extrai os títulos de seção
// com o número do versículo onde cada seção começa.
//
// Uso: node scripts/fetch-ntlh-titles.mjs [--book=NN] [--all]
// Saída: data/raw/ntlh-titles.json  => { "<ABREV>": { "<capitulo>": [{ "v": n, "title": "..." }] } }
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const BASE = 'https://bibliajfa.com.br/app/ntlh';
const OUT = 'data/raw/ntlh-titles.json';

// Ordem canônica dos 66 livros: nome canônico usado no index.json
const CANON = JSON.parse(readFileSync('public/data/index.json', 'utf8'));

function codeFor(index) {
  // index é 0-based; livro 1 => 01O ... 39 => 39O, 40 => 40N ... 66 => 66N
  const n = index + 1;
  const suffix = n <= 39 ? 'O' : 'N';
  return String(n).padStart(2, '0') + suffix;
}

// Extrai títulos de seção do HTML da página.
// Formato SSR: <h2>Livro N</h2> ... <h3 class="text-lg font-headline font-semibold ...">TÍTULO</h3>
// Os versículos vêm em <blockquote> ... <span id="v-N"> ... </span> ... </blockquote>
// Ou no payload JSON (initialVerses com campo "title").
function extractTitles(html) {
  const titles = [];

  // 1) Tenta o payload JSON: procurar "initialVerses":[{...number,title...}]
  const m = html.match(/initialVerses":(\[.*?\])/);
  if (m) {
    try {
      // o JSON pode ter \\n escapado
      const clean = m[1].replace(/\\n/g, ' ').replace(/\\"/g, '"');
      const arr = JSON.parse(clean);
      for (const v of arr) {
        if (v && v.title && typeof v.title === 'string' && v.title.length > 2) {
          titles.push({ v: v.number, title: v.title.replace(/\s+/g, ' ').trim() });
        }
      }
      if (titles.length) return titles;
    } catch {
      // fallback abaixo
    }
  }

  // 2) Fallback: HTML renderizado — <h3 class="...font-headline...">TÍTULO</h3>
  //    seguido de <blockquote id="verse-N"> (versículo onde a seção começa)
  const reH3 = /<h3 class="text-lg font-headline[^>]*>([^<]*)<\/h3>/g;
  let mm;
  while ((mm = reH3.exec(html)) !== null) {
    const title = mm[1].replace(/<[^>]+>/g, '').trim();
    if (!title) continue;
    // procura o próximo id="verse-N" após o título
    const after = html.slice(mm.index);
    const vm = after.match(/<blockquote id="verse-(\d+)"/);
    titles.push({ v: vm ? parseInt(vm[1], 10) : 1, title });
  }
  return titles;
}

async function fetchChapter(code, chapter, retries = 2) {
  const url = `${BASE}/${code}/${chapter}`;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (res.status === 200) return await res.text();
      if (res.status === 404) return null; // capítulo não existe
    } catch {
      /* tenta de novo */
    }
    await new Promise((r) => setTimeout(r, 800 * (i + 1)));
  }
  return null;
}

async function main() {
  const all = process.argv.includes('--all');
  const bookIdx = process.argv
    .find((a) => a.startsWith('--book='))
    ?.split('=')[1];

  const booksToFetch = bookIdx
    ? [parseInt(bookIdx, 10)]
    : all
      ? CANON.books.map((_, i) => i)
      : [0];

  const result = {};
  let failures = 0;

  for (const idx of booksToFetch) {
    const book = CANON.books[idx];
    const code = codeFor(idx);
    const chapters = book.chapters;
    const bookTitles = {};

    for (let ch = 1; ch <= chapters; ch++) {
      const html = await fetchChapter(code, ch);
      if (!html) {
        failures++;
        process.stderr.write(`  FALHA ${book.abbrev} ${ch}\n`);
        continue;
      }
      const titles = extractTitles(html);
      if (titles.length) bookTitles[ch] = titles;
      process.stdout.write(`  ${book.abbrev} ${ch}: ${titles.length} título(s)\n`);
      await new Promise((r) => setTimeout(r, 120));
    }

    result[book.abbrev] = bookTitles;
  }

  mkdirSync('data/raw', { recursive: true });
  const existing = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};
  const merged = { ...existing, ...result };
  writeFileSync(OUT, JSON.stringify(merged, null, 0));
  console.log(`\nSalvo em ${OUT} — ${Object.keys(merged).length} livros. Falhas: ${failures}`);
}

main();
