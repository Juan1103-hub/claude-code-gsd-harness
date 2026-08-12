"use client";

import { useEffect } from "react";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Bíblia Sagrada] Erro global:", error);
  }, [error]);

  const hardReload = () => {
    // Força reload bypassando cache do SW.
    window.location.href = window.location.href.split("#")[0];
  };

  const clearCacheAndReload = async () => {
    try {
      // 1. Desregistrar todos os Service Workers.
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          await reg.unregister();
        }
      }
      // 2. Limpar todos os caches do Cache API.
      if ("caches" in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      }
      // 3. Limpar localStorage exceto tema e posição.
      const keep = ["bs-theme", "bs-last-pos", "bs-version"];
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && !keep.includes(k)) localStorage.removeItem(k);
      }
    } catch {
      // Ignora erros de limpeza — segue com reload.
    }
    // 4. Hard reload.
    window.location.href = "/";
  };

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
      {error?.message && (
        <p className="max-w-md break-all rounded-lg bg-paper-muted px-3 py-2 font-mono text-xs text-ink-faint">
          {error.message}
        </p>
      )}
      <button
        type="button"
        onClick={hardReload}
        className="mt-2 flex h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-accent"
      >
        Tentar novamente
      </button>
      <button
        type="button"
        onClick={clearCacheAndReload}
        className="flex h-12 items-center justify-center rounded-full border border-line px-6 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
      >
        Limpar cache e recarregar
      </button>
    </div>
  );
}
