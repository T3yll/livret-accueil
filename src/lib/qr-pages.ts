import { SECTION_TYPES } from "@/lib/sections";

// Pages du livret qu'un QR code peut ouvrir directement (en plus de l'accueil).
export const QR_PAGES = ["places", ...SECTION_TYPES] as const;
export type QrPage = (typeof QR_PAGES)[number];

// Valeur reçue d'une adresse (?qr=… ou ?page=…) : une page connue, sinon l'accueil (null).
export function parseQrPage(value: unknown): QrPage | null {
  return typeof value === "string" && (QR_PAGES as readonly string[]).includes(value) ? (value as QrPage) : null;
}
