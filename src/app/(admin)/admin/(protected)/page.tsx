import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Tableau de bord" };

export default async function DashboardPage() {
  const { supabase } = await requireAdmin();

  const count = (table: "hosts" | "properties" | "places") =>
    supabase.from(table).select("*", { count: "exact", head: true });

  const [hosts, properties, published, toReview] = await Promise.all([
    count("hosts"),
    count("properties"),
    supabase.from("properties").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("places_needing_review").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Hébergeurs", value: hosts.count, href: "/admin/hebergeurs" },
    { label: "Logements", value: properties.count, href: "/admin/logements" },
    { label: "Livrets publiés", value: published.count, href: "/admin/logements" },
    { label: "Adresses à revérifier", value: toReview.count, href: null },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[28px]">Tableau de bord</h1>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => {
          const content = (
            <>
              <span className="text-[28px] font-semibold">{stat.value ?? 0}</span>
              <span className="text-sm text-muted">{stat.label}</span>
            </>
          );
          return (
            <li key={stat.label}>
              {stat.href ? (
                <Link
                  href={stat.href}
                  className="flex flex-col rounded-2xl border border-border bg-surface p-4 hover:bg-stone focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {content}
                </Link>
              ) : (
                <div className="flex flex-col rounded-2xl border border-border bg-surface p-4">{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
