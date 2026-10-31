import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// Vérifie que la requête vient d'un admin connecté, sinon renvoie vers la connexion.
// À appeler dans le layout de l'admin ET dans chaque Server Action (une action
// est appelable directement, sans passer par le layout).
export const requireAdmin = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/admin/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/admin/login?error=not-admin");

  return { supabase, email: (data.claims.email as string | undefined) ?? null };
});
