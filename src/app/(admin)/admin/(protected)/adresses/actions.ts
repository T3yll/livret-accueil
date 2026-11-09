"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { fieldErrorsFrom, formValues, optionalText, requiredText, type FormState } from "@/lib/forms";
import { Constants } from "@/types/database";
import { closuresSchema, eventsSchema, hoursSchema, parseJsonField } from "@/lib/place-schedule";
import { parisDay } from "@/lib/opening-hours";

const coordinate = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, "Obligatoire.")
    .transform((v) => Number(v.replace(",", ".")))
    .pipe(z.number().min(min).max(max, `Nombre entre ${min} et ${max} attendu.`));

const optionalUrl = optionalText.pipe(
  z
    .string()
    .regex(/^https?:\/\//, "L'adresse doit commencer par https://")
    .nullable(),
);

// Case à cocher : le navigateur n'envoie le champ que si elle est cochée.
const checkbox = z
  .string()
  .optional()
  .transform((value) => value === "on");

// Nombre facultatif (virgule acceptée) : vide = null.
const optionalNumber = (max: number, integer = false) =>
  optionalText.pipe(
    z
      .string()
      .transform((v) => Number(v.replace(",", ".")))
      .pipe(
        (integer ? z.number().int("Nombre entier attendu.") : z.number())
          .positive("Nombre positif attendu.")
          .max(max, `${max} au maximum.`),
      )
      .nullable(),
  );

const placeSchema = z.object({
  name: requiredText("Le nom est obligatoire."),
  category: z.enum(Constants.public.Enums.place_category, {
    message: "Choisissez une catégorie.",
  }),
  description_fr: optionalText,
  description_en: optionalText,
  address: optionalText,
  postal_code: optionalText,
  city: optionalText,
  lat: coordinate(-90, 90),
  lng: coordinate(-180, 180),
  phone: optionalText,
  website: optionalUrl,
  booking_url: optionalUrl,
  photo_path: optionalText,
  photo_alt_fr: optionalText,
  photo_alt_en: optionalText,
  delivers: checkbox,
  has_drive: checkbox,
  booking_required: checkbox,
  is_experience: checkbox,
  // Randonnée : champs envoyés seulement pour la catégorie « randonnée » (sinon null).
  hike_duration_min: optionalNumber(1440, true),
  hike_distance_km: optionalNumber(999),
  hike_difficulty: optionalText.pipe(z.enum(Constants.public.Enums.hike_difficulty).nullable()),
  trail_url: optionalUrl,
  practical_note_fr: optionalText,
  practical_note_en: optionalText,
  photo_credit: optionalText,
  opening_mode: z.enum(["schedule", "always", "appointment", "unknown"]),
  hours_verified_at: optionalText.pipe(z.iso.date("Date invalide.").nullable()),
});

const DB_ERROR = "Enregistrement impossible. Réessayez.";

export async function savePlace(id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const values = formValues(formData);

  const parsed = placeSchema.safeParse(values);
  const hours = hoursSchema.safeParse(parseJsonField(values.hours));
  const closures = closuresSchema.safeParse(parseJsonField(values.closures));
  const events = eventsSchema.safeParse(parseJsonField(values.events));

  const fieldErrors = parsed.success ? {} : fieldErrorsFrom(parsed.error);
  if (!hours.success) fieldErrors.hours = hours.error.issues[0]?.message ?? "Horaires invalides.";
  if (!closures.success) fieldErrors.closures = closures.error.issues[0]?.message ?? "Fermetures invalides.";
  if (!events.success) fieldErrors.events = events.error.issues[0]?.message ?? "Dates invalides.";
  if (!parsed.success || !hours.success || !closures.success || !events.success) return { values, error: null, fieldErrors };

  const place = parsed.data;
  let placeId = id;
  if (id) {
    const { error } = await supabase.from("places").update(place).eq("id", id);
    if (error) return { values, error: DB_ERROR, fieldErrors: {} };
  } else {
    const { data, error } = await supabase.from("places").insert(place).select("id").single();
    if (error) return { values, error: DB_ERROR, fieldErrors: {} };
    placeId = data.id;
  }

  // Horaires et fermetures : on remplace la liste entière (données déjà validées ci-dessus,
  // avec les mêmes règles que les contraintes de la base).
  const hoursRows = place.opening_mode === "schedule" ? hours.data : [];
  const results = await Promise.all([
    supabase.from("place_opening_hours").delete().eq("place_id", placeId!),
    supabase.from("place_closures").delete().eq("place_id", placeId!),
    supabase.from("place_events").delete().eq("place_id", placeId!),
  ]);
  if (results.some((r) => r.error)) return { values, error: DB_ERROR, fieldErrors: {} };

  const inserts = await Promise.all([
    hoursRows.length > 0
      ? supabase.from("place_opening_hours").insert(hoursRows.map((h) => ({ ...h, place_id: placeId! })))
      : null,
    closures.data.length > 0
      ? supabase.from("place_closures").insert(closures.data.map((c) => ({ ...c, place_id: placeId! })))
      : null,
    events.data.length > 0
      ? supabase.from("place_events").insert(events.data.map((ev) => ({ ...ev, place_id: placeId! })))
      : null,
  ]);
  if (inserts.some((r) => r?.error)) {
    return { values, error: "Fiche enregistrée, mais pas les horaires ou les dates. Réessayez.", fieldErrors: {} };
  }

  revalidatePath("/admin/adresses");
  if (!id) redirect(`/admin/adresses/${placeId}`);
  revalidatePath(`/admin/adresses/${id}`);
  return { values, error: null, fieldErrors: {}, saved: true };
}

// « Horaires vérifiés aujourd'hui » en un clic (date de Paris).
export async function markVerified(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("places").update({ hours_verified_at: parisDay(new Date()).date }).eq("id", id);
  revalidatePath("/admin/adresses");
  revalidatePath(`/admin/adresses/${id}`);
  revalidatePath("/admin");
}

// On archive au lieu de supprimer : la fiche disparaît des livrets mais reste en base.
export async function setArchived(id: string, archived: boolean) {
  const { supabase } = await requireAdmin();
  await supabase
    .from("places")
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq("id", id);
  revalidatePath("/admin/adresses");
  revalidatePath(`/admin/adresses/${id}`);
}
