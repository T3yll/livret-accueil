import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { LanguageSwitcher } from "@/components/guide/language-switcher";
import type { Locale } from "@/i18n/routing";
import { getGuide } from "@/lib/guide";
import { localized } from "@/lib/localized";

// Accueil du livret. Version minimale de la semaine 1 : les sections arrivent en semaine 2.

export async function generateMetadata({ params }: PageProps<"/[locale]/g/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuide(slug);
  return {
    title: guide?.property.name,
    // Livret privé : jamais dans les moteurs de recherche.
    robots: { index: false, follow: false },
  };
}

export default async function GuidePage({ params }: PageProps<"/[locale]/g/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const guide = await getGuide(slug);
  if (!guide) notFound();

  const t = await getTranslations("Guide");
  const { property } = guide;
  const welcome = localized(property, "welcome", locale as Locale);

  return (
    <main className="mx-auto flex min-h-dvh max-w-[640px] flex-col gap-6 px-4 py-8">
      {property.status === "draft" && (
        <p role="status" className="rounded-xl bg-stone px-4 py-3 text-sm text-info">
          {t("draftNotice")}
        </p>
      )}
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{t("welcome")}</p>
          <h1 className="text-[32px] leading-tight">{property.name}</h1>
        </div>
        <LanguageSwitcher />
      </header>
      {welcome && <p className="whitespace-pre-line">{welcome}</p>}
    </main>
  );
}
