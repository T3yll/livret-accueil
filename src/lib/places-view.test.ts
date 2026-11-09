import { describe, expect, it } from "vitest";
import type { Guide } from "./guide";
import { formatDate, guidePlaces, healthPlaces, isInGroup, PLACE_GROUPS, weekdayName } from "./places-view";

const place = (overrides: Partial<Guide["places"][number]>): Guide["places"][number] => ({
  id: "x",
  name: "Lieu",
  category: "restaurant",
  description_fr: null,
  description_en: null,
  address: null,
  postal_code: null,
  city: null,
  lat: 44.74,
  lng: 1.38,
  phone: null,
  website: null,
  booking_url: null,
  photo_path: null,
  photo_alt_fr: null,
  photo_alt_en: null,
  photo_credit: null,
  delivers: false,
  has_drive: false,
  booking_required: false,
  practical_note_fr: null,
  practical_note_en: null,
  opening_mode: "unknown",
  hours_verified_at: null,
  is_favorite: false,
  comment_fr: null,
  comment_en: null,
  hours: [],
  closures: [],
  ...overrides,
});

const guide = (places: Guide["places"], modules = ["places"]) =>
  ({ property: { lat: 44.7372, lng: 1.3833 }, modules, places, sections: [] }) as unknown as Guide;

describe("guidePlaces", () => {
  it("coups de cœur d'abord, puis du plus proche au plus loin ; sans les adresses santé", () => {
    const result = guidePlaces(
      guide([
        place({ id: "loin", lat: 44.9 }),
        place({ id: "pres", lat: 44.74 }),
        place({ id: "coeur", lat: 45.0, is_favorite: true }),
        place({ id: "pharmacie", category: "health" }),
      ]),
    );
    expect(result.map((p) => p.id)).toEqual(["coeur", "pres", "loin"]);
  });

  it("rien si le module est désactivé, mais les adresses santé restent pour les urgences", () => {
    const g = guide([place({ id: "a" }), place({ id: "h", category: "health" })], []);
    expect(guidePlaces(g)).toEqual([]);
    expect(healthPlaces(g).map((p) => p.id)).toEqual(["h"]);
  });
});

describe("filtres regroupés", () => {
  it("chaque catégorie d'adresse est dans un seul filtre, sauf Santé (section Urgences)", () => {
    const all = Object.values(PLACE_GROUPS).flat();
    expect(new Set(all).size).toBe(all.length);
    expect(all).not.toContain("health");
    expect(isInGroup("hiking", "move")).toBe(true);
    expect(isInGroup("hiking", "eat")).toBe(false);
  });

  it("une pharmacie est dans les adresses et les urgences ; sans module, seulement aux urgences", () => {
    const p = place({ id: "ph", category: "pharmacy" });
    expect(guidePlaces(guide([p])).map((x) => x.id)).toEqual(["ph"]);
    expect(healthPlaces(guide([p])).map((x) => x.id)).toEqual(["ph"]);
    expect(guidePlaces(guide([p], []))).toEqual([]);
    expect(healthPlaces(guide([p], [])).map((x) => x.id)).toEqual(["ph"]);
  });
});

describe("weekdayName / formatDate", () => {
  it("jour ISO 1 = lundi, 7 = dimanche", () => {
    expect(weekdayName(1, "fr")).toBe("lundi");
    expect(weekdayName(4, "en")).toBe("Thursday");
    expect(weekdayName(7, "fr")).toBe("dimanche");
  });

  it("date dans la langue, sans décalage de fuseau", () => {
    expect(formatDate("2026-12-24", "fr")).toBe("24 décembre 2026");
    expect(formatDate("2026-12-24", "en")).toBe("24 December 2026");
  });
});
