import type { Tables } from "@/types/database";

type PublicationFields = Pick<Tables<"properties">, "address" | "lat" | "lng" | "welcome_fr" | "welcome_en">;

// Ce qui manque pour publier. Les sections Arrivée et Wi-Fi s'ajouteront en semaine 2.
export function missingForPublication(property: PublicationFields): string[] {
  const missing: string[] = [];
  if (!property.address) missing.push("adresse");
  if (property.lat === null || property.lng === null) missing.push("coordonnées GPS");
  if (!property.welcome_fr) missing.push("message d'accueil (FR)");
  if (!property.welcome_en) missing.push("message d'accueil (EN)");
  return missing;
}
