"use client";

import { useCallback, useEffect, useState } from "react";
import type { BibleIndex } from "@/lib/bible";
import { getDictionary, getThemes, type DictionaryEntry, type Theme } from "@/lib/study";
import { normalizeTerm } from "@/lib/search-options";

interface StudyViewProps {
  index: BibleIndex;
  onNavigate: (bookId: number, chapter: number) => void;
}

type Tab = "dicionario" | "temas";

export default function StudyView({ index, onNavigate }: StudyViewProps) {
  const [tab, setTab] = useState<Tab>("dicionario");
  const [dictionary, setDictionary] = useState<DictionaryEntry[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [query, setQuery] = useState("");
  const [expandedTheme, setExpandedTheme] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getDictionary(), getThemes()])
      .then(([dict, th]) => {
        setDictionary(dict);
        setThemes(th);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Erro ao carregar conteúdo");
        setLoading(false);
      });
  }, []);

  const filteredDictionary = useCallback(() => {
    if (!query) return dictionary;
    const normalized = normalizeTerm(query);
    if (!normalized) return dictionary;
    return dictionary.filter(
      (entry) =>
        normalizeTerm(entry.word).includes(normalized) ||
        normalizeTerm(entry.definition).includes(normalized),
    );
  }, [dictionary, query]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <p className="font-serif text-lg text-ink-soft" role="status">
          Carregando…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <p className="rounded-xl bg-paper-muted px-4 py-3 text-sm text-ink">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-6 sm:px-8">
      <div className="mb-4 flex gap-2 border-b border-line">
        <TabButton
          label="Dicionário"
          active={tab === "dicionario"}
          onClick={() => setTab("dicionario")}
        />
        <TabButton
          label="O que a Bíblia diz"
          active={tab === "temas"}
          onClick={() => setTab("temas")}
        />
      </div>

      {tab === "dicionario" && (
        <>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar no dicionário…"
            aria-label="Buscar no dicionário"
            className="mb-4 rounded-xl border border-line bg-paper px-4 py-2.5 text-base text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
          <ul className="space-y-3">
            {filteredDictionary().map((entry) => (
              <li
                key={entry.word}
                className="rounded-xl border border-line bg-paper p-4"
              >
                <p className="mb-1 text-base font-semibold text-accent">
                  {entry.word}
                </p>
                <p className="font-serif text-sm leading-relaxed text-ink">
                  {entry.definition}
                </p>
              </li>
            ))}
          </ul>
          {filteredDictionary().length === 0 && (
            <p className="text-center text-sm text-ink-soft">
              Nenhum verbete encontrado para &ldquo;{query}&rdquo;
            </p>
          )}
        </>
      )}

      {tab === "temas" && (
        <ul className="space-y-3">
          {themes.map((theme) => (
            <li key={theme.id} className="rounded-xl border border-line bg-paper">
              <button
                type="button"
                onClick={() =>
                  setExpandedTheme(expandedTheme === theme.id ? null : theme.id)
                }
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-paper-muted focus-visible:outline-2 focus-visible:outline-accent"
              >
                <span className="text-base font-semibold text-ink">
                  {theme.title}
                </span>
                <span className="text-sm text-ink-soft">
                  {expandedTheme === theme.id ? "▾" : "▸"}
                </span>
              </button>
              {expandedTheme === theme.id && (
                <ul className="space-y-2 border-t border-line px-4 py-3">
                  {theme.verses.map((verse, i) => {
                    const book = index.books.find((b) => b.id === verse.book);
                    return (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => onNavigate(verse.book, verse.chapter)}
                          className="w-full rounded-lg p-2 text-left transition-colors hover:bg-paper-muted focus-visible:outline-2 focus-visible:outline-accent"
                        >
                          <p className="mb-1 text-xs font-semibold text-accent">
                            {book?.abbrev} {verse.chapter + 1}:{verse.verse + 1}
                          </p>
                          <p className="font-serif text-sm leading-relaxed text-ink">
                            {verse.text}
                          </p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active}
      className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
        active
          ? "border-accent text-accent"
          : "border-transparent text-ink-soft hover:border-line hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
