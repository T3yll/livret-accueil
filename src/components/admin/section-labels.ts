import type { KEY_HANDOVER, SectionType } from "@/lib/sections";

// Libellés de l'admin (en français uniquement).
export const SECTION_LABELS: Record<SectionType, string> = {
  arrival: "Arrivée",
  wifi: "Wi-Fi",
  house: "Le logement",
  equipment: "Équipement",
  departure: "Départ",
  contacts: "Contacts utiles",
  practical: "Infos pratiques",
  prepare: "Préparer mon séjour",
};

export const KEY_HANDOVER_LABELS: Record<(typeof KEY_HANDOVER)[number], string> = {
  key_box: "Boîte à clés",
  in_person: "Remise en main propre",
  smart_lock: "Serrure à code",
  other: "Autre",
};

// Aide affichée au-dessus du texte libre de chaque section.
export const SECTION_BODY_HINTS: Record<SectionType, string> = {
  arrival: "Accès au logement, consignes, que faire en cas d'arrivée tardive.",
  wifi: "Conseil éventuel (ex. « privilégiez le réseau 5 GHz »).",
  house: "Présentation, pièces, règles de la maison.",
  equipment: "Mode d'emploi, étape par étape.",
  departure: "Consignes : clés, poubelles, lave-vaisselle…",
  contacts: "Autres contacts utiles (médecin, voisin…). Le contact de l'hôte et les urgences s'affichent automatiquement.",
  practical: "Tri des déchets, commerces de base, horaires utiles.",
  prepare: "Ce qu'il faut savoir pour faire sa valise.",
};
