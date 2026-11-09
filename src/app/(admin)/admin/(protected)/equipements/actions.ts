"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { formValues, type FormState } from "@/lib/forms";
import { parseMediaJson } from "@/lib/sections";

// Bibliothèque d'équipements : des fiches rédigées une fois (Nespresso, poêle…), COPIÉES dans un
// logement puis adaptées. Une copie ne suit pas le modèle : corriger l'une n'abîme pas les autres.
// Les fichiers (photos, notes vocales) sont partagés par chemin : rien n'est jamais supprimé du stockage.

const LIBRARY = "/admin/equipements";
const clean = (value: string | undefined) => (value && value.trim() ? value.trim() : null);

// Champs communs à une fiche équipement et à un modèle.
const COPIED = ["title_fr", "title_en", "body_fr", "body_en", "media", "audio_path_fr", "audio_path_en", "transcript_fr", "transcript_en"] as const;

export async function createTemplate() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("equipment_templates").insert({ title_fr: "Nouvel équipement" }).select("id").single();
  if (error) redirect(`${LIBRARY}?error=save`);
  redirect(`${LIBRARY}/${data.id}`);
}

export async function saveTemplate(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const values = formValues(formData);
  const title = clean(values.title_fr);
  if (!title) return { values, error: null, fieldErrors: { title_fr: "Le nom est obligatoire." } };

  const { error } = await supabase
    .from("equipment_templates")
    .update({
      title_fr: title,
      title_en: clean(values.title_en),
      body_fr: clean(values.body_fr),
      body_en: clean(values.body_en),
      media: parseMediaJson(values.media || "[]"),
      audio_path_fr: clean(values.audio_path_fr),
      audio_path_en: clean(values.audio_path_en),
      transcript_fr: clean(values.transcript_fr),
      transcript_en: clean(values.transcript_en),
    })
    .eq("id", id);
  if (error) return { values, error: "Enregistrement impossible. Réessayez.", fieldErrors: {} };

  revalidatePath(LIBRARY);
  revalidatePath(`${LIBRARY}/${id}`);
  return { values, error: null, fieldErrors: {}, saved: true };
}

export async function deleteTemplate(id: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("equipment_templates").delete().eq("id", id);
  revalidatePath(LIBRARY);
  redirect(LIBRARY);
}

// Une fiche équipement d'un logement devient un modèle (copie).
export async function saveSectionAsTemplate(propertyId: string, sectionId: string) {
  const { supabase } = await requireAdmin();
  const { data: section } = await supabase
    .from("guide_sections")
    .select(COPIED.join(", "))
    .eq("id", sectionId)
    .eq("property_id", propertyId)
    .eq("type", "equipment")
    .maybeSingle();
  if (!section) redirect(`/admin/logements/${propertyId}/sections/${sectionId}`);

  const { title_fr, ...rest } = section as unknown as Record<(typeof COPIED)[number], never>;
  const { data, error } = await supabase
    .from("equipment_templates")
    .insert({ ...rest, title_fr: title_fr ?? "Équipement" })
    .select("id")
    .single();
  if (error) redirect(`/admin/logements/${propertyId}/sections/${sectionId}?error=library`);
  revalidatePath(LIBRARY);
  redirect(`${LIBRARY}/${data.id}?depuis=${propertyId}`);
}

// Ajoute à un logement une fiche équipement copiée d'un modèle, en fin de livret.
export async function addEquipmentFromTemplate(propertyId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const templateId = String(formData.get("template_id") ?? "");
  const [{ data: template }, { data: sections }] = await Promise.all([
    supabase.from("equipment_templates").select(COPIED.join(", ")).eq("id", templateId).maybeSingle(),
    supabase.from("guide_sections").select("id").eq("property_id", propertyId),
  ]);
  if (!template) redirect(`/admin/logements/${propertyId}?error=save`);

  const { data, error } = await supabase
    .from("guide_sections")
    .insert({
      ...(template as unknown as Record<(typeof COPIED)[number], never>),
      property_id: propertyId,
      type: "equipment",
      position: sections?.length ?? 0,
    })
    .select("id")
    .single();
  if (error) redirect(`/admin/logements/${propertyId}?error=save`);
  revalidatePath(`/admin/logements/${propertyId}`);
  redirect(`/admin/logements/${propertyId}/sections/${data.id}`);
}
