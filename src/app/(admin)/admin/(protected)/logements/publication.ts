import { parseSectionData } from "@/lib/sections";
import type { Tables } from "@/types/database";

type PublicationFields = Pick<Tables<"properties">, "address" | "lat" | "lng" | "welcome_fr" | "welcome_en">;
type SectionFields = Pick<Tables<"guide_sections">, "type" | "data" | "is_active">;

// Ce qui manque pour publier : les infos que les voyageurs demandent le plus.
export function missingForPublication(property: PublicationFields, sections: SectionFields[]): string[] {
  const missing: string[] = [];
  if (!property.address) missing.push("adresse");
  if (property.lat === null || property.lng === null) missing.push("coordonnées GPS");
  if (!property.welcome_fr) missing.push("message d'accueil (FR)");
  if (!property.welcome_en) missing.push("message d'accueil (EN)");

  const active = (type: SectionFields["type"]) => sections.find((s) => s.type === type && s.is_active);

  const arrival = active("arrival");
  const a = arrival ? parseSectionData("arrival", arrival.data) : {};
  if (!a.checkin_from) missing.push("heure d'arrivée");
  if (!a.key_handover) missing.push("remise des clés");

  const wifi = active("wifi");
  const w = wifi ? parseSectionData("wifi", wifi.data) : {};
  if (!w.no_wifi && !w.ssid) missing.push("Wi-Fi (ou « pas de Wi-Fi »)");

  return missing;
}
