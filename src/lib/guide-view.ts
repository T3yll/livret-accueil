import type { Locale } from "@/i18n/routing";
import type { Guide } from "@/lib/guide";
import { isSectionEmpty, type SectionType } from "@/lib/sections";

export type GuideSection = Guide["sections"][number];

// Sections montrées au voyageur, dans l'ordre du livret. Les fiches équipement
// sont regroupées sous une seule entrée « Équipements », à la place de la première.
export function visibleSectionTypes(guide: Guide, locale: Locale): SectionType[] {
  const types: SectionType[] = [];
  for (const section of guide.sections) {
    if (isSectionEmpty(section, locale) || types.includes(section.type)) continue;
    types.push(section.type);
  }
  return types;
}

export function visibleSectionsOfType(guide: Guide, type: SectionType, locale: Locale): GuideSection[] {
  return guide.sections.filter((s) => s.type === type && !isSectionEmpty(s, locale));
}

// « 16:00 » → « 16:00 » en français, « 4:00 PM » en anglais.
export function formatTime(time: string, locale: Locale): string {
  const [hours, minutes] = time.split(":").map(Number);
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: locale === "en",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2000, 0, 1, hours, minutes)));
}

export function directionsLinks(lat: number, lng: number, locale: Locale) {
  const destination = `${lat},${lng}`;
  return [
    { app: "Google Maps", href: `https://www.google.com/maps/dir/?api=1&destination=${destination}` },
    { app: locale === "fr" ? "Plans (Apple)" : "Apple Maps", href: `https://maps.apple.com/?daddr=${destination}` },
    { app: "Waze", href: `https://waze.com/ul?ll=${destination}&navigate=yes` },
  ];
}

export function mediaUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;
}
