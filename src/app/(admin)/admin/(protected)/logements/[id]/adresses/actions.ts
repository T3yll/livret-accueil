"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { formValues, type FormState } from "@/lib/forms";

const paths = (propertyId: string) => [`/admin/logements/${propertyId}`, `/admin/logements/${propertyId}/adresses`];

export async function addPlace(propertyId: string, placeId: string) {
  const { supabase } = await requireAdmin();
  await supabase
    .from("property_places")
    .upsert({ property_id: propertyId, place_id: placeId }, { onConflict: "property_id,place_id", ignoreDuplicates: true });
  paths(propertyId).forEach((p) => revalidatePath(p));
}

export async function removePlace(propertyId: string, placeId: string, backToProperty = false) {
  const { supabase } = await requireAdmin();
  await supabase.from("property_places").delete().eq("property_id", propertyId).eq("place_id", placeId);
  paths(propertyId).forEach((p) => revalidatePath(p));
  if (backToProperty) redirect(`/admin/logements/${propertyId}`);
}

const clean = (value: string | undefined) => (value && value.trim() ? value.trim() : null);

// Coup de cœur et mot de l'hôte pour une adresse de ce logement.
export async function saveSelection(
  propertyId: string,
  placeId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const values = formValues(formData);

  const { error } = await supabase
    .from("property_places")
    .update({
      is_favorite: values.is_favorite === "on",
      comment_fr: clean(values.comment_fr),
      comment_en: clean(values.comment_en),
    })
    .eq("property_id", propertyId)
    .eq("place_id", placeId);
  if (error) return { values, error: "Enregistrement impossible. Réessayez.", fieldErrors: {} };

  paths(propertyId).forEach((p) => revalidatePath(p));
  return { values, error: null, fieldErrors: {}, saved: true };
}
