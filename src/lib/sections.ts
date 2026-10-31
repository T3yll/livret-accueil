import { z } from "zod";
import type { Locale } from "@/i18n/routing";
import { localized } from "@/lib/localized";
import type { Enums, Json } from "@/types/database";

// Contenu structuré de chaque type de section (colonne guide_sections.data).
// Les textes longs restent dans body_fr / body_en.

export type SectionType = Enums<"section_type">;

// Ordre d'affichage par défaut et nom d'URL (identique en FR et EN : /g/[slug]/arrival).
export const SECTION_TYPES = [
  "arrival",
  "wifi",
  "house",
  "equipment",
  "departure",
  "contacts",
  "practical",
] as const satisfies readonly SectionType[];

export const isSectionType = (value: string): value is SectionType =>
  (SECTION_TYPES as readonly string[]).includes(value);

const text = z.string().trim().optional().catch(undefined);
const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
  .optional()
  .catch(undefined);
const url = z.url({ protocol: /^https$/ }).optional().catch(undefined);

export const KEY_HANDOVER = ["key_box", "in_person", "smart_lock", "other"] as const;

export const sectionDataSchemas = {
  arrival: z.object({
    checkin_from: time,
    checkin_until: time,
    key_handover: z.enum(KEY_HANDOVER).optional().catch(undefined),
    access_code: text,
    parking_fr: text,
    parking_en: text,
    video_url: url,
  }),
  wifi: z.object({
    no_wifi: z.boolean().optional().catch(undefined),
    ssid: text,
    password: text,
  }),
  house: z.object({}),
  equipment: z.object({}),
  departure: z.object({
    checkout_time: time,
  }),
  contacts: z.object({}),
  practical: z.object({}),
} satisfies Record<SectionType, z.ZodType>;

export type SectionData<T extends SectionType> = z.infer<(typeof sectionDataSchemas)[T]>;

// Lecture tolérante : un champ mal formé est ignoré plutôt que de casser la page.
export function parseSectionData<T extends SectionType>(type: T, data: Json): SectionData<T> {
  const result = sectionDataSchemas[type].safeParse(data ?? {});
  return (result.success ? result.data : {}) as SectionData<T>;
}

export type MediaItem = { path: string; alt_fr?: string; alt_en?: string };

const mediaSchema = z.array(
  z.object({ path: z.string().min(1), alt_fr: z.string().optional(), alt_en: z.string().optional() }),
);

export function parseMedia(media: Json): MediaItem[] {
  const result = mediaSchema.safeParse(media ?? []);
  return result.success ? result.data : [];
}

export type SectionLike = {
  type: SectionType;
  title_fr: string | null;
  title_en: string | null;
  body_fr: string | null;
  body_en: string | null;
  data: Json;
  media: Json;
  is_active: boolean;
};

// Une section vide ne s'affiche jamais côté voyageur.
// « Vide » = rien d'utile à montrer dans cette langue (le FR sert de repli pour l'EN).
export function isSectionEmpty(section: SectionLike, locale: Locale): boolean {
  if (!section.is_active) return true;
  if (localized(section, "body", locale)) return false;
  if (section.type === "equipment") return !localized(section, "title", locale) && parseMedia(section.media).length === 0;
  if (parseMedia(section.media).length > 0) return false;

  switch (section.type) {
    case "arrival": {
      const d = parseSectionData("arrival", section.data);
      return !(d.checkin_from || d.key_handover || d.access_code || localized(d, "parking", locale) || d.video_url);
    }
    case "wifi": {
      const d = parseSectionData("wifi", section.data);
      return !(d.ssid || d.no_wifi);
    }
    case "departure":
      return !parseSectionData("departure", section.data).checkout_time;
    default:
      return true;
  }
}
