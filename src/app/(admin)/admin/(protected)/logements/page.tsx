import Link from "next/link";
import { StatusBadge } from "@/components/admin/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Logements" };

export default async function PropertiesPage() {
  const { supabase } = await requireAdmin();
  const { data: properties, error } = await supabase
    .from("properties")
    .select("id, name, city, status, hosts(name)")
    .order("name");
  if (error) throw error;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px]">Logements</h1>
        <ButtonLink href="/admin/logements/nouveau">Nouveau logement</ButtonLink>
      </div>

      {properties.length === 0 ? (
        <p className="text-muted">Aucun logement pour l&apos;instant.</p>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
          {properties.map((property) => (
            <li key={property.id}>
              <Link
                href={`/admin/logements/${property.id}`}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-stone focus-visible:outline-2 focus-visible:outline-primary"
              >
                <span>
                  <span className="font-semibold">{property.name}</span>
                  <span className="text-sm text-muted">
                    {" · "}
                    {[property.hosts?.name, property.city].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <StatusBadge status={property.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
