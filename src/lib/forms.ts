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
  // Saisie renvoyée au formulaire : React 19 le réinitialise après chaque action,
  // sans ça une erreur de validation effacerait tout ce qui a été tapé.
  values?: Record<string, string>;
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

export function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData) {
    if (typeof value === "string" && !key.startsWith("$")) values[key] = value;
  }
  return values;
}

// Valeur initiale d'un champ : la dernière saisie si le formulaire a été renvoyé, sinon la valeur en base.
export function initialValue(state: FormState, name: string, stored: string | number | null | undefined) {
  return state.values?.[name] ?? (stored === null || stored === undefined ? "" : String(stored));
}
