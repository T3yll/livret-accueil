import { Image as ImageIcon, Mic } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { parseMedia } from "@/lib/sections";
import { createTemplate } from "./actions";

export const metadata = { title: "Bibliothèque d'équipements" };

export default async function EquipmentLibraryPage() {
  const { supabase } = await requireAdmin();
  const { data: templates, error } = await supabase
    .from("equipment_templates")
    .select("id, title_fr, title_en, media, audio_path_fr, audio_path_en, updated_at")
    .order("title_fr");
  if (error) throw error;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px]">Bibliothèque d&apos;équipements</h1>
        <form action={createTemplate}>
          <Button type="submit">Nouveau modèle</Button>
        </form>
      </div>
      <p className="max-w-2xl text-sm text-muted">
        Des fiches rédigées une fois (machine Nespresso, poêle à bois, plaque à induction…) et ajoutées ensuite à
        plusieurs logements, depuis la fiche du logement (« Ajouter depuis la bibliothèque »). Chaque logement reçoit
        une copie à adapter : modifier un modèle ne change pas les fiches déjà ajoutées. On peut aussi enregistrer dans
        la bibliothèque une fiche équipement déjà rédigée dans un logement.
      </p>

      {templates.length === 0 ? (
        <p className="rounded-2xl bg-surface p-4 text-muted">Aucun modèle pour l&apos;instant.</p>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
          {templates.map((t) => {
            const photos = parseMedia(t.media).length;
            const voices = [t.audio_path_fr && "FR", t.audio_path_en && "EN"].filter(Boolean).join(" + ");
            return (
              <li key={t.id}>
                <Link
                  href={`/admin/equipements/${t.id}`}
                  className="flex min-h-14 flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 hover:bg-stone focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                >
                  <span className="flex-1 font-semibold text-primary">
                    {t.title_fr}
                    {!t.title_en && <span className="ml-2 text-sm font-normal text-favorite">EN à traduire</span>}
                  </span>
                  {voices && (
                    <span className="inline-flex items-center gap-1 text-sm text-muted">
                      <Mic size={16} aria-hidden /> Note vocale {voices}
                    </span>
                  )}
                  {photos > 0 && (
                    <span className="inline-flex items-center gap-1 text-sm text-muted">
                      <ImageIcon size={16} aria-hidden /> {photos} photo{photos > 1 ? "s" : ""}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
