import { ChevronRight, MapPin, Navigation, Phone, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { DraftNotice } from "@/components/guide/guide-header";
import { brand } from "@/config/brand";
import { LanguageSwitcher } from "@/components/guide/language-switcher";
import { Directions } from "@/components/guide/directions";
import { Emblem } from "@/components/guide/emblem";
import { FavoritesCarousel } from "@/components/guide/favorites-carousel";
import { InstallPrompt } from "@/components/guide/install-prompt";
import { IconBadge, SECTION_ICONS } from "@/components/guide/section-icon";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getGuide } from "@/lib/guide";
import { mediaUrl, visibleSectionTypes } from "@/lib/guide-view";
import { localized, localizedWithLang } from "@/lib/localized";
import { guidePlaces } from "@/lib/places-view";
import { RichText } from "@/lib/rich-text";

export async function generateMetadata({ params }: PageProps<"/[locale]/g/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuide(slug);
  return {
    title: guide?.property.name,
    // Livret privé : jamais dans les moteurs de recherche.
    robots: { index: false, follow: false },
  };
}

type Tile = { href: string; label: string; icon: LucideIcon };

export default async function GuidePage({ params }: PageProps<"/[locale]/g/[slug]">) {
  const { locale: rawLocale, slug } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);

  const guide = await getGuide(slug);
  if (!guide) notFound();

  const [t, tSections, tPlaces] = await Promise.all([
    getTranslations("Guide"),
    getTranslations("Sections"),
    getTranslations("Places"),
  ]);
  const { property } = guide;
  const welcome = localizedWithLang(property, "welcome", locale);
  const coverAlt = localized(property, "cover_photo_alt", locale) ?? "";
  const sections = visibleSectionTypes(guide, locale);
  const base = `/g/${slug}`;
  const hasDirections = property.lat !== null && property.lng !== null;
  const places = guidePlaces(guide);
  const hasPlaces = places.length > 0;

  // Les 4 infos les plus demandées, en un geste. Une tuile sans contenu n'apparaît pas.
  const tiles: Tile[] = [
    sections.includes("arrival") && { href: `${base}/arrival`, label: tSections("arrival"), icon: SECTION_ICONS.arrival },
    sections.includes("wifi") && { href: `${base}/wifi`, label: tSections("wifi"), icon: SECTION_ICONS.wifi },
    sections.includes("contacts") && { href: `${base}/contacts`, label: t("contact"), icon: Phone },
    hasPlaces
      ? { href: `${base}/places`, label: tPlaces("tile"), icon: MapPin }
      : hasDirections && { href: "#directions", label: t("directions"), icon: Navigation },
  ].filter((tile): tile is Tile => Boolean(tile));

  return (
    <main className="mx-auto flex min-h-dvh max-w-[640px] flex-col gap-8 pb-12">
      <div className="relative">
        {property.cover_photo_path && (
          <Image
            src={mediaUrl(property.cover_photo_path)}
            alt={coverAlt}
            width={1280}
            height={853}
            priority
            sizes="(max-width: 640px) 100vw, 640px"
            className="aspect-[4/3] w-full object-cover sm:rounded-b-3xl"
          />
        )}
        <div className={property.cover_photo_path ? "absolute top-3 right-4" : "flex justify-end px-4 pt-4"}>
          <LanguageSwitcher />
        </div>
      </div>

      <div className="flex flex-col gap-8 px-4">
        {property.status === "draft" && <DraftNotice label={t("draftNotice")} />}

        <header className="flex flex-col gap-3">
          <Emblem size={48} className="-ml-1" />
          <p className="text-sm text-muted">{t("welcome")}</p>
          <h1 className="text-[32px] leading-tight">{property.name}</h1>
          {welcome && <RichText text={welcome.text} lang={welcome.lang} />}
        </header>

        {tiles.length > 0 && (
          <nav aria-label={t("quickAccess")}>
            <ul className="grid grid-cols-2 gap-3">
              {tiles.map((tile) => {
                const className =
                  "flex min-h-24 flex-col items-start justify-between gap-2 rounded-2xl border border-border bg-surface p-4 font-semibold hover:bg-stone focus-visible:outline-2 focus-visible:outline-primary";
                const content = (
                  <>
                    <IconBadge icon={tile.icon} />
                    {tile.label}
                  </>
                );
                return (
                  <li key={tile.href}>
                    {/* Une ancre sur la même page : lien simple, sans préfixe de langue. */}
                    {tile.href.startsWith("#") ? (
                      <a href={tile.href} className={className}>
                        {content}
                      </a>
                    ) : (
                      <Link href={tile.href} className={className}>
                        {content}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        {/* Juste après les accès rapides (arrivée, Wi-Fi…) : les coups de cœur, visibles sans chercher. */}
        <FavoritesCarousel slug={slug} places={places.filter((p) => p.is_favorite)} locale={locale} />

        {(sections.length > 0 || hasPlaces) && (
          <section aria-labelledby="guide-title" className="flex flex-col gap-3">
            <h2 id="guide-title" className="text-[28px]">
              {t("yourGuide")}
            </h2>
            <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
              {hasPlaces && (
                <li>
                  <Link
                    href={`${base}/places`}
                    className="flex min-h-14 items-center gap-3 px-4 py-2 hover:bg-stone focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                  >
                    <IconBadge icon={MapPin} />
                    <span className="flex-1 font-semibold">{tPlaces("tile")}</span>
                    <ChevronRight size={20} className="text-muted" aria-hidden />
                  </Link>
                </li>
              )}
              {sections.map((type) => (
                <li key={type}>
                  <Link
                    href={`${base}/${type}`}
                    className="flex min-h-14 items-center gap-3 px-4 py-2 hover:bg-stone focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                  >
                    <IconBadge icon={SECTION_ICONS[type]} />
                    <span className="flex-1 font-semibold">{tSections(type)}</span>
                    <ChevronRight size={20} className="text-muted" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <Directions property={property} locale={locale} />

        <InstallPrompt />

        {/* Signature de la marque : discrète, le logement reste au premier plan. */}
        <footer className="flex flex-col items-center gap-2 pt-4 text-center">
          <Emblem size={28} />
          <p className="text-xs tracking-[0.25em] text-muted uppercase">
            {brand.name} · {brand.territory}
          </p>
        </footer>
      </div>
    </main>
  );
}
