"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { downloadTranslation } from "@/lib/bible";

interface Progress {
  done: number;
  total: number;
}

type State =
  | { kind: "downloading" }
  | { kind: "done" }
  | { kind: "error"; message: string };

/**
 * Modal de download de tradução (padrão overlay/bottom-sheet de book-picker).
 * Baixa os 66 livros da tradução para o store chapters (IndexedDB) com
 * barra de progresso; nada é precacheado no Service Worker (D-03: o corpus
 * baixado fica no IDB, que é a fonte offline).
 */
export default function DownloadModal({
  open,
  versionCode,
  onClose,
  onDone,
}: {
  open: boolean;
  versionCode: string | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const [progress, setProgress] = useState<Progress>({ done: 0, total: 66 });
  const [state, setState] = useState<State>({ kind: "downloading" });
  const [storageMB, setStorageMB] = useState<number | null>(null);
  const startedRef = useRef<string | null>(null);

  const runDownload = useCallback(
    (code: string) => {
      setState({ kind: "downloading" });
      setProgress({ done: 0, total: 66 });
      downloadTranslation(code, (done, total) => setProgress({ done, total }))
        .then(() => {
          setState({ kind: "done" });
          onDone();
        })
        .catch((err: unknown) => {
          setState({ kind: "error", message: err instanceof Error ? err.message : String(err) });
        });
    },
    [onDone],
  );

  useEffect(() => {
    if (open && versionCode && startedRef.current !== versionCode) {
      startedRef.current = versionCode;
      runDownload(versionCode);
    }
  }, [open, versionCode, runDownload]);

  useEffect(() => {
    if (!open) return;
    // A6: feature-detect — ocultar quando a API não existir.
    if (typeof navigator === "undefined" || !navigator.storage?.estimate) return;
    navigator.storage.estimate().then((est) => {
      if (est.usage != null) setStorageMB(Math.round(est.usage / (1024 * 1024)));
    });
  }, [open, progress.done]);

  if (!open || !versionCode) return null;

  const percent = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" role="dialog" aria-modal="true" aria-label="Baixar tradução">
      <div className="w-full max-w-md rounded-t-2xl bg-paper p-5 shadow-xl sm:rounded-2xl">
        <h2 className="text-base font-semibold text-ink">Baixar tradução</h2>

        {state.kind === "downloading" && (
          <>
            <p className="mt-2 text-sm text-ink-soft">
              Baixando {versionCode.toUpperCase()}… {progress.done}/{progress.total}
            </p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-paper-muted" role="progressbar" aria-valuenow={progress.done} aria-valuemin={0} aria-valuemax={progress.total}>
              <div className="h-full rounded-full bg-accent transition-[width] duration-200" style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-2 text-xs text-ink-faint">Capítulos armazenados offline no IndexedDB.</p>
          </>
        )}

        {state.kind === "done" && (
          <>
            <p className="mt-2 text-sm text-ink-soft">Concluído — agora disponível offline.</p>
            {storageMB !== null && (
              <p className="mt-1 text-xs text-ink-faint">Espaço em uso ~{storageMB} MB</p>
            )}
          </>
        )}

        {state.kind === "error" && (
          <>
            <p className="mt-2 text-sm text-ink-soft">
              Erro ao baixar: {state.message}
            </p>
            <button
              type="button"
              onClick={() => runDownload(versionCode)}
              className="mt-3 rounded-full bg-accent px-4 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-90"
            >
              Tentar novamente
            </button>
          </>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-muted hover:text-ink"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
