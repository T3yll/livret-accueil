"use client";

import { CloudOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useSyncExternalStore } from "react";

// Le service worker n'est actif qu'en production : en développement, son cache masquerait
// les modifications. Pour le tester en local : npm run build && npm start.
const SW_ENABLED = process.env.NODE_ENV === "production";

function subscribeOnline(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function OfflineSupport({ urls, audioUrls }: { urls: string[]; audioUrls: string[] }) {
  const t = useTranslations("Offline");
  const online = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );

  // Clé stable : on ne relance l'enregistrement que si la liste des pages change.
  const urlsKey = urls.join("\n");
  const audioKey = audioUrls.join("\n");

  useEffect(() => {
    if (!SW_ENABLED || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => navigator.serviceWorker.ready)
      .then((registration) => {
        if (!urlsKey) return;
        const audioUrls = audioKey ? audioKey.split("\n") : [];
        registration.active?.postMessage({ type: "precache", urls: urlsKey.split("\n"), audioUrls });
      })
      .catch(() => {
        // Sans service worker, le livret marche normalement, simplement pas hors connexion.
      });
  }, [urlsKey, audioKey]);

  if (online) return null;
  return (
    <p
      role="status"
      className="fixed inset-x-0 bottom-0 z-[1000] flex items-center justify-center gap-2 bg-text px-4 py-3 text-sm text-white"
    >
      <CloudOff size={18} aria-hidden />
      {t("notice")}
    </p>
  );
}
