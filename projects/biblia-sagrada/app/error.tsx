"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Bíblia Sagrada] Erro global:", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-paper px-6 text-center">
      <div className="text-5xl">✝️</div>
      <h1 className="text-2xl font-semibold text-ink">
        Algo deu errado
      </h1>
      <p className="max-w-md text-sm text-ink-soft">
        Ocorreu um erro inesperado. Tente recarregar a página ou limpar o cache
        do navegador.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-2 flex h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-accent"
      >
        Tentar novamente
      </button>
      <button
        type="button"
        onClick={() => {
          if ("serviceWorker" in navigator) {
            navigator.serviceWorker.getRegistrations().then((regs) => {
              regs.forEach((r) => r.unregister());
            });
          }
          caches.keys().then((keys) => {
            keys.forEach((k) => caches.delete(k));
          });
          window.location.reload();
        }}
        className="flex h-12 items-center justify-center rounded-full border border-line px-6 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
      >
        Limpar cache e recarregar
      </button>
    </div>
  );
}
