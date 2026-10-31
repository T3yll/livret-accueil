import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";
import { SECTION_LABELS } from "@/components/admin/section-labels";
import { Button } from "@/components/ui/button";
import { hasMissingTranslation, isSectionEmpty } from "@/lib/sections";
import type { Tables } from "@/types/database";
import { addEquipment, moveSection, setSectionActive } from "./sections/actions";

type Section = Tables<"guide_sections">;

function status(section: Section) {
  if (!section.is_active) return { label: "Désactivée", className: "bg-stone text-muted" };
  // Une section vide en français est vide dans les deux langues (le FR sert de repli).
  if (isSectionEmpty(section, "fr")) return { label: "Vide · masquée", className: "bg-stone text-info" };
  if (hasMissingTranslation(section)) return { label: "EN à traduire", className: "bg-favorite-bg text-favorite" };
  return { label: "Remplie", className: "bg-open text-white" };
}

const iconButton =
  "inline-flex size-11 items-center justify-center rounded-lg border border-border bg-surface hover:bg-stone " +
  "focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40";

export function SectionsPanel({ propertyId, sections }: { propertyId: string; sections: Section[] }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl">Sections du livret</h2>
        <form action={addEquipment.bind(null, propertyId)}>
          <Button type="submit" variant="secondary">
            Ajouter une fiche équipement
          </Button>
        </form>
      </div>
      <p className="text-sm text-muted">
        Dans l&apos;ordre du livret. Une section vide n&apos;est jamais montrée au voyageur.
      </p>

      <ol className="divide-y divide-border">
        {sections.map((section, index) => {
          const s = status(section);
          const name =
            section.type === "equipment" && section.title_fr
              ? `${SECTION_LABELS.equipment} : ${section.title_fr}`
              : SECTION_LABELS[section.type];
          return (
            <li key={section.id} className="flex flex-wrap items-center gap-3 py-2">
              <div className="flex gap-1">
                <form action={moveSection.bind(null, propertyId, section.id, -1)}>
                  <button type="submit" className={iconButton} disabled={index === 0} aria-label={`Monter ${name}`}>
                    <ArrowUp size={18} aria-hidden />
                  </button>
                </form>
                <form action={moveSection.bind(null, propertyId, section.id, 1)}>
                  <button
                    type="submit"
                    className={iconButton}
                    disabled={index === sections.length - 1}
                    aria-label={`Descendre ${name}`}
                  >
                    <ArrowDown size={18} aria-hidden />
                  </button>
                </form>
              </div>
              <Link
                href={`/admin/logements/${propertyId}/sections/${section.id}`}
                className="min-w-0 flex-1 font-semibold text-primary underline-offset-2 hover:underline"
              >
                {name}
              </Link>
              <span className={`rounded-full px-2.5 py-1 text-sm font-semibold ${s.className}`}>{s.label}</span>
              <form action={setSectionActive.bind(null, propertyId, section.id, !section.is_active)}>
                <button
                  type="submit"
                  className="min-h-11 rounded-lg px-3 text-sm font-semibold text-primary hover:bg-stone focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {section.is_active ? "Désactiver" : "Activer"}
                </button>
              </form>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
