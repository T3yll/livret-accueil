import { describe, expect, it } from "vitest";
import type { Guide } from "./guide";
import { experiencesDuring, formatDate, formatEventDate, formatEventTime, formatStayDays, formatStayRange, guidePlaces, healthPlaces, isInGroup, PLACE_GROUPS, weekdayName } from "./places-view";

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
  is_experience: false,
  hike_duration_min: null,
  hike_distance_km: null,
  hike_difficulty: null,
  trail_url: null,
  events: [],
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

describe("affichage du séjour", () => {
  it("dates du séjour, sur un ou deux mois", () => {
    expect(formatStayRange({ from: "2026-12-12", to: "2026-12-15" }, "fr")).toBe("12 → 15 déc.");
    expect(formatStayRange({ from: "2026-12-28", to: "2027-01-02" }, "fr")).toBe("28 déc. → 2 janv.");
    expect(formatStayRange({ from: "2026-12-12", to: "2026-12-15" }, "en")).toBe("12 → 15 Dec");
  });

  it("jours d'ouverture, sans répéter un jour de la semaine", () => {
    expect(formatStayDays(["2026-12-12", "2026-12-15"], "fr")).toBe("sam. et mar.");
    expect(formatStayDays(["2026-12-12", "2026-12-19"], "fr")).toBe("sam.");
    expect(formatStayDays(["2026-12-12", "2026-12-15"], "en")).toBe("Sat and Tue");
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

describe("experiencesDuring", () => {
  const ev = (starts_on: string, start_time: string | null = null) => ({
    id: starts_on + start_time, starts_on, start_time, end_time: null, label_fr: null, label_en: null, booking_url: null,
  });
  const withKm = (p: Guide["places"][number]) => ({ ...p, km: null });
  const stay = { from: "2026-12-12", to: "2026-12-15" };

  it("garde les dates du séjour, bornes comprises, triées par date et heure", () => {
    const a = withKm(place({ id: "a", is_experience: true, events: [ev("2026-12-11"), ev("2026-12-15", "20:00:00")] }));
    const b = withKm(place({ id: "b", is_experience: true, events: [ev("2026-12-12"), ev("2026-12-15", "18:00:00"), ev("2026-12-16")] }));
    const result = experiencesDuring([a, b], stay).map((x) => `${x.place.id} ${x.event.starts_on} ${x.event.start_time ?? ""}`);
    expect(result).toEqual(["b 2026-12-12 ", "b 2026-12-15 18:00:00", "a 2026-12-15 20:00:00"]);
  });

  it("ignore les adresses qui ne sont pas des expériences et les dates de fermeture", () => {
    const notExp = withKm(place({ events: [ev("2026-12-13")] }));
    const closed = withKm(
      place({
        is_experience: true,
        events: [ev("2026-12-13"), ev("2026-12-14")],
        closures: [{ starts_on: "2026-12-13", ends_on: "2026-12-13", reason_fr: null, reason_en: null }],
      }),
    );
    expect(experiencesDuring([notExp, closed], stay).map((x) => x.event.starts_on)).toEqual(["2026-12-14"]);
  });
});

describe("formatEventDate / formatEventTime", () => {
  it("formate dans la langue du livret", () => {
    expect(formatEventDate("2026-12-12", "fr")).toBe("sam. 12 déc.");
    expect(formatEventDate("2026-12-12", "en")).toBe("Sat 12 Dec");
    expect(formatEventTime("20:30:00", "fr")).toBe("20:30");
    expect(formatEventTime("20:30:00", "en")).toBe("20:30"); // en-GB : format 24 h
  });
});
