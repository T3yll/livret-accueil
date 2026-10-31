import type { Enums } from "@/types/database";

// Libellés de l'admin (en français uniquement).
export const CATEGORY_LABELS: Record<Enums<"place_category">, string> = {
  restaurant: "Restaurant",
  producer: "Producteur",
  market: "Marché",
  shop: "Commerce",
  activity: "Activité",
  heritage: "Site à visiter",
  family: "Sortie en famille",
  health: "Santé (urgences)",
};

export const OPENING_MODE_LABELS: Record<Enums<"opening_mode">, string> = {
  schedule: "Horaires par jour",
  always: "Accès libre, toujours ouvert",
  appointment: "Sur rendez-vous",
  unknown: "Horaires inconnus (« à vérifier »)",
};

export const WEEKDAY_LABELS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
