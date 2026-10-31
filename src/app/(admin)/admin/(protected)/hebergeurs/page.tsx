import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Hébergeurs" };

export default async function HostsPage() {
  const { supabase } = await requireAdmin();
  const { data: hosts, error } = await supabase
    .from("hosts")
    .select("id, name, contact_name, phone, email, properties(count)")
    .order("name");
  if (error) throw error;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px]">Hébergeurs</h1>
        <ButtonLink href="/admin/hebergeurs/nouveau">Nouvel hébergeur</ButtonLink>
      </div>

      {hosts.length === 0 ? (
        <p className="text-muted">Aucun hébergeur pour l&apos;instant.</p>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
          {hosts.map((host) => (
            <li key={host.id}>
              <Link
                href={`/admin/hebergeurs/${host.id}`}
                className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 hover:bg-stone focus-visible:outline-2 focus-visible:outline-primary"
              >
                <span className="font-semibold">{host.name}</span>
                <span className="text-sm text-muted">
                  {[host.contact_name, host.phone, host.email].filter(Boolean).join(" · ")}
                  {" · "}
                  {host.properties[0]?.count ?? 0} logement(s)
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
