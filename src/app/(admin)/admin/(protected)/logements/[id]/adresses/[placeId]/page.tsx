import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORY_LABELS } from "@/components/admin/place-labels";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { removePlace } from "../actions";
import { SelectionForm } from "./selection-form";

export const metadata = { title: "Coup de cœur" };

export default async function SelectionPage({ params }: PageProps<"/admin/logements/[id]/adresses/[placeId]">) {
  const { id, placeId } = await params;
  const { supabase } = await requireAdmin();

  const [{ data: selection }, { data: property }] = await Promise.all([
    supabase
      .from("property_places")
      .select("is_favorite, comment_fr, comment_en, places(name, category, city)")
      .eq("property_id", id)
      .eq("place_id", placeId)
      .maybeSingle(),
    supabase.from("properties").select("name").eq("id", id).maybeSingle(),
  ]);
  if (!selection?.places || !property) notFound();

  return (
    <div className="flex flex-col gap-6">
      <p>
        <Link href={`/admin/logements/${id}/adresses`} className="text-sm font-semibold text-primary underline">
          ← Adresses de {property.name}
        </Link>
      </p>
      <div>
        <h1 className="text-[28px]">{selection.places.name}</h1>
        <p className="text-sm text-muted">
          {[CATEGORY_LABELS[selection.places.category], selection.places.city].filter(Boolean).join(" · ")} ·{" "}
          <Link href={`/admin/adresses/${placeId}`} className="text-primary underline">
            modifier la fiche commune
          </Link>
        </p>
      </div>

      <SelectionForm propertyId={id} placeId={placeId} selection={selection} />

      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <form action={removePlace.bind(null, id, placeId, true)}>
          <Button type="submit" variant="danger">
            Retirer cette adresse du livret
          </Button>
        </form>
      </section>
    </div>
  );
}
