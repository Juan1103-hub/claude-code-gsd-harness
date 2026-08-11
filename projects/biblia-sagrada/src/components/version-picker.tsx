"use client";

import { useCallback, useEffect } from "react";
import type { BibleVersionMeta } from "@/lib/bible";

interface VersionPickerProps {
  open: boolean;
  versions: BibleVersionMeta[];
  current: string;
  downloaded?: string[];
  onSelect: (code: string) => void;
  onManageDownload?: (code: string) => void;
  onClose: () => void;
}

export default function VersionPicker({
  open,
  versions,
  current,
  downloaded = [],
  onSelect,
  onManageDownload = () => {},
  onClose,
}: VersionPickerProps) {
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

  if (!open) return null;

  const pick = (code: string) => {
    onSelect(code);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Escolher tradução">
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 cursor-default bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[82dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border-t border-line bg-paper-raised shadow-2xl">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <h2 className="flex-1 truncate text-center text-sm font-medium text-ink-soft">Tradução</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 min-w-11 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-paper-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
          {versions.map((version) => {
            const isCurrent = version.code === current;
            const isDownloaded = downloaded.includes(version.code);
            const isBlivre = version.code === "blivre";
            return (
              <button
                key={version.code}
                type="button"
                onClick={() => pick(version.code)}
                aria-current={isCurrent}
                className={`flex min-h-12 w-full items-center justify-between gap-2 rounded-xl px-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                  isCurrent ? "bg-accent text-white" : "text-ink-soft hover:bg-paper-muted hover:text-ink"
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-[15px]">{version.label}</span>
                  <span
                    className={`block text-xs ${
                      isCurrent ? "text-white/70" : "text-ink-faint"
                    }`}
                  >
                    {version.shortLabel}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {isCurrent && <span className="text-xs font-semibold">Em uso</span>}
                  {!isCurrent && isDownloaded && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        isCurrent ? "bg-white/20 text-white" : "bg-paper-muted text-ink-soft"
                      }`}
                    >
                      Baixada
                    </span>
                  )}
                  {!isCurrent && isBlivre && !isDownloaded && (
                    <span
                      role="button"
                      tabIndex={-1}
                      onClick={(e) => {
                        e.stopPropagation();
                        onManageDownload("blivre");
                      }}
                      className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90"
                    >
                      Baixar
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
