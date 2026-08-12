"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";

/**
 * Banner de instalação do PWA (D-19).
 *
 * Android/Chrome/Edge: o navegador dispara `beforeinstallprompt` quando o app
 * satisfaz os critérios (HTTPS + manifest + SW + engajamento) — guardamos o
 * evento e chamamos `prompt()` no clique do botão "Instalar".
 *
 * iOS/Safari: não existe `beforeinstallprompt` — mostramos as instruções de
 * "Adicionar à Tela de Início" (compartilhar → adicionar).
 *
 * O banner não aparece quando o app já roda como standalone (instalado).
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

const DISMISS_KEY = "bs-install-dismissed";

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (isStandalone()) return; // já instalado — nunca mostrar
    if (localStorage.getItem(DISMISS_KEY)) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault(); // Chrome não mostra o mini-infobar automático
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    const onInstalled = () => setVisible(false);

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    // iOS: sem evento — mostramos o guia depois de um pequeno atraso (evita flash).
    if (isIOS()) {
      const t = window.setTimeout(() => {
        setIos(true);
        setVisible(true);
      }, 1500);
      return () => {
        window.clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", onBeforeInstall);
        window.removeEventListener("appinstalled", onInstalled);
      };
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* localStorage indisponível — sem persistência */
    }
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") setVisible(false);
    setDeferred(null);
  };

  return (
    <div className="fixed inset-x-0 bottom-[4.75rem] z-50 mx-auto w-full max-w-md px-4" role="region" aria-label="Instalar aplicativo">
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-paper-raised p-3 shadow-xl">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent" aria-hidden="true">
          <Smartphone size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">Instale o app da Bíblia</p>
          <p className="truncate text-xs text-ink-soft">
            {ios ? "Use o botão Compartilhar e escolha “Adicionar à Tela de Início”" : "Leia offline direto da tela inicial"}
          </p>
        </div>
        {!ios && deferred ? (
          <button
            type="button"
            onClick={install}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-accent px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-accent"
          >
            <Download size={16} />
            Instalar
          </button>
        ) : (
          ios && (
            <button
              type="button"
              onClick={dismiss}
              className="flex h-11 shrink-0 items-center rounded-full bg-accent px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-accent"
            >
              Entendi
            </button>
          )
        )}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Fechar aviso de instalação"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-paper-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
