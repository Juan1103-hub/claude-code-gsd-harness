"use client";

import { useEffect } from "react";

const DEPLOY_KEY = "bs-deploy-ts";
const SW_VERSION_KEY = "bs-sw-version";

export default function SwVersionGuard({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const currentTs = Date.now();

    // Verifica se há SW registrado.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        if (regs.length === 0) return;

        // Se o controller não está ativo, o SW ainda não assumiu — espera.
        if (!navigator.serviceWorker.controller) {
          // SW registrado mas não ativo: pode estar instalando.
          // Força ativação via skipWaiting (o SW já tem skipWaiting: true).
          for (const reg of regs) {
            if (reg.waiting) {
              reg.waiting.postMessage({ type: "SKIP_WAITING" });
            }
          }
        }
      });

      // Quando o SW assume, recarrega para garantir chunks novos.
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        // Evita loop de reload: só recarrega se não recarregou há menos de 2s.
        const lastReload = sessionStorage.getItem("bs-sw-reload");
        if (!lastReload || Date.now() - Number(lastReload) > 2000) {
          sessionStorage.setItem("bs-sw-reload", String(Date.now()));
          window.location.reload();
        }
      });
    }

    // Limpa cache do SW se estiver muito antigo (> 14 dias).
    const storedTs = localStorage.getItem(DEPLOY_KEY);
    if (storedTs) {
      const diff = currentTs - Number(storedTs);
      const TWO_WEEKS = 14 * 86400000;
      if (diff > TWO_WEEKS) {
        localStorage.removeItem(DEPLOY_KEY);
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.getRegistrations().then((regs) => {
            regs.forEach((r) => r.unregister());
          });
        }
        if ("caches" in window) {
          caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
        }
        window.location.reload();
        return;
      }
    }

    localStorage.setItem(DEPLOY_KEY, String(currentTs));
  }, []);

  return <>{children}</>;
}
