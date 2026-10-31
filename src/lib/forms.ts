import { z } from "zod";

// Champ texte facultatif : une saisie vide devient null en base.
export const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .default(null);

export const requiredText = (message: string) => z.string().trim().min(1, message);

// Coordonnée GPS facultative, saisie avec un point ou une virgule.
export const optionalCoordinate = (min: number, max: number) =>
  z
    .string()
    .trim()
    .transform((value, ctx) => {
      if (value === "") return null;
      const n = Number(value.replace(",", "."));
      if (Number.isNaN(n) || n < min || n > max) {
        ctx.addIssue({ code: "custom", message: `Nombre entre ${min} et ${max} attendu.` });
        return z.NEVER;
      }
      return n;
    });

export type FormState = {
  error: string | null;
  fieldErrors: Record<string, string>;
  saved?: boolean;
};

export const initialFormState: FormState = { error: null, fieldErrors: {} };

export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !result[key]) result[key] = issue.message;
  }
  return result;
}
