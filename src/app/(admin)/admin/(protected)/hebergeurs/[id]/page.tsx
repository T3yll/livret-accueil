import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireAdmin } from "@/lib/auth";
import { deleteHost } from "../actions";
import { HostForm } from "../host-form";

export const metadata = { title: "Hébergeur" };

export default async function HostPage({ params, searchParams }: PageProps<"/admin/hebergeurs/[id]">) {
  const { id } = await params;
  const { error } = await searchParams;
  const { supabase } = await requireAdmin();

  const { data: host } = await supabase.from("hosts").select("*").eq("id", id).maybeSingle();
  if (!host) notFound();

  const { data: properties } = await supabase
    .from("properties")
    .select("id, name, city, status")
    .eq("host_id", id)
    .order("name");

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-6">
        <p>
          <Link href="/admin/hebergeurs" className="text-sm font-semibold text-primary underline">
            ← Hébergeurs
          </Link>
        </p>
        <h1 className="text-[28px]">{host.name}</h1>
        <HostForm host={host} />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl">Logements</h2>
          <ButtonLink href={`/admin/logements/nouveau?hote=${host.id}`} variant="secondary">
            Ajouter un logement
          </ButtonLink>
        </div>
        {properties && properties.length > 0 ? (
          <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
            {properties.map((property) => (
              <li key={property.id}>
                <Link
                  href={`/admin/logements/${property.id}`}
                  className="flex items-center justify-between gap-2 px-4 py-3 hover:bg-stone focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <span>
                    <span className="font-semibold">{property.name}</span>
                    {property.city && <span className="text-sm text-muted"> · {property.city}</span>}
                  </span>
                  <StatusBadge status={property.status} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">Aucun logement.</p>
        )}
      </section>

      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="text-2xl">Supprimer</h2>
        {error === "has-properties" && (
          <p role="alert" className="text-sm text-favorite">
            Impossible : supprimez d&apos;abord les logements de cet hébergeur.
          </p>
        )}
        <form action={deleteHost.bind(null, host.id)}>
          <Button type="submit" variant="danger">
            Supprimer cet hébergeur
          </Button>
        </form>
      </section>
    </div>
  );
}
