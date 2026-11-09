// Dates de séjour du voyageur (AAAA-MM-JJ). Elles restent sur son téléphone, rien n'est envoyé.

export type Stay = { from: string; to: string };

export const MAX_STAY_DAYS = 60;

const DAY_MS = 86_400_000;
const toUtc = (date: string) => Date.parse(`${date}T00:00:00Z`);

function isRealDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const time = toUtc(value);
  // Écarte les dates impossibles comme le 2026-02-31.
  return !Number.isNaN(time) && new Date(time).toISOString().slice(0, 10) === value;
}

// Séjour valable, sinon null : un lien mal formé ou un séjour déjà terminé est simplement ignoré.
export function parseStay(from: unknown, to: unknown, today: string): Stay | null {
  if (!isRealDate(from) || !isRealDate(to)) return null;
  if (to < from || to < today) return null;
  if (stayLength({ from, to }) > MAX_STAY_DAYS) return null;
  return { from, to };
}

const stayLength = ({ from, to }: Stay) => Math.round((toUtc(to) - toUtc(from)) / DAY_MS) + 1;

// Tous les jours du séjour, arrivée et départ compris.
export function stayDates(stay: Stay): string[] {
  const start = toUtc(stay.from);
  return Array.from({ length: stayLength(stay) }, (_, i) => new Date(start + i * DAY_MS).toISOString().slice(0, 10));
}

// Jour ISO (1 = lundi … 7 = dimanche) d'une date du calendrier, sans effet de fuseau horaire.
export function weekdayOf(date: string): number {
  return new Date(toUtc(date)).getUTCDay() || 7;
}
