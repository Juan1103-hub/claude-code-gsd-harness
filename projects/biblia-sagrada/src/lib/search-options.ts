import { type Options, type SearchOptions } from "minisearch";

type SearchDoc = {
  id: string;
  book: number;
  abbrev: string;
  chapter: number;
  verse: number;
  text: string;
};

/**
 * Opções do MiniSearch — MANTENHA EM SINCRONIA COM scripts/search-build.mjs
 * (Pitfall 1: loadJSON exige as mesmas options usadas no addAll).
 */
export const SEARCH_OPTIONS: Options<SearchDoc> = {
  fields: ["text"],
  storeFields: ["book", "abbrev", "chapter", "verse", "text"],
  idField: "id",
  processTerm: (term: string) => {
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
    if (STOP.has(normalized) || !normalized) return null;
    return normalized;
  },
};

export const SEARCH_QUERY_OPTS: SearchOptions = {
  prefix: true,
  fuzzy: 0.1,
  combineWith: "AND",
};

/**
 * Normaliza um termo de busca (NFD strip + lowercase + stopwords).
 * Mesma lógica de SEARCH_OPTIONS.processTerm — usada pelo client para
 * normalizar o input antes de passar ao MiniSearch.search().
 */
export function normalizeTerm(term: string): string {
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
  if (STOP.has(normalized) || !normalized) return "";
  return normalized;
}
