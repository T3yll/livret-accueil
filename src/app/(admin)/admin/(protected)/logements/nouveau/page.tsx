import { requireAdmin } from "@/lib/auth";
import { PropertyForm } from "../property-form";

export const metadata = { title: "Nouveau logement" };

export default async function NewPropertyPage({ searchParams }: PageProps<"/admin/logements/nouveau">) {
  const { hote } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data: hosts } = await supabase.from("hosts").select("id, name").order("name");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[28px]">Nouveau logement</h1>
      <PropertyForm hosts={hosts ?? []} defaultHostId={typeof hote === "string" ? hote : undefined} />
    </div>
  );
}
