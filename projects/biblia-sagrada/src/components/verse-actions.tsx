"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import type { StudyRecord } from "@/lib/bible";
import { deleteStudyRecord, putStudyRecord } from "@/lib/bible";

export const HIGHLIGHT_COLORS: Record<string, string> = {
  amarelo: "#fef08a",
  verde: "#bbf7d0",
  azul: "#bfdbfe",
  rosa: "#fbcfe8",
  laranja: "#fed7aa",
};

interface VerseActionsProps {
  open: boolean;
  verse: { book: number; chapter: number; verse: number } | null;
  version: string;
  label: string;
  initial: StudyRecord | null;
  onClose: () => void;
  onChanged: () => void;
}

export default function VerseActions({
  open,
  verse,
  version,
  label,
  initial,
  onClose,
  onChanged,
}: VerseActionsProps) {
  const [annotation, setAnnotation] = useState(initial?.text ?? "");

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

  const id = verse ? `${version}:${verse.book}:${verse.chapter}:${verse.verse}` : "";
  const ref = verse ? { version, book: verse.book, chapter: verse.chapter, verse: verse.verse } : null;

  const applyColor = useCallback(async (color: string) => {
    if (!verse || !ref) return;
    await putStudyRecord({
      id,
      ref,
      color,
      text: initial?.text ?? null,
      updatedAt: Date.now(),
    });
    onChanged();
  }, [id, ref, initial, onChanged, verse]);

  const saveAnnotation = useCallback(async () => {
    if (!verse || !ref) return;
    await putStudyRecord({
      id,
      ref,
      color: initial?.color ?? null,
      text: annotation.trim() || null,
      updatedAt: Date.now(),
    });
    onChanged();
  }, [id, ref, initial, annotation, onChanged, verse]);

  const remove = useCallback(async () => {
    if (!id) return;
    await deleteStudyRecord(id);
    onChanged();
  }, [id, onChanged]);

  if (!open || !verse) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Ações do versículo">
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 cursor-default bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-md flex-col overflow-hidden rounded-t-3xl border-t border-line bg-paper-raised shadow-2xl">
        <div
          className="flex items-center justify-center border-b border-line px-4 py-2"
          aria-hidden="true"
        >
          <div className="h-1.5 w-12 rounded-full bg-paper-muted" />
        </div>

        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <h2 className="flex-1 truncate text-center text-sm font-medium text-ink-soft">
            {label}
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

        <div className="p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">
            Marcar com cor
          </p>
          <div className="mb-4 flex gap-2">
            {Object.entries(HIGHLIGHT_COLORS).map(([name, hex]) => (
              <button
                key={name}
                type="button"
                onClick={() => applyColor(hex)}
                aria-label={`Cor ${name}`}
                title={name}
                className="h-11 w-11 rounded-full border-2 border-line transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-accent"
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-faint">
            Anotação
          </p>
          <textarea
            value={annotation}
            onChange={(e) => setAnnotation(e.target.value)}
            maxLength={2000}
            aria-label="Anotação"
            placeholder="Escreva uma anotação…"
            className="mb-3 h-24 w-full resize-none rounded-xl border border-line bg-paper px-3 py-2 text-base text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
          <button
            type="button"
            onClick={saveAnnotation}
            className="mb-3 w-full rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-accent"
          >
            Salvar anotação
          </button>

          {initial && (
            <button
              type="button"
              onClick={remove}
              className="w-full rounded-full border border-line px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
            >
              Remover marcador e anotação
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
