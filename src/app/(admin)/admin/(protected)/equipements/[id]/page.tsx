import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { deleteTemplate } from "../actions";
import { TemplateForm } from "./template-form";

export const metadata = { title: "Modèle d'équipement" };

export default async function TemplatePage({ params, searchParams }: PageProps<"/admin/equipements/[id]">) {
  const { id } = await params;
  const { depuis } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data: template } = await supabase.from("equipment_templates").select("*").eq("id", id).maybeSingle();
  if (!template) notFound();

  // Arrivé ici depuis « Enregistrer dans la bibliothèque » : lien de retour vers le logement.
  const { data: from } =
    typeof depuis === "string"
      ? await supabase.from("properties").select("id, name").eq("id", depuis).maybeSingle()
      : { data: null };

  return (
    <div className="flex flex-col gap-6">
      <p className="flex flex-wrap gap-4">
        <Link href="/admin/equipements" className="text-sm font-semibold text-primary underline">
          ← Bibliothèque d&apos;équipements
        </Link>
        {from && (
          <Link href={`/admin/logements/${from.id}`} className="text-sm font-semibold text-primary underline">
            ← {from.name}
          </Link>
        )}
      </p>
      <h1 className="text-[28px]">{template.title_fr}</h1>
      {from && (
        <p role="status" className="rounded-xl bg-stone px-4 py-3 text-sm">
          Fiche enregistrée dans la bibliothèque. Retirez ce qui est propre à {from.name} (emplacement, code…) pour
          qu&apos;elle serve ailleurs.
        </p>
      )}
      <p className="max-w-2xl text-sm text-muted">
        Les logements qui ont déjà ce modèle gardent leur copie : vos modifications ne s&apos;appliquent qu&apos;aux
        prochains ajouts.
      </p>

      <TemplateForm template={template} />

      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="text-2xl">Supprimer</h2>
        <p className="text-sm text-muted">Les fiches déjà ajoutées aux logements ne sont pas touchées.</p>
        <form action={deleteTemplate.bind(null, template.id)}>
          <Button type="submit" variant="danger">
            Supprimer ce modèle
          </Button>
        </form>
      </section>
    </div>
  );
}
