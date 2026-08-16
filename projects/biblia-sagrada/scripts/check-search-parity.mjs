// Check de paridade retido: SEARCH_OPTIONS do build (scripts/search-build.mjs)
// deve equivaler às options do client (src/lib/search-options.ts) tanto na
// estrutura quanto no comportamento de processTerm.
import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import * as ts from "typescript";
import { SEARCH_OPTIONS as BUILD_OPTIONS } from "./search-build.mjs";

const CLIENT_FILE = new URL("../src/lib/search-options.ts", import.meta.url);

// O client é TypeScript; transpila só tipos (type-only imports são erodidos)
// para obter as options em runtime sem tocar no build.
const tsSource = readFileSync(CLIENT_FILE, "utf8");
const jsSource = ts.transpileModule(tsSource, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const clientModule = await import(
  `data:text/javascript;base64,${Buffer.from(jsSource).toString("base64")}`
);
const CLIENT_OPTIONS = clientModule.SEARCH_OPTIONS;

let failed = 0;

function ok(name, cond, extra) {
  if (cond) {
    console.log(`PASS: ${name}`);
  } else {
    failed++;
    console.log(`FAIL: ${name}${extra ? " — " + extra : ""}`);
  }
}

const structuralKeys = ["fields", "storeFields", "idField"];
for (const key of structuralKeys) {
  ok(
    `estrutura: ${key} coincide`,
    isDeepStrictEqual(BUILD_OPTIONS[key], CLIENT_OPTIONS[key]),
    `build=${JSON.stringify(BUILD_OPTIONS[key])} client=${JSON.stringify(CLIENT_OPTIONS[key])}`,
  );
}

// Comportamento de processTerm sobre um corpus representativo (acentos,
// stopwords, termo curto, vazio, caixa alta, plurais).
const CORPUS = [
  "Salvação",
  "salvacao",
  "ÁGUA",
  "O",
  "A",
  "de",
  "do",
  "da",
  "dos",
  "das",
  "em",
  "os",
  "as",
  "um",
  "uma",
  "para",
  "se",
  "e",
  "não",
  "NAO",
  "x",
  "b",
  "",
  "Filho",
  "filhos",
  "que",
  "com",
  "Salv",
];
for (const term of CORPUS) {
  const build = BUILD_OPTIONS.processTerm(term);
  const client = CLIENT_OPTIONS.processTerm(term);
  ok(
    `processTerm("${term}") coincide`,
    isDeepStrictEqual(build, client),
    `build=${JSON.stringify(build)} client=${JSON.stringify(client)}`,
  );
}

console.log(`\nRESULTADO: paridade de busca ${failed === 0 ? "OK" : `${failed} divergências`}`);
process.exit(failed > 0 ? 1 : 0);
