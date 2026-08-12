"use client";

import { useEffect } from "react";

/**
 * Verifica se o Service Worker está serveindo uma versão obsoleta.
 * Compara a data do HTML carregado com o timestamp do deploy atual.
 * Se o SW estiver stale, força a limpeza e recarrega.
 */
const DEPLOY_KEY = "bs-deploy-ts";

export default function SwVersionGuard({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Marca o timestamp de quando esta versão foi carregada.
    const currentTs = Date.now();
    const storedTs = localStorage.getItem(DEPLOY_KEY);

    // Se já tinha um timestamp e é muito diferente (mais de 24h),
    // pode ser um cache stale — mas só recarrega se o SW estiver ativo.
    if (storedTs && "serviceWorker" in navigator) {
      const diff = Math.abs(currentTs - Number(storedTs));
      const DAY = 86400000;
      if (diff > DAY * 7) {
        // SW antigo demais — limpa e recarrega.
        navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((r) => r.unregister());
        });
        caches.keys().then((keys) => {
          keys.forEach((k) => caches.delete(k));
        });
        localStorage.removeItem(DEPLOY_KEY);
        window.location.reload();
        return;
      }
    }

    localStorage.setItem(DEPLOY_KEY, String(currentTs));

    // Listener para quando o SW novo precisa ativar.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        // Novo SW assumiu — recarrega para garantir chunks novos.
        window.location.reload();
      });
    }
  }, []);

  return <>{children}</>;
}
