import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { parisDay } from "@/lib/opening-hours";
import { markVerified, setArchived } from "../actions";
import { PlaceForm } from "../place-form";

export const metadata = { title: "Adresse" };

export default async function PlacePage({ params }: PageProps<"/admin/adresses/[id]">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const [{ data: place }, { data: hours }, { data: closures }, { data: usedBy }] = await Promise.all([
    supabase.from("places").select("*").eq("id", id).maybeSingle(),
    supabase.from("place_opening_hours").select("weekday, opens_at, closes_at").eq("place_id", id),
    supabase.from("place_closures").select("starts_on, ends_on, reason_fr, reason_en").eq("place_id", id).order("starts_on"),
    supabase.from("property_places").select("is_favorite, properties(id, name)").eq("place_id", id),
  ]);
  if (!place) notFound();

  const archived = place.archived_at !== null;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <p>
          <Link href="/admin/adresses" className="text-sm font-semibold text-primary underline">
            ← Adresses
          </Link>
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[28px]">{place.name}</h1>
          {archived && <span className="rounded-full bg-stone px-2.5 py-1 text-sm font-semibold text-muted">Archivée</span>}
        </div>
        <div className="flex flex-wrap gap-3">
          <form action={markVerified.bind(null, place.id)}>
            <Button type="submit" variant="secondary">
              Horaires vérifiés aujourd&apos;hui
            </Button>
          </form>
          <form action={setArchived.bind(null, place.id, !archived)}>
            <Button type="submit" variant={archived ? "secondary" : "danger"}>
              {archived ? "Désarchiver" : "Archiver"}
            </Button>
          </form>
        </div>
        <p className="text-sm text-muted">
          Une adresse archivée disparaît de tous les livrets, mais reste en base (on ne supprime pas).
        </p>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-2xl">Utilisée par</h2>
        {usedBy && usedBy.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {usedBy.map(
              ({ properties: property, is_favorite }) =>
                property && (
                  <li key={property.id}>
                    <Link
                      href={`/admin/logements/${property.id}`}
                      className="inline-flex min-h-11 items-center rounded-full border border-border bg-surface px-3 text-sm font-semibold hover:bg-stone"
                    >
                      {property.name}
                      {is_favorite && <span className="ml-1 text-favorite">· coup de cœur</span>}
                    </Link>
                  </li>
                ),
            )}
          </ul>
        ) : (
          <p className="text-sm text-muted">Aucun logement pour l&apos;instant.</p>
        )}
      </section>

      <PlaceForm
        place={place}
        hours={(hours ?? []).map((h) => ({ ...h, opens_at: h.opens_at.slice(0, 5), closes_at: h.closes_at.slice(0, 5) }))}
        closures={closures ?? []}
        today={parisDay(new Date()).date}
      />
    </div>
  );
}
