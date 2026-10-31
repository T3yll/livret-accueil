import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { DraftNotice, GuideHeader } from "@/components/guide/guide-header";
import { PlacesExplorer } from "@/components/guide/places-explorer";
import { getGuide } from "@/lib/guide";
import { guidePlaces } from "@/lib/places-view";

type Props = PageProps<"/[locale]/g/[slug]/places">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const guide = await getGuide(slug);
  const t = await getTranslations({ locale, namespace: "Places" });
  return { title: guide ? `${t("tile")} · ${guide.property.name}` : undefined, robots: { index: false, follow: false } };
}

export default async function PlacesPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const guide = await getGuide(slug);
  if (!guide) notFound();
  const places = guidePlaces(guide);
  // Module désactivé ou aucune adresse : la section n'existe pas pour le voyageur.
  if (places.length === 0) notFound();

  const [t, tGuide] = await Promise.all([getTranslations("Places"), getTranslations("Guide")]);
  const { lat, lng } = guide.property;

  return (
    <main className="mx-auto flex min-h-dvh max-w-[640px] flex-col gap-6 px-4 pt-2 pb-12">
      <GuideHeader slug={slug} />
      {guide.property.status === "draft" && <DraftNotice label={tGuide("draftNotice")} />}
      <div className="flex flex-col gap-2">
        <div aria-hidden className="h-px w-12 bg-accent" />
        <h1 className="text-[28px] leading-tight">{t("title")}</h1>
      </div>
      <PlacesExplorer
        slug={slug}
        places={places}
        origin={lat !== null && lng !== null ? { lat, lng } : null}
        nowIso={new Date().toISOString()}
      />
    </main>
  );
}
