"use client";

import { Share, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

// Événement propre à Chrome / Android, absent des types du DOM.
type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void> };

type Mode = "android" | "ios" | null;

const DISMISSED_KEY = "install-prompt-dismissed";

// Invitation discrète à ajouter le livret à l'écran d'accueil, sur l'accueil du livret.
// Android : bouton qui ouvre la fenêtre d'installation du navigateur.
// iPhone (Safari n'a pas cette fenêtre) : la marche à suivre, en une phrase.
// Masquée si déjà installé ou refusé une fois (choix gardé sur le téléphone, pas de cookie).
export function InstallPrompt() {
  const t = useTranslations("Offline");
  const [mode, setMode] = useState<Mode>(null);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone || isDismissed()) return;

    const onPrompt = (event: Event) => {
      event.preventDefault(); // pas de bandeau automatique du navigateur : le nôtre suffit
      setInstallEvent(event as BeforeInstallPromptEvent);
      setMode("android");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iPhone et iPad (iPadOS se présente comme un Mac avec écran tactile).
    const isIos =
      /iPhone|iPad|iPod/.test(navigator.userAgent) ||
      (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1);
    const timer = isIos ? setTimeout(() => setMode("ios"), 0) : undefined;

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      clearTimeout(timer);
    };
  }, []);

  if (!mode) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // stockage indisponible (navigation privée) : masqué pour cette visite seulement
    }
    setMode(null);
  };

  const install = async () => {
    await installEvent?.prompt();
    setMode(null);
  };

  return (
    <aside
      aria-labelledby="install-title"
      className="relative flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4 pr-12"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("dismiss")}
        className="absolute top-1 right-1 inline-flex size-11 items-center justify-center rounded-full text-muted hover:bg-stone focus-visible:outline-2 focus-visible:outline-primary"
      >
        <X size={20} aria-hidden />
      </button>
      <h2 id="install-title" className="font-sans text-base font-semibold">
        {t("installTitle")}
      </h2>
      <p className="text-sm text-muted">{t("installText")}</p>
      {mode === "android" ? (
        <button
          type="button"
          onClick={install}
          className="mt-1 inline-flex min-h-11 self-start items-center rounded-xl bg-primary px-4 text-[15px] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {t("install")}
        </button>
      ) : (
        <p className="text-sm">
          {t.rich("iosHint", {
            share: (chunks) => (
              <span className="font-semibold whitespace-nowrap">
                <Share size={16} className="mr-1 inline align-[-2px] text-primary" aria-hidden />
                {chunks}
              </span>
            ),
          })}
        </p>
      )}
    </aside>
  );
}

function isDismissed() {
  try {
    return localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}
