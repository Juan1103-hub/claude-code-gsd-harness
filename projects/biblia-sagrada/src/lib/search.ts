import MiniSearch from "minisearch";
import { SEARCH_OPTIONS, SEARCH_QUERY_OPTS } from "@/lib/search-options";
import { getSearchIndex, putSearchIndex } from "@/lib/bible";

export interface SearchResult {
  id: string;
  score: number;
  match: Record<string, string[]>;
  book: number;
  abbrev: string;
  chapter: number;
  verse: number;
  text: string;
}

type SearchDoc = {
  id: string;
  book: number;
  abbrev: string;
  chapter: number;
  verse: number;
  text: string;
};

const cache = new Map<string, MiniSearch<SearchDoc>>();

/**
 * Retorna o índice MiniSearch da tradução (lazy: memória → IDB → fetch).
 * Self-heal: se o índice não está no IDB (BLIVRE baixada sem índice no 02-01),
 * a primeira busca dispara fetch + putSearchIndex para persistir offline.
 */
export async function getSearch(
  versionCode: string,
): Promise<MiniSearch<SearchDoc>> {
  const cached = cache.get(versionCode);
  if (cached) return cached;

  // Tenta carregar do IDB (persistido via downloadTranslation no 02-01).
  try {
    const saved = await getSearchIndex(versionCode);
    if (saved) {
      const ms = MiniSearch.loadJSON(saved, SEARCH_OPTIONS);
      cache.set(versionCode, ms);
      return ms;
    }
  } catch {
    /* IDB indisponível — fallback para fetch */
  }

  // Fetch do arquivo gerado no build.
  const res = await fetch(`/data/search/${versionCode}.json`);
  if (!res.ok) {
    throw new Error(`Índice de busca indisponível: ${versionCode}`);
  }
  const json = await res.text();

  // Persiste no IDB para uso offline futuro (self-heal).
  try {
    await putSearchIndex(versionCode, json);
  } catch {
    /* IDB indisponível — continua sem persistir */
  }

  const ms = MiniSearch.loadJSON(json, SEARCH_OPTIONS);
  cache.set(versionCode, ms);
  return ms;
}

/**
 * Executa busca FTS e retorna resultados normalizados.
 */
export async function search(
  versionCode: string,
  query: string,
): Promise<SearchResult[]> {
  const ms = await getSearch(versionCode);
  const results = ms.search(query, SEARCH_QUERY_OPTS);
  return results.map((r) => ({
    id: r.id,
    score: r.score,
    match: r.match,
    book: r.book,
    abbrev: r.abbrev,
    chapter: r.chapter,
    verse: r.verse,
    text: r.text,
  }));
}
