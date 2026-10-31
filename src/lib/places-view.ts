import type { Locale } from "@/i18n/routing";
import { distanceKm } from "@/lib/distance";
import type { Guide } from "@/lib/guide";
import type { Enums } from "@/types/database";

export type GuidePlace = Guide["places"][number];
export type PlaceCategory = Enums<"place_category">;

// Ordre d'affichage des catégories dans les filtres (Santé à part : section Urgences).
export const GUIDE_CATEGORIES: PlaceCategory[] = ["restaurant", "producer", "market", "shop", "activity", "heritage", "family"];

export type PlaceWithDistance = GuidePlace & { km: number | null };

// Adresses du module « bonnes adresses » : coups de cœur d'abord, puis les plus proches.
export function guidePlaces(guide: Guide): PlaceWithDistance[] {
  if (!guide.modules.includes("places")) return [];
  const { lat, lng } = guide.property;
  const origin = lat !== null && lng !== null ? { lat, lng } : null;
  return guide.places
    .filter((p) => p.category !== "health")
    .map((p) => ({ ...p, km: origin ? distanceKm(origin, p) : null }))
    .sort((a, b) => Number(b.is_favorite) - Number(a.is_favorite) || (a.km ?? 0) - (b.km ?? 0));
}

// Adresses santé (hôpital, pharmacie…) pour la section Urgences, les plus proches d'abord.
export function healthPlaces(guide: Guide): PlaceWithDistance[] {
  const { lat, lng } = guide.property;
  const origin = lat !== null && lng !== null ? { lat, lng } : null;
  return guide.places
    .filter((p) => p.category === "health")
    .map((p) => ({ ...p, km: origin ? distanceKm(origin, p) : null }))
    .sort((a, b) => (a.km ?? 0) - (b.km ?? 0));
}

// Formats de date et de jour : anglais britannique (clientèle surtout britannique).
export const intlLocale = (locale: Locale) => (locale === "fr" ? "fr-FR" : "en-GB");

// Nom du jour ISO (1 = lundi) dans la langue : « jeudi », « Thursday ».
export function weekdayName(weekday: number, locale: Locale): string {
  // Le 6 janvier 2025 est un lundi.
  return new Intl.DateTimeFormat(intlLocale(locale), { weekday: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(2025, 0, 5 + weekday)),
  );
}

export function formatDate(date: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );
}
