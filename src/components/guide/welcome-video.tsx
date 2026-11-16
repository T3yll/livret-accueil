"use client";

import { CloudOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

// Vidéo d'accueil, au format vertical du téléphone. Rien n'est téléchargé avant la lecture
// (preload="metadata" et « #t=0.1 » pour afficher la première image). Elle n'est pas gardée
// hors connexion (trop lourde) : sans réseau, on montre le texte de la vidéo à la place.
export function WelcomeVideo({ src, lang, label, transcript }: { src: string; lang: string; label: string; transcript: string | null }) {
  const t = useTranslations("Welcome");
  const online = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );

  if (!online) {
    return (
      <div className="flex w-full flex-col gap-2 rounded-2xl bg-stone p-4 text-left">
        <p className="flex items-center gap-2 text-sm font-semibold text-muted">
          <CloudOff size={16} aria-hidden />
          {t("videoOffline")}
        </p>
        {transcript && (
          <p lang={lang} className="whitespace-pre-line">
            {transcript}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <video
        controls
        playsInline
        preload="metadata"
        src={`${src}#t=0.1`}
        lang={lang}
        aria-label={label}
        className="mx-auto max-h-[42dvh] w-auto max-w-full rounded-2xl bg-text"
      />
      {transcript && (
        <details className="text-left text-sm">
          <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-primary">{t("transcript")}</summary>
          <p lang={lang} className="pb-2 whitespace-pre-line">
            {transcript}
          </p>
        </details>
      )}
    </div>
  );
}
