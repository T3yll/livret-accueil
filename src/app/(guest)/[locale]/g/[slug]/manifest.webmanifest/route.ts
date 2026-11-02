import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { brandColors } from "@/config/brand";
import { routing } from "@/i18n/routing";
import { getGuide } from "@/lib/guide";

// Un manifest par livret : l'icône ajoutée à l'écran d'accueil rouvre ce logement,
// dans la langue choisie, sans passer par la redirection /g/… (qui demande le réseau).
export async function GET(_request: Request, { params }: RouteContext<"/[locale]/g/[slug]/manifest.webmanifest">) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return new Response(null, { status: 404 });
  const guide = await getGuide(slug);
  if (!guide) return new Response(null, { status: 404 });

  const t = await getTranslations({ locale, namespace: "Metadata" });
  const manifest = {
    // Même identifiant dans les deux langues : une seule installation par logement.
    id: `/g/${slug}`,
    name: guide.property.name,
    short_name: guide.property.name,
    description: t("description"),
    lang: locale,
    start_url: `/${locale}/g/${slug}`,
    scope: "/",
    display: "standalone",
    background_color: brandColors.background,
    theme_color: brandColors.background,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };

  return Response.json(manifest, {
    headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=3600" },
  });
}
