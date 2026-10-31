"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { fieldErrorsFrom, optionalText, requiredText, type FormState } from "@/lib/forms";

const hostSchema = z.object({
  name: requiredText("Le nom est obligatoire."),
  contact_name: optionalText,
  phone: optionalText,
  email: optionalText.pipe(z.email("Email invalide.").nullable()),
  notes: optionalText,
});

export async function saveHost(id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const parsed = hostSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: null, fieldErrors: fieldErrorsFrom(parsed.error) };

  const query = id
    ? supabase.from("hosts").update(parsed.data).eq("id", id).select("id").single()
    : supabase.from("hosts").insert(parsed.data).select("id").single();
  const { data, error } = await query;
  if (error) return { error: "Enregistrement impossible. Réessayez.", fieldErrors: {} };

  revalidatePath("/admin/hebergeurs");
  redirect(`/admin/hebergeurs/${data.id}`);
}

export async function deleteHost(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("hosts").delete().eq("id", id);
  // La base refuse (clé étrangère) tant que l'hébergeur a des logements.
  if (error) redirect(`/admin/hebergeurs/${id}?error=has-properties`);

  revalidatePath("/admin/hebergeurs");
  redirect("/admin/hebergeurs");
}
