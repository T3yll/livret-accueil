import Link from "next/link";
import { brand } from "@/config/brand";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../login/actions";

const nav = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/hebergeurs", label: "Hébergeurs" },
  { href: "/admin/logements", label: "Logements" },
  { href: "/admin/adresses", label: "Adresses" },
] as const;

export default async function ProtectedLayout({ children }: LayoutProps<"/admin">) {
  const { email } = await requireAdmin();

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <p className="font-heading text-xl">{brand.name} · Admin</p>
          <nav aria-label="Administration" className="flex flex-wrap gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold hover:bg-stone focus-visible:outline-2 focus-visible:outline-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={logout} className="ml-auto flex items-center gap-3">
            {email && <span className="hidden text-sm text-muted sm:inline">{email}</span>}
            <button
              type="submit"
              className="min-h-11 rounded-lg px-3 text-sm font-semibold text-primary hover:bg-stone focus-visible:outline-2 focus-visible:outline-primary"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
