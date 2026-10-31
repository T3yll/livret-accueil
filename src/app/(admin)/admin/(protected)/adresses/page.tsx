import Link from "next/link";
import { CATEGORY_LABELS } from "@/components/admin/place-labels";
import { ButtonLink } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import type { Enums } from "@/types/database";

export const metadata = { title: "Adresses" };

const isCategory = (value: unknown): value is Enums<"place_category"> =>
  typeof value === "string" && value in CATEGORY_LABELS;

const control =
  "min-h-11 rounded-xl border border-border bg-surface px-3 text-base focus-visible:outline-2 focus-visible:outline-primary";

export default async function PlacesPage({ searchParams }: PageProps<"/admin/adresses">) {
  const { q, categorie, filtre } = await searchParams;
  const { supabase } = await requireAdmin();

  const search = typeof q === "string" ? q.trim() : "";
  const category = isCategory(categorie) ? categorie : null;
  const view = filtre === "archivees" || filtre === "a-verifier" ? filtre : "actives";

  let query = supabase
    .from("places")
    .select("id, name, category, city, hours_verified_at, archived_at, opening_mode")
    .order("name");
  if (view === "archivees") query = query.not("archived_at", "is", null);
  else query = query.is("archived_at", null);
  if (view === "a-verifier") {
    // Même règle que la vue places_needing_review : jamais vérifiées ou vérifiées il y a plus de 3 mois.
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 3);
    query = query
      .in("opening_mode", ["schedule", "unknown"])
      .or(`hours_verified_at.is.null,hours_verified_at.lt.${cutoff.toISOString().slice(0, 10)}`);
  }
  if (category) query = query.eq("category", category);
  if (search) query = query.ilike("name", `%${search.replace(/[%_]/g, "")}%`);

  const { data: places, error } = await query;
  if (error) throw error;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px]">Adresses du territoire</h1>
        <ButtonLink href="/admin/adresses/nouvelle">Nouvelle adresse</ButtonLink>
      </div>
      <p className="text-sm text-muted">
        Une seule base pour tous les logements : une adresse mise à jour ici l&apos;est dans tous les livrets.
      </p>

      <form className="flex flex-wrap items-end gap-3" role="search">
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Nom
          <input name="q" defaultValue={search} className={control} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Catégorie
          <select name="categorie" defaultValue={category ?? ""} className={control}>
            <option value="">Toutes</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Afficher
          <select name="filtre" defaultValue={view} className={control}>
            <option value="actives">Actives</option>
            <option value="a-verifier">À revérifier (plus de 3 mois)</option>
            <option value="archivees">Archivées</option>
          </select>
        </label>
        <button
          type="submit"
          className="min-h-11 rounded-xl border border-border bg-surface px-4 font-semibold hover:bg-stone focus-visible:outline-2 focus-visible:outline-primary"
        >
          Filtrer
        </button>
      </form>

      {places.length === 0 ? (
        <p className="text-muted">Aucune adresse.</p>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
          {places.map((place) => (
            <li key={place.id}>
              <Link
                href={`/admin/adresses/${place.id}`}
                className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 hover:bg-stone focus-visible:outline-2 focus-visible:outline-primary"
              >
                <span>
                  <span className="font-semibold">{place.name}</span>
                  <span className="text-sm text-muted">
                    {" · "}
                    {[CATEGORY_LABELS[place.category], place.city].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <span className={`text-sm ${place.hours_verified_at ? "text-muted" : "text-info"}`}>
                  {place.opening_mode !== "schedule" && place.opening_mode !== "unknown"
                    ? ""
                    : place.hours_verified_at
                      ? `Vérifiée le ${new Date(place.hours_verified_at).toLocaleDateString("fr-FR")}`
                      : "Horaires jamais vérifiés"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
