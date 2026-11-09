// « Ouvert aujourd'hui » : calculé à partir des horaires hebdomadaires (plusieurs plages
// par jour possibles) et des fermetures, toujours à l'heure de Paris. Sans horaires fiables,
// on n'en suppose jamais : état « horaires à vérifier ».
//
// Ce calcul tourne aussi dans le navigateur, pour rester juste hors connexion.

import { stayDates, weekdayOf, type Stay } from "./stay";

export type OpeningMode = "schedule" | "always" | "appointment" | "unknown";

export type HoursRange = { weekday: number; opens_at: string; closes_at: string };
export type Closure = { starts_on: string; ends_on: string; reason_fr: string | null; reason_en: string | null };

export type PlaceHours = {
  opening_mode: OpeningMode;
  hours_verified_at: string | null;
  hours: HoursRange[];
  closures: Closure[];
};

export type TodayStatus =
  | { state: "open"; ranges: { opens: string; closes: string }[] } // a au moins une plage aujourd'hui
  | { state: "always" } // accès libre (point de vue, balade)
  | { state: "closed"; closure: Closure | null } // fermé toute la journée (jour de fermeture ou période)
  | { state: "appointment" } // sur rendez-vous
  | { state: "unknown" }; // horaires à vérifier

export const PARIS_TIME_ZONE = "Europe/Paris";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Date (AAAA-MM-JJ) et jour ISO (1 = lundi … 7 = dimanche) à Paris pour un instant donné.
export function parisDay(now: Date): { date: string; weekday: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PARIS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    weekday: WEEKDAYS.indexOf(get("weekday")) + 1,
  };
}

const hhmm = (time: string) => time.slice(0, 5);

export function rangesOn(place: Pick<PlaceHours, "hours">, weekday: number) {
  return place.hours
    .filter((h) => h.weekday === weekday)
    .sort((a, b) => a.opens_at.localeCompare(b.opens_at))
    .map((h) => ({ opens: hhmm(h.opens_at), closes: hhmm(h.closes_at) }));
}

export function closureOn(place: Pick<PlaceHours, "closures">, date: string): Closure | null {
  return place.closures.find((c) => c.starts_on <= date && date <= c.ends_on) ?? null;
}

export function todayStatus(place: PlaceHours, now: Date): TodayStatus {
  const { date, weekday } = parisDay(now);

  // Une fermeture saisie est une info fiable, quel que soit le mode.
  const closure = closureOn(place, date);
  if (closure) return { state: "closed", closure };

  switch (place.opening_mode) {
    case "always":
      return { state: "always" };
    case "appointment":
      return { state: "appointment" };
    case "unknown":
      return { state: "unknown" };
    case "schedule": {
      // Horaires jamais vérifiés ou absents : on ne suppose rien.
      if (!place.hours_verified_at || place.hours.length === 0) return { state: "unknown" };
      const ranges = rangesOn(place, weekday);
      return ranges.length > 0 ? { state: "open", ranges } : { state: "closed", closure: null };
    }
  }
}

// Pour le filtre « Ouvert aujourd'hui ».
export const isOpenToday = (status: TodayStatus) => status.state === "open" || status.state === "always";

export type StayStatus =
  | { state: "open"; days: string[]; allDays: boolean } // jours d'ouverture pendant le séjour
  | { state: "always" }
  | { state: "closed" } // aucun jour d'ouverture : masqué par le filtre « séjour »
  | { state: "appointment" }
  | { state: "unknown" }; // horaires à vérifier : reste visible, jamais présenté comme ouvert

// Mêmes règles que todayStatus, appliquées à chaque jour du séjour.
export function stayStatus(place: PlaceHours, stay: Stay): StayStatus {
  const dates = stayDates(stay);

  // Une fermeture saisie est une info fiable, quel que soit le mode.
  const notClosed = dates.filter((date) => !closureOn(place, date));
  if (notClosed.length === 0) return { state: "closed" };

  switch (place.opening_mode) {
    case "always":
      return { state: "always" };
    case "appointment":
      return { state: "appointment" };
    case "unknown":
      return { state: "unknown" };
    case "schedule": {
      if (!place.hours_verified_at || place.hours.length === 0) return { state: "unknown" };
      const days = notClosed.filter((date) => rangesOn(place, weekdayOf(date)).length > 0);
      if (days.length === 0) return { state: "closed" };
      return { state: "open", days, allDays: days.length === dates.length };
    }
  }
}
