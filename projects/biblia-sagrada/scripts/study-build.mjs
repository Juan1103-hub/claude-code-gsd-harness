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
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
