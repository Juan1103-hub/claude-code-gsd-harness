"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import type { BibleIndex } from "@/lib/bible";

interface BookPickerProps {
  open: boolean;
  index: BibleIndex | null;
  current: { bookId: number; chapter: number };
  onSelect: (bookId: number, chapter: number) => void;
  onClose: () => void;
}

export default function BookPicker({ open, index, current, onSelect, onClose }: BookPickerProps) {
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [prevOpen, setPrevOpen] = useState(open);

  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) setSelectedBookId(current.bookId);
  }

  const escHandler = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", escHandler);
    return () => document.removeEventListener("keydown", escHandler);
  }, [open, escHandler]);

  if (!open || !index) return null;

  const oldTestament = index.books.slice(0, 39);
  const newTestament = index.books.slice(39);
  const selectedBook = index.books[selectedBookId ?? current.bookId];

  const pickBook = (bookId: number) => {
    setSelectedBookId(bookId);
  };

  const pickChapter = (chapter: number) => {
    const bookId = selectedBookId ?? current.bookId;
    onSelect(bookId, chapter);
    onClose();
  };

  const goBackToBooks = () => setSelectedBookId(null);

  const chapters = selectedBook ? Array.from({ length: selectedBook.chapters }, (_, i) => i) : [];

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Escolher livro e capítulo">
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 cursor-default bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[82dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border-t border-line bg-paper-raised shadow-2xl">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          {selectedBookId !== null && (
            <button
              type="button"
              onClick={goBackToBooks}
              className="flex h-11 min-w-11 items-center justify-center rounded-full px-2 text-ink-soft transition-colors hover:bg-paper-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
              aria-label="Voltar para a lista de livros"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <h2 className="flex-1 truncate text-center text-sm font-medium text-ink-soft">
            {selectedBookId === null ? "Livros" : selectedBook?.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 min-w-11 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-paper-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {selectedBookId === null ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
            <SectionLabel label="Antigo Testamento" />
            {oldTestament.map((book) => (
              <BookRow
                key={book.id}
                name={book.name}
                chapters={book.chapters}
                isCurrent={book.id === current.bookId}
                onSelect={() => pickBook(book.id)}
              />
            ))}
            <SectionLabel label="Novo Testamento" />
            {newTestament.map((book) => (
              <BookRow
                key={book.id}
                name={book.name}
                chapters={book.chapters}
                isCurrent={book.id === current.bookId}
                onSelect={() => pickBook(book.id)}
              />
            ))}
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <p className="mb-3 text-sm text-ink-soft">
              {selectedBook?.name} — escolha o capítulo
            </p>
            <div className="grid grid-cols-5 gap-2">
              {chapters.map((chapter) => (
                <button
                  key={chapter}
                  type="button"
                  onClick={() => pickChapter(chapter)}
                  className={`flex h-12 items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                    chapter === current.chapter && selectedBookId === current.bookId
                      ? "bg-accent text-white"
                      : "bg-paper-muted text-ink hover:bg-line/40"
                  }`}
                >
                  {chapter + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-ink-faint first:pt-2">
      {label}
    </p>
  );
}

function BookRow({
  name,
  chapters,
  isCurrent,
  onSelect,
}: {
  name: string;
  chapters: number;
  isCurrent: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex min-h-12 w-full items-center justify-between rounded-xl px-3 transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
        isCurrent ? "bg-paper-muted text-ink" : "text-ink-soft hover:bg-paper-muted hover:text-ink"
      }`}
    >
      <span className="truncate text-[15px]">{name}</span>
      <span className="shrink-0 pl-3 text-xs tabular-nums text-ink-faint">{chapters}</span>
    </button>
  );
}
