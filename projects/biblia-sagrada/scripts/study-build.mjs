import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const RAW_DIR = path.join(PROJECT_ROOT, "data", "raw");
const OUT_DIR = path.join(PROJECT_ROOT, "public", "data", "study");

function validateDictionary(entries) {
  if (!Array.isArray(entries) || entries.length < 100) {
    throw new Error(
      `dictionary.json: esperado array com ≥100 verbetes, recebido ${
        Array.isArray(entries) ? entries.length : typeof entries
      }`,
    );
  }
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (
      !entry ||
      typeof entry.word !== "string" ||
      !entry.word ||
      typeof entry.definition !== "string" ||
      !entry.definition
    ) {
      throw new Error(
        `dictionary.json: entrada ${i} inválida (word/definition ausentes ou não-string)`,
      );
    }
  }
}

function validateThemes(themes) {
  if (!Array.isArray(themes) || themes.length < 10) {
    throw new Error(
      `themes.json: esperado array com ≥10 temas, recebido ${
        Array.isArray(themes) ? themes.length : typeof themes
      }`,
    );
  }
  for (let i = 0; i < themes.length; i++) {
    const theme = themes[i];
    if (
      !theme ||
      typeof theme.id !== "string" ||
      !theme.id ||
      typeof theme.title !== "string" ||
      !theme.title
    ) {
      throw new Error(
        `themes.json: tema ${i} inválido (id/title ausentes ou não-string)`,
      );
    }
    if (!Array.isArray(theme.verses) || theme.verses.length === 0) {
      throw new Error(`themes.json: tema ${theme.id} não tem versículos`);
    }
    for (let j = 0; j < theme.verses.length; j++) {
      const verse = theme.verses[j];
      if (
        !verse ||
        typeof verse.book !== "number" ||
        typeof verse.chapter !== "number" ||
        typeof verse.verse !== "number" ||
        typeof verse.text !== "string" ||
        !verse.text
      ) {
        throw new Error(
          `themes.json: tema ${theme.id}, versículo ${j} inválido (book/chapter/verse/text ausentes ou tipo errado)`,
        );
      }
    }
  }
}

function validateHymns(hymns) {
  if (!Array.isArray(hymns) || hymns.length < 30) {
    throw new Error(
      `hymns.json: esperado array com ≥30 hinos, recebido ${
        Array.isArray(hymns) ? hymns.length : typeof hymns
      }`,
    );
  }
  for (let i = 0; i < hymns.length; i++) {
    const hymn = hymns[i];
    if (
      !hymn ||
      typeof hymn.id !== "string" ||
      !hymn.id ||
      typeof hymn.title !== "string" ||
      !hymn.title
    ) {
      throw new Error(
        `hymns.json: hino ${i} inválido (id/title ausentes ou não-string)`,
      );
    }
    if (!Array.isArray(hymn.verses) || hymn.verses.length === 0) {
      throw new Error(`hymns.json: hino ${hymn.id} não tem versos`);
    }
    for (let j = 0; j < hymn.verses.length; j++) {
      const verse = hymn.verses[j];
      if (typeof verse !== "string" || !verse.trim()) {
        throw new Error(
          `hymns.json: hino ${hymn.id}, verso ${j} inválido (não-string ou vazio)`,
        );
      }
    }
  }
}

function generatePlans(indexJson) {
  const books = indexJson.books;
  const totalChapters = books.reduce((sum, b) => sum + b.chapters, 0);

  // Plano 1: Bíblia em 1 ano (365 dias)
  const bib1ano = {
    id: "bib1ano",
    title: "Bíblia em 1 ano",
    description: "Leia toda a Bíblia em 365 dias, ~3 capítulos por dia.",
    totalDays: 365,
    days: [],
  };

  // Distribui capítulos sequencialmente
  let day = 1;
  let chaptersPerDay = Math.ceil(totalChapters / 365);
  let currentReadings = [];
  let chaptersInDay = 0;

  for (const book of books) {
    for (let ch = 0; ch < book.chapters; ch++) {
      currentReadings.push({ book: book.id, chapter: ch + 1 });
      chaptersInDay++;
      if (chaptersInDay >= chaptersPerDay || (book.id === books.length - 1 && ch === book.chapters - 1)) {
        bib1ano.days.push({ day, readings: currentReadings });
        day++;
        currentReadings = [];
        chaptersInDay = 0;
      }
    }
  }

  // Plano 2: Novo Testamento em 90 dias
  const ntBooks = books.slice(39); // NT começa no livro 39 (Mateus)
  const ntTotalChapters = ntBooks.reduce((sum, b) => sum + b.chapters, 0);
  const nt90 = {
    id: "nt90",
    title: "Novo Testamento em 90 dias",
    description: "Leia o Novo Testamento em 90 dias, ~1-2 capítulos por dia.",
    totalDays: 90,
    days: [],
  };

  day = 1;
  chaptersPerDay = Math.ceil(ntTotalChapters / 90);
  currentReadings = [];
  chaptersInDay = 0;

  for (const book of ntBooks) {
    for (let ch = 0; ch < book.chapters; ch++) {
      currentReadings.push({ book: book.id, chapter: ch + 1 });
      chaptersInDay++;
      if (chaptersInDay >= chaptersPerDay || (book.id === books.length - 1 && ch === book.chapters - 1)) {
        nt90.days.push({ day, readings: currentReadings });
        day++;
        currentReadings = [];
        chaptersInDay = 0;
      }
    }
  }

  return [bib1ano, nt90];
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  // Dictionary
  const dictPath = path.join(RAW_DIR, "dictionary.json");
  if (await fs.stat(dictPath).catch(() => null)) {
    const dictionary = JSON.parse(await fs.readFile(dictPath, "utf8"));
    validateDictionary(dictionary);
    await fs.writeFile(
      path.join(OUT_DIR, "dictionary.json"),
      JSON.stringify(dictionary),
      "utf8",
    );
    console.log(`dictionary.json: ${dictionary.length} verbetes`);
  } else {
    console.warn("skip dictionary.json (arquivo raw ausente)");
  }

  // Themes
  const themesPath = path.join(RAW_DIR, "themes.json");
  if (await fs.stat(themesPath).catch(() => null)) {
    const themes = JSON.parse(await fs.readFile(themesPath, "utf8"));
    validateThemes(themes);
    await fs.writeFile(
      path.join(OUT_DIR, "themes.json"),
      JSON.stringify(themes),
      "utf8",
    );
    console.log(`themes.json: ${themes.length} temas`);
  } else {
    console.warn("skip themes.json (arquivo raw ausente)");
  }

  // Hymns
  const hymnsPath = path.join(RAW_DIR, "hymns.json");
  if (await fs.stat(hymnsPath).catch(() => null)) {
    const hymns = JSON.parse(await fs.readFile(hymnsPath, "utf8"));
    validateHymns(hymns);
    await fs.writeFile(
      path.join(OUT_DIR, "hymns.json"),
      JSON.stringify(hymns),
      "utf8",
    );
    console.log(`hymns.json: ${hymns.length} hinos`);
  } else {
    console.warn("skip hymns.json (arquivo raw ausente)");
  }

  // Plans (gerado algoritmicamente do index.json)
  const indexPath = path.join(PROJECT_ROOT, "public", "data", "index.json");
  if (await fs.stat(indexPath).catch(() => null)) {
    const indexJson = JSON.parse(await fs.readFile(indexPath, "utf8"));
    const plans = generatePlans(indexJson);
    await fs.writeFile(
      path.join(OUT_DIR, "plans.json"),
      JSON.stringify(plans),
      "utf8",
    );
    console.log(`plans.json: ${plans.length} planos (${plans[0].days.length} + ${plans[1].days.length} dias)`);
  } else {
    console.warn("skip plans.json (index.json ausente)");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
