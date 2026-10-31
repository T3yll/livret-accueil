import Link from "next/link";
import { notFound } from "next/navigation";
import { SECTION_LABELS } from "@/components/admin/section-labels";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { deleteEquipment } from "../actions";
import { SectionForm } from "./section-form";

export const metadata = { title: "Section du livret" };

export default async function SectionPage({ params }: PageProps<"/admin/logements/[id]/sections/[sectionId]">) {
  const { id, sectionId } = await params;
  const { supabase } = await requireAdmin();

  const [{ data: section }, { data: property }] = await Promise.all([
    supabase.from("guide_sections").select("*").eq("id", sectionId).eq("property_id", id).maybeSingle(),
    supabase.from("properties").select("name, slug").eq("id", id).maybeSingle(),
  ]);
  if (!section || !property) notFound();

  return (
    <div className="flex flex-col gap-6">
      <p>
        <Link href={`/admin/logements/${id}`} className="text-sm font-semibold text-primary underline">
          ← {property.name}
        </Link>
      </p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px]">{SECTION_LABELS[section.type]}</h1>
        <Link
          href={`/fr/g/${property.slug}/${section.type}`}
          target="_blank"
          className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-[15px] font-semibold hover:bg-stone"
        >
          Prévisualiser
        </Link>
      </div>

      <SectionForm propertyId={id} section={section} />

      {section.type === "equipment" && (
        <section className="flex flex-col gap-3 border-t border-border pt-6">
          <h2 className="text-2xl">Supprimer</h2>
          <form action={deleteEquipment.bind(null, id, section.id)}>
            <Button type="submit" variant="danger">
              Supprimer cette fiche
            </Button>
          </form>
        </section>
      )}
    </div>
  );
}
