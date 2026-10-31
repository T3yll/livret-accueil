import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { DraftNotice, GuideHeader } from "@/components/guide/guide-header";
import { SectionContent } from "@/components/guide/section-content";
import { IconBadge, SECTION_ICONS } from "@/components/guide/section-icon";
import type { Locale } from "@/i18n/routing";
import { getGuide } from "@/lib/guide";
import { visibleSectionsOfType } from "@/lib/guide-view";
import { healthPlaces } from "@/lib/places-view";
import { isSectionType } from "@/lib/sections";

type Props = PageProps<"/[locale]/g/[slug]/[section]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug, section } = await params;
  const guide = await getGuide(slug);
  const t = await getTranslations({ locale, namespace: "Sections" });
  return {
    title: guide && isSectionType(section) ? `${t(section)} · ${guide.property.name}` : undefined,
    robots: { index: false, follow: false },
  };
}

export default async function SectionPage({ params }: Props) {
  const { locale: rawLocale, slug, section: type } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);

  if (!isSectionType(type)) notFound();
  const guide = await getGuide(slug);
  if (!guide) notFound();

  // Les fiches équipement sont toutes sur la même page ; les autres types n'ont qu'une section.
  const sections = visibleSectionsOfType(guide, type, locale);
  if (sections.length === 0) notFound();

  const [t, tGuide] = await Promise.all([getTranslations("Sections"), getTranslations("Guide")]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-[640px] flex-col gap-6 px-4 pt-2 pb-12">
      <GuideHeader slug={slug} />
      {guide.property.status === "draft" && <DraftNotice label={tGuide("draftNotice")} />}
      <div className="flex items-center gap-3">
        <IconBadge icon={SECTION_ICONS[type]} size={22} />
        <h1 className="text-[28px] leading-tight">{t(type)}</h1>
      </div>
      <div className="flex flex-col gap-10">
        {sections.map((section) => (
          <SectionContent
            key={section.id}
            section={section}
            property={guide.property}
            locale={locale}
            nearby={type === "contacts" ? healthPlaces(guide) : undefined}
          />
        ))}
      </div>
    </main>
  );
}
