"use client";

import { ChevronRight, ExternalLink } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { localizedWithLang } from "@/lib/localized";
import { experiencesDuring, formatEventDate, formatEventTime, type PlaceWithDistance } from "@/lib/places-view";
import { useStay } from "@/lib/use-stay";

// Au plus 5 rendez-vous à l'accueil : au-delà, la carte et les fiches prennent le relais.
const MAX_ITEMS = 5;

// « À vivre pendant votre séjour » : n'apparaît que si le voyageur a donné ses dates
// et qu'au moins une expérience a une date pendant le séjour. Sinon, rien à l'écran.
export function StayExperiences({ slug, places }: { slug: string; places: PlaceWithDistance[] }) {
  const t = useTranslations("Experiences");
  const locale = useLocale() as Locale;
  const { stay } = useStay(slug);
  if (!stay) return null;
  const items = experiencesDuring(places, stay);
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="experiences-title" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 id="experiences-title" className="text-[28px] leading-tight">
          {t("title")}
        </h2>
        <p className="text-sm text-muted">{t("intro")}</p>
      </div>
      <ul className="flex flex-col gap-2">
        {items.slice(0, MAX_ITEMS).map(({ place, event }) => {
          const label = localizedWithLang(event, "label", locale);
          const bookingUrl = event.booking_url ?? place.booking_url;
          const time = event.start_time
            ? event.end_time
              ? t("timeRange", { start: formatEventTime(event.start_time, locale), end: formatEventTime(event.end_time, locale) })
              : formatEventTime(event.start_time, locale)
            : null;
          return (
            <li key={event.id} className="flex items-stretch overflow-hidden rounded-2xl border border-border bg-surface">
              <Link
                href={`/g/${slug}/places/${place.id}`}
                className="flex min-h-16 flex-1 items-center gap-3 px-4 py-3 hover:bg-stone focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
              >
                <span className="flex flex-1 flex-col">
                  <span className="text-sm font-semibold text-primary">
                    {formatEventDate(event.starts_on, locale)}
                    {time && ` · ${time}`}
                  </span>
                  <span lang={label?.lang} className="font-semibold">
                    {label?.text ?? place.name}
                  </span>
                  {label && <span className="text-sm text-muted">{place.name}</span>}
                </span>
                <ChevronRight size={20} className="shrink-0 text-muted" aria-hidden />
              </Link>
              {bookingUrl && (
                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-16 flex-col items-center justify-center gap-1 border-l border-border px-3 text-xs font-semibold text-primary hover:bg-stone focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                >
                  <ExternalLink size={18} aria-hidden />
                  {t("book")}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
