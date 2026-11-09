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
  "prepare",
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

// « Préparer mon séjour » : ce qui est fourni, en oui / non (non renseigné = rien n'est affiché).
export const PROVIDED_ITEMS = [
  "sheets",
  "towels",
  "coffee",
  "soap",
  "hairdryer",
  "baby_cot",
  "high_chair",
  "dishcloths",
  "firewood",
] as const;
export type ProvidedItem = (typeof PROVIDED_ITEMS)[number];
const yesNo = z.enum(["yes", "no"]).optional().catch(undefined);

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
  prepare: z.object({
    provided_sheets: yesNo,
    provided_towels: yesNo,
    provided_coffee: yesNo,
    provided_soap: yesNo,
    provided_hairdryer: yesNo,
    provided_baby_cot: yesNo,
    provided_high_chair: yesNo,
    provided_dishcloths: yesNo,
    provided_firewood: yesNo,
    coffee_maker_fr: text,
    coffee_maker_en: text,
    dry_toilets: z.boolean().optional().catch(undefined),
    bring_fr: text,
    bring_en: text,
    station: text,
    station_minutes: z
      .string()
      .regex(/^\d{1,3}$/)
      .optional()
      .catch(undefined),
    taxi_fr: text,
    taxi_en: text,
  }),
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

// Liste de photos reçue d'un formulaire (champ caché JSON).
export function parseMediaJson(value: string): MediaItem[] {
  try {
    return parseMedia(JSON.parse(value));
  } catch {
    return [];
  }
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

// Un texte saisi en français sans son équivalent anglais (signalé dans l'admin).
export function hasMissingTranslation(section: SectionLike): boolean {
  const missing = (fr?: string | null, en?: string | null) => Boolean(fr?.trim()) && !en?.trim();
  if (missing(section.body_fr, section.body_en) || missing(section.title_fr, section.title_en)) return true;
  if (parseMedia(section.media).some((m) => missing(m.alt_fr, m.alt_en))) return true;
  if (section.type === "arrival") {
    const d = parseSectionData("arrival", section.data);
    return missing(d.parking_fr, d.parking_en);
  }
  if (section.type === "prepare") {
    const d = parseSectionData("prepare", section.data);
    return missing(d.bring_fr, d.bring_en) || missing(d.coffee_maker_fr, d.coffee_maker_en) || missing(d.taxi_fr, d.taxi_en);
  }
  return false;
}

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
    case "contacts":
      // Jamais vide : les numéros d'urgence s'affichent toujours.
      return false;
    case "prepare": {
      const d = parseSectionData("prepare", section.data);
      return !(
        PROVIDED_ITEMS.some((item) => d[`provided_${item}`]) ||
        d.dry_toilets ||
        d.station ||
        localized(d, "bring", locale) ||
        localized(d, "taxi", locale)
      );
    }
    default:
      return true;
  }
}
