import { Clock, Footprints, Gauge } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { formatHikeDistance, formatHikeDuration, type GuidePlace } from "@/lib/places-view";

type Hike = Pick<GuidePlace, "hike_duration_min" | "hike_distance_km" | "hike_difficulty">;

// Durée, distance et difficulté d'une randonnée, sur une ligne. Rien si aucune n'est renseignée.
export function HikeFacts({ place, className = "" }: { place: Hike; className?: string }) {
  const t = useTranslations("Places.hike");
  const locale = useLocale() as Locale;
  const facts = [
    place.hike_duration_min && { icon: Clock, label: t("duration"), value: formatHikeDuration(place.hike_duration_min, locale) },
    place.hike_distance_km && { icon: Footprints, label: t("distance"), value: t("distanceValue", { distance: formatHikeDistance(place.hike_distance_km, locale) }) },
    place.hike_difficulty && { icon: Gauge, label: t("level"), value: t(`difficulty.${place.hike_difficulty}`) },
  ].filter((fact) => Boolean(fact)) as { icon: typeof Clock; label: string; value: string }[];
  if (facts.length === 0) return null;

  return (
    <ul className={`flex flex-wrap gap-x-3 gap-y-1 text-sm font-semibold ${className}`}>
      {facts.map(({ icon: Icon, label, value }) => (
        <li key={label} className="inline-flex items-center gap-1">
          <Icon size={15} className="text-primary" aria-hidden />
          <span className="sr-only">{label} :</span>
          {value}
        </li>
      ))}
    </ul>
  );
}
