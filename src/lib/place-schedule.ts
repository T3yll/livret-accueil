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

export type HoursInput = z.infer<typeof hoursSchema>;
export type ClosuresInput = z.infer<typeof closuresSchema>;

export function parseJsonField(value: string | undefined): unknown {
  try {
    return JSON.parse(value || "[]");
  } catch {
    return null;
  }
}
