"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import {
  fieldErrorsFrom,
  optionalCoordinate,
  optionalText,
  requiredText,
  formValues,
  type FormState,
} from "@/lib/forms";
import { generateSlug } from "@/lib/slug";
import { missingForPublication } from "./publication";

const propertySchema = z.object({
  host_id: z.uuid("Choisissez un hébergeur."),
  name: requiredText("Le nom est obligatoire."),
  address: optionalText,
  postal_code: optionalText,
  city: optionalText,
  lat: optionalCoordinate(-90, 90),
  lng: optionalCoordinate(-180, 180),
  welcome_fr: optionalText,
  welcome_en: optionalText,
  contact_phone: optionalText,
  contact_email: optionalText.pipe(z.email("Email invalide.").nullable()),
  cover_photo_path: optionalText,
  cover_photo_alt_fr: optionalText,
  cover_photo_alt_en: optionalText,
  welcome_audio_path_fr: optionalText,
  welcome_audio_path_en: optionalText,
  welcome_transcript_fr: optionalText,
  welcome_transcript_en: optionalText,
});

const DB_ERROR = "Enregistrement impossible. Réessayez.";

function refresh(id?: string) {
  revalidatePath("/admin/logements");
  if (id) revalidatePath(`/admin/logements/${id}`);
}

export async function saveProperty(
  id: string | null,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const values = formValues(formData);

  const parsed = propertySchema.safeParse(values);
  if (!parsed.success) return { values, error: null, fieldErrors: fieldErrorsFrom(parsed.error) };
  const fields = parsed.data;

  if (id) {
    const { error } = await supabase.from("properties").update(fields).eq("id", id);
    if (error?.message.includes("published_requires_essentials")) {
      return {
        values,
        error: "Un livret publié doit garder ses coordonnées GPS et son message d'accueil en français.",
        fieldErrors: {},
      };
    }
    if (error) return { values, error: DB_ERROR, fieldErrors: {} };
    refresh(id);
    return { values, error: null, fieldErrors: {}, saved: true };
  }

  const { data, error } = await supabase
    .from("properties")
    .insert({ ...fields, slug: generateSlug(fields.name) })
    .select("id")
    .single();
  if (error) return { values, error: DB_ERROR, fieldErrors: {} };

  // Le module « bonnes adresses » est actif par défaut sur un nouveau logement.
  await supabase.from("property_modules").insert({ property_id: data.id, module_key: "places" });

  refresh();
  redirect(`/admin/logements/${data.id}`);
}

export async function setPublished(id: string, published: boolean) {
  const { supabase } = await requireAdmin();

  if (published) {
    const [{ data: property }, { data: sections }] = await Promise.all([
      supabase.from("properties").select("lat, lng, welcome_fr, welcome_en, address").eq("id", id).single(),
      supabase.from("guide_sections").select("type, data, is_active").eq("property_id", id),
    ]);
    if (!property || missingForPublication(property, sections ?? []).length > 0) {
      redirect(`/admin/logements/${id}?error=incomplete`);
    }
  }

  const { error } = await supabase
    .from("properties")
    .update({ status: published ? "published" : "draft", published_at: published ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) redirect(`/admin/logements/${id}?error=save`);

  refresh(id);
}

// À utiliser si l'adresse du livret a circulé : l'ancien lien et l'ancien QR code cessent de marcher.
export async function regenerateSlug(id: string) {
  const { supabase } = await requireAdmin();
  const { data: property } = await supabase.from("properties").select("name").eq("id", id).single();
  if (!property) redirect("/admin/logements");

  const { error } = await supabase.from("properties").update({ slug: generateSlug(property.name) }).eq("id", id);
  if (error) redirect(`/admin/logements/${id}?error=save`);
  refresh(id);
}

export async function setModule(id: string, moduleKey: string, active: boolean) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("property_modules")
    .upsert({ property_id: id, module_key: moduleKey, is_active: active });
  if (error) redirect(`/admin/logements/${id}?error=save`);
  refresh(id);
}

export async function deleteProperty(id: string) {
  const { supabase } = await requireAdmin();
  const { data: property } = await supabase.from("properties").select("host_id").eq("id", id).single();
  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) redirect(`/admin/logements/${id}?error=save`);

  refresh();
  redirect(property ? `/admin/hebergeurs/${property.host_id}` : "/admin/logements");
}
