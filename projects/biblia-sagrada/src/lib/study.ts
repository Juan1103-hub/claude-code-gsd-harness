export interface DictionaryEntry {
  word: string;
  definition: string;
}

export interface ThemeVerse {
  book: number;
  chapter: number;
  verse: number;
  text: string;
}

export interface Theme {
  id: string;
  title: string;
  verses: ThemeVerse[];
}

export interface Hymn {
  id: string;
  title: string;
  verses: string[];
}

let dictionaryCache: DictionaryEntry[] | null = null;
let themesCache: Theme[] | null = null;
let hymnsCache: Hymn[] | null = null;

export async function getDictionary(): Promise<DictionaryEntry[]> {
  if (dictionaryCache) return dictionaryCache;
  const res = await fetch("/data/study/dictionary.json");
  if (!res.ok) {
    throw new Error(`Falha ao carregar dicionário (HTTP ${res.status})`);
  }
  dictionaryCache = (await res.json()) as DictionaryEntry[];
  return dictionaryCache;
}

export async function getThemes(): Promise<Theme[]> {
  if (themesCache) return themesCache;
  const res = await fetch("/data/study/themes.json");
  if (!res.ok) {
    throw new Error(`Falha ao carregar temas (HTTP ${res.status})`);
  }
  themesCache = (await res.json()) as Theme[];
  return themesCache;
}

export async function getHymns(): Promise<Hymn[]> {
  if (hymnsCache) return hymnsCache;
  const res = await fetch("/data/study/hymns.json");
  if (!res.ok) {
    throw new Error(`Falha ao carregar hinário (HTTP ${res.status})`);
  }
  hymnsCache = (await res.json()) as Hymn[];
  return hymnsCache;
}
