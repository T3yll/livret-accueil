import { Heart } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORY_LABELS } from "@/components/admin/place-labels";
import { requireAdmin } from "@/lib/auth";
import { distanceKm, formatDistance } from "@/lib/distance";
import type { Enums } from "@/types/database";
import { addPlace, removePlace } from "./actions";

export const metadata = { title: "Choisir les adresses" };

const isCategory = (value: unknown): value is Enums<"place_category"> =>
  typeof value === "string" && value in CATEGORY_LABELS;

const rowButton =
  "min-h-11 rounded-lg px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-primary";

// Choix des adresses d'un logement dans la base commune, de la plus proche à la plus lointaine.
export default async function PickPlacesPage({ params, searchParams }: PageProps<"/admin/logements/[id]/adresses">) {
  const { id } = await params;
  const { categorie } = await searchParams;
  const category = isCategory(categorie) ? categorie : null;
  const { supabase } = await requireAdmin();

  let placesQuery = supabase.from("places").select("id, name, category, city, lat, lng").is("archived_at", null);
  if (category) placesQuery = placesQuery.eq("category", category);

  const [{ data: property }, { data: places }, { data: selected }] = await Promise.all([
    supabase.from("properties").select("id, name, lat, lng").eq("id", id).maybeSingle(),
    placesQuery,
    supabase.from("property_places").select("place_id, is_favorite").eq("property_id", id),
  ]);
  if (!property) notFound();

  const selection = new Map((selected ?? []).map((s) => [s.place_id, s.is_favorite]));
  const origin = property.lat !== null && property.lng !== null ? { lat: property.lat, lng: property.lng } : null;
  const rows = (places ?? [])
    .map((place) => ({ ...place, km: origin ? distanceKm(origin, place) : null }))
    .sort((a, b) => (a.km ?? 0) - (b.km ?? 0) || a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col gap-6">
      <p>
        <Link href={`/admin/logements/${id}`} className="text-sm font-semibold text-primary underline">
          ← {property.name}
        </Link>
      </p>
      <h1 className="text-[28px]">Adresses du livret</h1>
      <p className="text-sm text-muted">
        {selection.size} adresse(s) choisie(s). Les adresses Santé alimentent la section Urgences des Contacts.
        {!origin && " Renseignez les coordonnées GPS du logement pour trier par distance."}
      </p>

      <nav aria-label="Catégories" className="flex flex-wrap gap-2">
        {[null, ...Object.keys(CATEGORY_LABELS)].map((key) => (
          <Link
            key={key ?? "all"}
            href={key ? `?categorie=${key}` : "?"}
            aria-current={category === key ? "page" : undefined}
            className="inline-flex min-h-11 items-center rounded-full border border-border px-3 text-sm font-semibold hover:bg-stone aria-[current=page]:bg-primary aria-[current=page]:text-white"
          >
            {key ? CATEGORY_LABELS[key as Enums<"place_category">] : "Toutes"}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <p className="text-muted">
          Aucune adresse dans la base.{" "}
          <Link href="/admin/adresses/nouvelle" className="font-semibold text-primary underline">
            En créer une
          </Link>
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
          {rows.map((place) => {
            const isSelected = selection.has(place.id);
            return (
              <li key={place.id} className="flex flex-wrap items-center gap-3 px-4 py-2">
                <span className="min-w-0 flex-1">
                  <span className="font-semibold">{place.name}</span>
                  {selection.get(place.id) && (
                    <Heart size={16} className="ml-1 inline text-favorite" fill="currentColor" aria-label="coup de cœur" />
                  )}
                  <span className="block text-sm text-muted">
                    {[CATEGORY_LABELS[place.category], place.city, place.km !== null && formatDistance(place.km, "fr")]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                {isSelected && (
                  <Link
                    href={`/admin/logements/${id}/adresses/${place.id}`}
                    className={`${rowButton} inline-flex items-center text-primary hover:bg-stone`}
                  >
                    Coup de cœur / mot de l&apos;hôte
                  </Link>
                )}
                <form action={isSelected ? removePlace.bind(null, id, place.id, false) : addPlace.bind(null, id, place.id)}>
                  <button
                    type="submit"
                    aria-label={`${isSelected ? "Retirer" : "Ajouter"} ${place.name}`}
                    className={`${rowButton} ${isSelected ? "border border-border text-text hover:bg-stone" : "bg-primary text-white hover:opacity-90"}`}
                  >
                    {isSelected ? "Retirer" : "Ajouter"}
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
