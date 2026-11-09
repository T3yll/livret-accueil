import type { Locale } from "@/i18n/routing";
import { distanceKm } from "@/lib/distance";
import type { Guide } from "@/lib/guide";
import type { Stay } from "@/lib/stay";
import { weekdayOf } from "@/lib/stay";
import type { Enums } from "@/types/database";

export type GuidePlace = Guide["places"][number];
export type PlaceCategory = Enums<"place_category">;

// Peu de filtres à l'écran : les catégories sont regroupées (Santé à part : section Urgences).
export const PLACE_GROUPS = {
  eat: ["restaurant", "producer", "market"],
  visit: ["heritage", "activity"],
  move: ["hiking", "horse_riding", "bike_rental"],
  kids: ["family", "kids_leisure"],
  practical: ["groceries", "shop", "pharmacy", "transport"],
} as const satisfies Record<string, readonly PlaceCategory[]>;

export type PlaceGroup = keyof typeof PLACE_GROUPS;
export const PLACE_GROUP_KEYS = Object.keys(PLACE_GROUPS) as PlaceGroup[];

export const isInGroup = (category: PlaceCategory, group: PlaceGroup) =>
  (PLACE_GROUPS[group] as readonly PlaceCategory[]).includes(category);

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

// Adresses santé et pharmacies pour la section Urgences, les plus proches d'abord.
export function healthPlaces(guide: Guide): PlaceWithDistance[] {
  const { lat, lng } = guide.property;
  const origin = lat !== null && lng !== null ? { lat, lng } : null;
  return guide.places
    .filter((p) => p.category === "health" || p.category === "pharmacy")
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

const shortDate = (date: string, locale: Locale, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(intlLocale(locale), { ...options, timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));

// « 12 → 15 déc. », ou « 28 déc. → 2 janv. » à cheval sur deux mois.
export function formatStayRange({ from, to }: Stay, locale: Locale): string {
  const sameMonth = from.slice(0, 7) === to.slice(0, 7);
  const start = shortDate(from, locale, sameMonth ? { day: "numeric" } : { day: "numeric", month: "short" });
  return `${start} → ${shortDate(to, locale, { day: "numeric", month: "short" })}`;
}

// Jours d'ouverture pendant le séjour : « sam. et mar. ». Un même jour de la semaine n'est cité qu'une fois.
export function formatStayDays(days: string[], locale: Locale): string {
  const seen = new Set<number>();
  const names = days.flatMap((date) => {
    const weekday = weekdayOf(date);
    if (seen.has(weekday)) return [];
    seen.add(weekday);
    return [shortDate(date, locale, { weekday: "short" })];
  });
  return new Intl.ListFormat(intlLocale(locale), { style: "long", type: "conjunction" }).format(names);
}

export type PlaceEvent = GuidePlace["events"][number];
export type StayExperience = { place: PlaceWithDistance; event: PlaceEvent };

// Expériences ayant une date pendant le séjour (arrivée et départ compris), par date puis heure.
// Une date qui tombe pendant une fermeture du lieu est écartée : la fermeture fait foi.
export function experiencesDuring(places: PlaceWithDistance[], { from, to }: Stay): StayExperience[] {
  return places
    .filter((place) => place.is_experience)
    .flatMap((place) =>
      place.events
        .filter((event) => event.starts_on >= from && event.starts_on <= to)
        .filter((event) => !place.closures.some((c) => c.starts_on <= event.starts_on && event.starts_on <= c.ends_on))
        .map((event) => ({ place, event })),
    )
    .sort(
      (a, b) =>
        a.event.starts_on.localeCompare(b.event.starts_on) ||
        (a.event.start_time ?? "").localeCompare(b.event.start_time ?? ""),
    );
}

// Dates à venir d'une expérience (le JSON garde la veille, à cause du fuseau du serveur).
export const upcomingEvents = (place: GuidePlace, today: string) => place.events.filter((e) => e.starts_on >= today);

// « sam. 12 déc. » / « Sat 12 Dec »
export const formatEventDate = (date: string, locale: Locale) =>
  shortDate(date, locale, { weekday: "short", day: "numeric", month: "short" });

// « 20:30 » (en-GB compte aussi sur 24 h) (heure SQL « 20:30:00 »).
export function formatEventTime(time: string, locale: Locale): string {
  const [h, m] = time.split(":").map(Number);
  return new Intl.DateTimeFormat(intlLocale(locale), { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(
    new Date(Date.UTC(2025, 0, 1, h, m)),
  );
}
