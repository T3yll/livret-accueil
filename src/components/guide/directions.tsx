import { MapPin, Navigation } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import type { Guide } from "@/lib/guide";
import { directionsLinks } from "@/lib/guide-view";

// Adresse du logement et itinéraire dans l'application de navigation du voyageur.
export async function Directions({ property, locale }: { property: Guide["property"]; locale: Locale }) {
  const t = await getTranslations("Guide");
  const address = [property.address, [property.postal_code, property.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  if (!address && (property.lat === null || property.lng === null)) return null;

  return (
    <section id="directions" aria-labelledby="directions-title" className="flex scroll-mt-4 flex-col gap-3">
      <h2 id="directions-title" className="text-[28px]">
        {t("directions")}
      </h2>
      {address && (
        <p className="flex items-start gap-2">
          <MapPin size={20} className="mt-0.5 shrink-0 text-primary" aria-hidden />
          <span>{address}</span>
        </p>
      )}
      {property.lat !== null && property.lng !== null && (
        <ul className="flex flex-col gap-2">
          {directionsLinks(property.lat, property.lng, locale).map((link) => (
            <li key={link.app}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-surface px-4 font-semibold hover:bg-stone focus-visible:outline-2 focus-visible:outline-primary"
              >
                <Navigation size={20} className="text-primary" aria-hidden />
                <span className="sr-only">{t("openIn", { app: link.app })}</span>
                <span aria-hidden>{link.app}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
