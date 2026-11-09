import { describe, expect, it } from "vitest";
import { parseRichText } from "./rich-text";
import { hasMissingTranslation, isSectionEmpty, parseSectionData, type SectionLike } from "./sections";

const section = (overrides: Partial<SectionLike>): SectionLike => ({
  type: "house",
  title_fr: null,
  title_en: null,
  body_fr: null,
  body_en: null,
  data: {},
  media: [],
  is_active: true,
  ...overrides,
});

describe("isSectionEmpty", () => {
  it("une section créée par défaut est vide", () => {
    for (const type of ["arrival", "wifi", "house", "departure", "practical"] as const) {
      expect(isSectionEmpty(section({ type }), "fr")).toBe(true);
    }
  });

  it("Contacts n'est jamais vide (numéros d'urgence), sauf désactivée", () => {
    expect(isSectionEmpty(section({ type: "contacts" }), "fr")).toBe(false);
    expect(isSectionEmpty(section({ type: "contacts", is_active: false }), "fr")).toBe(true);
  });

  it("un texte suffit à la rendre visible, et le FR sert de repli en anglais", () => {
    const s = section({ body_fr: "Présentation du gîte" });
    expect(isSectionEmpty(s, "fr")).toBe(false);
    expect(isSectionEmpty(s, "en")).toBe(false);
  });

  it("des espaces ne comptent pas comme du contenu", () => {
    expect(isSectionEmpty(section({ body_fr: "   \n " }), "fr")).toBe(true);
  });

  it("une section désactivée est masquée même remplie", () => {
    expect(isSectionEmpty(section({ body_fr: "Texte", is_active: false }), "fr")).toBe(true);
  });

  it("Wi-Fi : visible avec un nom de réseau ou « pas de Wi-Fi »", () => {
    expect(isSectionEmpty(section({ type: "wifi", data: { ssid: "Gite" } }), "fr")).toBe(false);
    expect(isSectionEmpty(section({ type: "wifi", data: { no_wifi: true } }), "fr")).toBe(false);
    expect(isSectionEmpty(section({ type: "wifi", data: { password: "seul" } }), "fr")).toBe(true);
  });

  it("Arrivée : visible avec une heure d'arrivée", () => {
    expect(isSectionEmpty(section({ type: "arrival", data: { checkin_from: "16:00" } }), "fr")).toBe(false);
  });

  it("Départ : visible avec une heure de départ", () => {
    expect(isSectionEmpty(section({ type: "departure", data: { checkout_time: "10:00" } }), "fr")).toBe(false);
  });

  it("Équipement : visible avec un nom ou une photo", () => {
    expect(isSectionEmpty(section({ type: "equipment", title_fr: "Poêle à bois" }), "fr")).toBe(false);
    expect(isSectionEmpty(section({ type: "equipment", media: [{ path: "a.webp" }] }), "fr")).toBe(false);
  });
});

describe("Préparer mon séjour", () => {
  const prepare = (data: Record<string, string>) => section({ type: "prepare", data });

  it("vide par défaut, visible dès qu'un élément est renseigné", () => {
    expect(isSectionEmpty(prepare({}), "fr")).toBe(true);
    expect(isSectionEmpty(prepare({ provided_towels: "no" }), "fr")).toBe(false);
    expect(isSectionEmpty(prepare({ station: "Gourdon" }), "fr")).toBe(false);
  });

  it("la liste « à ne pas oublier » en français sert de repli en anglais", () => {
    expect(isSectionEmpty(prepare({ bring_fr: "Un pull" }), "en")).toBe(false);
  });

  it("ignore une valeur inconnue et un temps de trajet mal saisi", () => {
    const d = parseSectionData("prepare", { provided_sheets: "peut-être", station_minutes: "dix" });
    expect(d.provided_sheets).toBeUndefined();
    expect(d.station_minutes).toBeUndefined();
  });

  it("signale une traduction manquante", () => {
    expect(hasMissingTranslation(prepare({ bring_fr: "Un pull" }))).toBe(true);
    expect(hasMissingTranslation(prepare({ bring_fr: "Un pull", bring_en: "A jumper" }))).toBe(false);
  });
});

describe("parseSectionData", () => {
  it("ignore les champs mal formés sans casser le reste", () => {
    const d = parseSectionData("arrival", { checkin_from: "25:00", key_handover: "drone", access_code: "1234" });
    expect(d).toEqual({ checkin_from: undefined, key_handover: undefined, access_code: "1234" });
  });

  it("refuse une vidéo en http (non chiffré)", () => {
    expect(parseSectionData("arrival", { video_url: "http://exemple.fr/v" }).video_url).toBeUndefined();
    expect(parseSectionData("arrival", { video_url: "https://youtu.be/abc" }).video_url).toBe("https://youtu.be/abc");
  });

  it("résiste à des données nulles", () => {
    expect(parseSectionData("wifi", null)).toEqual({});
  });
});

describe("parseRichText", () => {
  it("sépare paragraphes et listes", () => {
    expect(parseRichText("Bienvenue.\nBon séjour.\n\n- Poubelles\n- Clés\nMerci")).toEqual([
      { kind: "paragraph", lines: ["Bienvenue.", "Bon séjour."] },
      { kind: "list", items: ["Poubelles", "Clés"] },
      { kind: "paragraph", lines: ["Merci"] },
    ]);
  });

  it("ignore les lignes vides en trop", () => {
    expect(parseRichText("\n\nA\n\n\n\nB\n")).toEqual([
      { kind: "paragraph", lines: ["A"] },
      { kind: "paragraph", lines: ["B"] },
    ]);
  });
});
