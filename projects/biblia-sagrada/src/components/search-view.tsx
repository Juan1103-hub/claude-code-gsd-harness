"use client";

import { useCallback, useEffect, useState } from "react";
import type { BibleIndex } from "@/lib/bible";
import { search, type SearchResult } from "@/lib/search";
import { normalizeTerm } from "@/lib/search-options";

interface SearchViewProps {
  index: BibleIndex;
  activeVersion: string;
  onNavigate: (bookId: number, chapter: number, version: string) => void;
}

export default function SearchView({
  index,
  activeVersion,
  onNavigate,
}: SearchViewProps) {
  const [term, setTerm] = useState("");
  const [version, setVersion] = useState(activeVersion);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTimeMs, setSearchTimeMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const doSearch = useCallback(async () => {
    const normalized = normalizeTerm(term);
    if (!normalized) {
      setResults([]);
      setSearchTimeMs(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const t0 = performance.now();
      const res = await search(version, normalized);
      setSearchTimeMs(performance.now() - t0);
      setResults(res.slice(0, 100));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao buscar. Baixe a tradução para buscar offline.",
      );
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [term, version]);

  useEffect(() => {
    const timeout = setTimeout(doSearch, 300);
    return () => clearTimeout(timeout);
  }, [doSearch]);

  const highlightText = (text: string, query: string) => {
    const normalizedQuery = normalizeTerm(query);
    if (!normalizedQuery) return text;
    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapeRegExp(normalizedQuery)})`, "gi");
    const normalizedText = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const match = regex.exec(normalizedText);
    if (!match) return text;
    const CONTEXT_LEN = 50;
    const start = Math.max(0, match.index - CONTEXT_LEN);
    const end = Math.min(text.length, match.index + match[0].length + CONTEXT_LEN);
    const prefix = start > 0 ? "…" : "";
    const suffix = end < text.length ? "…" : "";
    const segment = text.slice(start, end);
    const normalizedSegment = normalizedText.slice(start, end);
    const parts = normalizedSegment.split(regex);
    let offset = 0;
    return (
      <span>
        {prefix}
        {parts.map((part, i) => {
          const isMatch = i % 2 === 1;
          const original = segment.slice(offset, offset + part.length);
          offset += part.length;
          return isMatch ? (
            <mark key={i} className="bg-accent/20 text-ink rounded-sm px-0.5">
              {original}
            </mark>
          ) : (
            <span key={i}>{original}</span>
          );
        })}
        {suffix}
      </span>
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-6 sm:px-8">
      <div className="mb-4 flex gap-2">
        <input
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Buscar versículo…"
          aria-label="Buscar versículo"
          className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-4 py-2.5 text-base text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        <select
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          aria-label="Tradução"
          className="rounded-xl border border-line bg-paper px-3 py-2.5 text-base font-medium text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        >
          {index.versions.map((v) => (
            <option key={v.code} value={v.code}>
              {v.shortLabel}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <p className="text-center text-sm text-ink-soft" role="status">
          Buscando…
        </p>
      )}

      {error && (
        <p className="rounded-xl bg-paper-muted px-4 py-3 text-sm text-ink">
          {error}
        </p>
      )}

      {!loading && !error && searchTimeMs !== null && results.length === 0 && (
        <p className="text-center text-sm text-ink-soft">
          Nenhum resultado para &ldquo;{term}&rdquo;
        </p>
      )}

      {!loading && results.length > 0 && (
        <>
          <p className="mb-3 text-xs text-ink-faint">
            {results.length} resultado{results.length !== 1 ? "s" : ""} em{" "}
            {searchTimeMs?.toFixed(0)}ms
          </p>
          <ul className="space-y-3">
            {results.map((r) => {
              const book = index.books.find((b) => b.id === r.book);
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(r.book, r.chapter, version)}
                    className="w-full rounded-xl border border-line bg-paper p-4 text-left transition-colors hover:bg-paper-muted focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    <p className="mb-1 text-xs font-semibold text-accent">
                      {book?.abbrev} {r.chapter + 1}:{r.verse + 1}
                    </p>
                    <p className="font-serif text-sm leading-relaxed text-ink">
                      {highlightText(r.text, term)}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
