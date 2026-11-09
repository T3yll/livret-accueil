"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { formValues, type FormState } from "@/lib/forms";
import { parseMediaJson, sectionDataSchemas, type SectionType } from "@/lib/sections";
import type { Json } from "@/types/database";

const propertyPath = (propertyId: string) => `/admin/logements/${propertyId}`;

async function sectionsOf(propertyId: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("guide_sections")
    .select("id, position")
    .eq("property_id", propertyId)
    .order("position")
    .order("created_at");
  if (error) throw error;
  return { supabase, sections: data };
}

export async function moveSection(propertyId: string, sectionId: string, direction: -1 | 1) {
  const { supabase, sections } = await sectionsOf(propertyId);
  const from = sections.findIndex((s) => s.id === sectionId);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= sections.length) return;

  [sections[from], sections[to]] = [sections[to], sections[from]];
  // Renumérote tout : les positions restent 0, 1, 2… sans doublon.
  await Promise.all(
    sections.map((s, index) =>
      s.position === index ? null : supabase.from("guide_sections").update({ position: index }).eq("id", s.id),
    ),
  );
  revalidatePath(propertyPath(propertyId));
}

export async function setSectionActive(propertyId: string, sectionId: string, active: boolean) {
  const { supabase } = await requireAdmin();
  await supabase.from("guide_sections").update({ is_active: active }).eq("id", sectionId);
  revalidatePath(propertyPath(propertyId));
}

export async function addEquipment(propertyId: string) {
  const { supabase, sections } = await sectionsOf(propertyId);
  const { data, error } = await supabase
    .from("guide_sections")
    .insert({ property_id: propertyId, type: "equipment", position: sections.length })
    .select("id")
    .single();
  if (error) redirect(`${propertyPath(propertyId)}?error=save`);
  redirect(`${propertyPath(propertyId)}/sections/${data.id}`);
}

// Seules les fiches équipement se suppriment ; les autres sections se désactivent.
export async function deleteEquipment(propertyId: string, sectionId: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("guide_sections").delete().eq("id", sectionId).eq("type", "equipment");
  revalidatePath(propertyPath(propertyId));
  redirect(propertyPath(propertyId));
}

// Champs du formulaire qui vont dans la colonne `data`, par type.
const DATA_FIELDS: Record<SectionType, string[]> = {
  arrival: ["checkin_from", "checkin_until", "key_handover", "access_code", "parking_fr", "parking_en", "video_url"],
  wifi: ["no_wifi", "ssid", "password"],
  house: [],
  equipment: [],
  departure: ["checkout_time"],
  contacts: [],
  practical: [],
  prepare: [],
};

const FIELD_ERRORS: Record<string, string> = {
  checkin_from: "Heure invalide.",
  checkin_until: "Heure invalide.",
  checkout_time: "Heure invalide.",
  video_url: "Adresse invalide : elle doit commencer par https://",
};

const clean = (value: string | undefined) => (value && value.trim() ? value.trim() : null);

export async function saveSection(
  propertyId: string,
  sectionId: string,
  type: SectionType,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const values = formValues(formData);

  // Construit `data` à partir des champs du type, puis le valide.
  const raw: Record<string, string | boolean> = {};
  for (const field of DATA_FIELDS[type]) {
    if (field === "no_wifi") raw.no_wifi = values.no_wifi === "on";
    else if (clean(values[field])) raw[field] = clean(values[field])!;
  }
  const parsed = sectionDataSchemas[type].parse(raw) as Record<string, unknown>;

  // Le schéma ignore les valeurs mal formées : on les signale au lieu de les perdre sans rien dire.
  const fieldErrors: Record<string, string> = {};
  for (const [field, value] of Object.entries(raw)) {
    if (value !== false && parsed[field] === undefined) fieldErrors[field] = FIELD_ERRORS[field] ?? "Valeur invalide.";
  }
  if (Object.keys(fieldErrors).length > 0) return { values, error: null, fieldErrors };

  const media = parseMediaJson(values.media || "[]");

  const data = Object.fromEntries(Object.entries(parsed).filter(([, v]) => v !== undefined && v !== false)) as Json;

  const { error } = await supabase
    .from("guide_sections")
    .update({
      title_fr: type === "equipment" ? clean(values.title_fr) : null,
      title_en: type === "equipment" ? clean(values.title_en) : null,
      body_fr: clean(values.body_fr),
      body_en: clean(values.body_en),
      data,
      media,
    })
    .eq("id", sectionId);
  if (error) return { values, error: "Enregistrement impossible. Réessayez.", fieldErrors: {} };

  revalidatePath(propertyPath(propertyId));
  revalidatePath(`${propertyPath(propertyId)}/sections/${sectionId}`);
  return { values, error: null, fieldErrors: {}, saved: true };
}
