"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { parisDay } from "@/lib/opening-hours";
import { parseStay, type Stay } from "@/lib/stay";

// Séjour gardé sur le téléphone (localStorage), un par livret : rien n'est envoyé (RGPD).
const CHANGE_EVENT = "stay-change";
const storageKey = (slug: string) => `stay:${slug}`;

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function readRaw(slug: string): string | null {
  try {
    return localStorage.getItem(storageKey(slug));
  } catch {
    return null;
  }
}

export function saveStay(slug: string, stay: Stay | null) {
  try {
    if (stay) localStorage.setItem(storageKey(slug), JSON.stringify(stay));
    else localStorage.removeItem(storageKey(slug));
  } catch {
    // Stockage indisponible (navigation privée) : le livret marche, sans retenir les dates.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export const todayInParis = () => parisDay(new Date()).date;

export function useStay(slug: string) {
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(slug),
    () => null,
  );

  // Un séjour terminé n'est plus pris en compte.
  const stay = useMemo(() => {
    if (!raw) return null;
    try {
      const { from, to } = JSON.parse(raw) as Partial<Stay>;
      return parseStay(from, to, todayInParis());
    } catch {
      return null;
    }
  }, [raw]);

  const save = useCallback((next: Stay | null) => saveStay(slug, next), [slug]);
  return { stay, save };
}
