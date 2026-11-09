import type { Metadata } from "next";
import { OfflineSupport } from "@/components/guide/offline-support";
import { StayFromLink } from "@/components/guide/stay-from-link";
import { WelcomeIntro } from "@/components/guide/welcome-intro";
import type { Locale } from "@/i18n/routing";
import { getGuide } from "@/lib/guide";
import { mediaUrl, visibleSectionTypes } from "@/lib/guide-view";
import { localized, localizedWithLang } from "@/lib/localized";
import { guidePlaces } from "@/lib/places-view";

export async function generateMetadata({ params }: LayoutProps<"/[locale]/g/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) return {};
  return {
    manifest: `/${locale}/g/${slug}/manifest.webmanifest`,
    // iOS n'utilise pas le manifest pour le nom et l'icône de l'écran d'accueil.
    appleWebApp: { capable: true, title: guide.property.name, statusBarStyle: "default" },
    icons: { apple: "/icons/apple-touch-icon.png" },
  };
}

// Commun à toutes les pages d'un livret : rend le livret consultable hors connexion.
export default async function GuideLayout({ children, params }: LayoutProps<"/[locale]/g/[slug]">) {
  const { locale: rawLocale, slug } = await params;
  const locale = rawLocale as Locale;
  const guide = await getGuide(slug);

  // Toutes les pages du livret dans la langue courante : enregistrées en arrière-plan
  // dès la première visite, pour qu'elles s'ouvrent ensuite même sans réseau.
  const base = `/${locale}/g/${slug}`;
  const places = guide ? guidePlaces(guide) : [];
  const urls = guide
    ? [
        base,
        `${base}/informations`,
        ...visibleSectionTypes(guide, locale).map((type) => `${base}/${type}`),
        ...(places.length > 0 ? [`${base}/places`, ...places.map((p) => `${base}/places/${p.id}`)] : []),
      ]
    : [];

  // Repli sur le français si la note anglaise manque, comme pour les textes.
  const audio = guide ? localizedWithLang(guide.property, "welcome_audio_path", locale) : null;
  const audioUrl = audio ? mediaUrl(audio.text) : null;

  return (
    <>
      {children}
      <OfflineSupport urls={urls} audioUrl={audioUrl} />
      <StayFromLink slug={slug} />
      {guide && (
        <WelcomeIntro
          slug={slug}
          hosts={guide.property.host_display_names}
          audio={audio && audioUrl ? { src: audioUrl, lang: audio.lang } : null}
          transcript={localized(guide.property, "welcome_transcript", locale)}
        />
      )}
    </>
  );
}
