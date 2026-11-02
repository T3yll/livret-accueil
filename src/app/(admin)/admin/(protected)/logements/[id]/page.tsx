import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { guideUrl, isLocalUrl, qrSvg } from "@/lib/qr";
import { deleteProperty, regenerateSlug, setModule, setPublished } from "../actions";
import { PropertyForm } from "../property-form";
import { missingForPublication } from "../publication";
import { SectionsPanel } from "./sections-panel";

export const metadata = { title: "Logement" };

const errors: Record<string, string> = {
  incomplete: "Publication impossible : des informations essentielles manquent.",
  save: "L'opération a échoué. Réessayez.",
};

export default async function PropertyPage({ params, searchParams }: PageProps<"/admin/logements/[id]">) {
  const { id } = await params;
  const { error } = await searchParams;
  const { supabase } = await requireAdmin();

  const [{ data: property }, { data: hosts }, { data: modules }, { data: sections }, { data: selectedPlaces }] =
    await Promise.all([
      supabase.from("properties").select("*").eq("id", id).maybeSingle(),
      supabase.from("hosts").select("id, name").order("name"),
      supabase.from("property_modules").select("module_key, is_active").eq("property_id", id),
      supabase.from("guide_sections").select("*").eq("property_id", id).order("position").order("created_at"),
      supabase.from("property_places").select("is_favorite, places(category, archived_at)").eq("property_id", id),
    ]);
  if (!property) notFound();

  const missing = missingForPublication(property, sections ?? []);
  const published = property.status === "published";
  const placesActive = modules?.some((m) => m.module_key === "places" && m.is_active) ?? false;
  const guidePath = `/g/${property.slug}`;
  const placeStats = {
    total: selectedPlaces?.length ?? 0,
    favorites: selectedPlaces?.filter((p) => p.is_favorite).length ?? 0,
    health: selectedPlaces?.filter((p) => p.places?.category === "health").length ?? 0,
    archived: selectedPlaces?.filter((p) => p.places?.archived_at).length ?? 0,
  };
  const errorMessage = typeof error === "string" ? errors[error] : undefined;
  const qrUrl = guideUrl(property.slug);
  const qr = await qrSvg(qrUrl);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <p>
          <Link href="/admin/logements" className="text-sm font-semibold text-primary underline">
            ← Logements
          </Link>
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[28px]">{property.name}</h1>
          <StatusBadge status={property.status} />
        </div>
        {errorMessage && (
          <p role="alert" className="rounded-xl bg-favorite-bg px-4 py-3 text-sm text-favorite">
            {errorMessage}
          </p>
        )}
      </div>

      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4">
        <h2 className="text-2xl">Livret</h2>
        <p className="text-sm break-all">
          Adresse publique : <code className="rounded bg-stone px-1.5 py-0.5">{guidePath}</code>
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={guidePath}
            target="_blank"
            className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-[15px] font-semibold hover:bg-stone"
          >
            Prévisualiser
          </Link>
          <form action={setPublished.bind(null, property.id, !published)}>
            <Button type="submit" variant={published ? "secondary" : "primary"} disabled={!published && missing.length > 0}>
              {published ? "Repasser en brouillon" : "Publier"}
            </Button>
          </form>
          <form action={regenerateSlug.bind(null, property.id)}>
            <Button type="submit" variant="secondary">
              Changer l&apos;adresse du livret
            </Button>
          </form>
        </div>
        {!published && missing.length > 0 && (
          <p className="text-sm text-info">Pour publier, il manque : {missing.join(", ")}.</p>
        )}
        <p className="text-sm text-muted">
          Changer l&apos;adresse rend l&apos;ancien lien et l&apos;ancien QR code inutilisables : à faire seulement
          si le lien a circulé.
        </p>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4">
        <h2 className="text-2xl">QR code</h2>
        <div className="flex flex-wrap items-start gap-6">
          <div
            role="img"
            aria-label={`QR code du livret : ${qrUrl}`}
            className="size-40 shrink-0 rounded-xl border border-border [&>svg]:size-full"
            dangerouslySetInnerHTML={{ __html: qr }}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <p className="text-sm break-all">
              Ouvre : <code className="rounded bg-stone px-1.5 py-0.5">{qrUrl}</code>
            </p>
            {isLocalUrl(qrUrl) && (
              <p className="text-sm text-favorite">
                Adresse locale : ce QR code ne fonctionnera pas sur un téléphone. Renseignez NEXT_PUBLIC_SITE_URL
                avec l&apos;adresse du site en ligne.
              </p>
            )}
            {!published && <p className="text-sm text-info">Livret en brouillon : le QR code n&apos;ouvrira rien tant qu&apos;il n&apos;est pas publié.</p>}
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={`/admin/logements/${property.id}/carte-qr`}>Carte A6 à imprimer</ButtonLink>
              <a
                href={`/admin/logements/${property.id}/qr?format=png`}
                download
                className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-[15px] font-semibold hover:bg-stone"
              >
                Télécharger en PNG
              </a>
              <a
                href={`/admin/logements/${property.id}/qr?format=svg`}
                download
                className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-[15px] font-semibold hover:bg-stone"
              >
                Télécharger en SVG
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
        <h2 className="text-2xl">Bonnes adresses</h2>
        <p className="text-sm">
          {placeStats.total} adresse(s) choisie(s), dont {placeStats.favorites} coup(s) de cœur
          {placeStats.health > 0 && ` et ${placeStats.health} pour les urgences`}.
          {placeStats.archived > 0 && (
            <span className="text-info"> {placeStats.archived} archivée(s), donc masquée(s).</span>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <ButtonLink href={`/admin/logements/${property.id}/adresses`} variant="secondary">
            Choisir les adresses
          </ButtonLink>
          <form action={setModule.bind(null, property.id, "places", !placesActive)} className="flex flex-wrap items-center gap-3">
            <span>
              Module : <strong>{placesActive ? "activé" : "désactivé"}</strong>
            </span>
            <Button type="submit" variant="secondary">
              {placesActive ? "Désactiver" : "Activer"}
            </Button>
          </form>
        </div>
        {!placesActive && (
          <p className="text-sm text-muted">Module désactivé : seules les adresses Santé (urgences) restent visibles.</p>
        )}
      </section>

      <SectionsPanel propertyId={property.id} sections={sections ?? []} />

      <PropertyForm property={property} hosts={hosts ?? []} />

      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="text-2xl">Supprimer</h2>
        <p className="text-sm text-muted">Supprime aussi les sections et la sélection d&apos;adresses du logement.</p>
        <form action={deleteProperty.bind(null, property.id)}>
          <Button type="submit" variant="danger">
            Supprimer ce logement
          </Button>
        </form>
      </section>
    </div>
  );
}
