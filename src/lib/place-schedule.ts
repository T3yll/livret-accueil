import { z } from "zod";

// Horaires et fermetures tels qu'édités dans l'admin (champs cachés JSON du formulaire).

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$|^24:00$/, "Heure invalide.");
const date = z.iso.date("Date invalide.");

export const hoursSchema = z
  .array(
    z
      .object({ weekday: z.number().int().min(1).max(7), opens_at: time, closes_at: time })
      .refine((r) => r.closes_at > r.opens_at, "L'heure de fermeture doit suivre l'heure d'ouverture."),
  )
  .superRefine((ranges, ctx) => {
    // Deux plages du même jour ne doivent pas se chevaucher.
    for (let day = 1; day <= 7; day++) {
      const sorted = ranges.filter((r) => r.weekday === day).sort((a, b) => a.opens_at.localeCompare(b.opens_at));
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].opens_at < sorted[i - 1].closes_at) {
          ctx.addIssue({ code: "custom", message: "Deux plages du même jour se chevauchent." });
          return;
        }
      }
    }
  });

export const closuresSchema = z.array(
  z
    .object({
      starts_on: date,
      ends_on: date,
      reason_fr: z.string().trim().nullable(),
      reason_en: z.string().trim().nullable(),
    })
    .refine((c) => c.ends_on >= c.starts_on, "La fin de fermeture doit suivre le début."),
);

const optionalTime = z
  .string()
  .nullable()
  .transform((v) => v || null)
  .pipe(time.nullable());
const optionalString = z
  .string()
  .nullable()
  .transform((v) => v?.trim() || null);

// Dates d'une expérience (soirée, atelier…) : une ligne par date.
export const eventsSchema = z.array(
  z
    .object({
      starts_on: date,
      start_time: optionalTime,
      end_time: optionalTime,
      label_fr: optionalString,
      label_en: optionalString,
      booking_url: optionalString.pipe(
        z.string().regex(/^https?:\/\//, "Le lien doit commencer par https://").nullable(),
      ),
    })
    .refine((e) => !e.start_time || !e.end_time || e.end_time > e.start_time, "L'heure de fin doit suivre l'heure de début."),
);

export type HoursInput = z.infer<typeof hoursSchema>;
export type ClosuresInput = z.infer<typeof closuresSchema>;
export type EventsInput = z.input<typeof eventsSchema>;

// « Répéter chaque semaine jusqu'au… » : les dates suivantes, même jour de la semaine, jusqu'à la date incluse.
// Plafonné à 60 semaines pour qu'une faute de frappe sur l'année ne crée pas des centaines de lignes.
export function weeklyDates(from: string, until: string): string[] {
  const dates: string[] = [];
  const day = new Date(`${from}T12:00:00Z`);
  if (Number.isNaN(day.getTime()) || !/^\d{4}-\d{2}-\d{2}$/.test(until)) return dates;
  for (let i = 0; i < 60; i++) {
    day.setUTCDate(day.getUTCDate() + 7);
    const iso = day.toISOString().slice(0, 10);
    if (iso > until) break;
    dates.push(iso);
  }
  return dates;
}

export function parseJsonField(value: string | undefined): unknown {
  try {
    return JSON.parse(value || "[]");
  } catch {
    return null;
  }
}
