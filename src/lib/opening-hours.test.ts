import { describe, expect, it } from "vitest";
import { isOpenToday, parisDay, todayStatus, type PlaceHours } from "./opening-hours";

// Restaurant ouvert du mardi au samedi, midi et soir ; fermé dimanche et lundi.
const restaurant: PlaceHours = {
  opening_mode: "schedule",
  hours_verified_at: "2026-10-15",
  hours: [2, 3, 4, 5, 6].flatMap((weekday) => [
    { weekday, opens_at: "12:00:00", closes_at: "14:00:00" },
    { weekday, opens_at: "19:00:00", closes_at: "22:00:00" },
  ]),
  closures: [{ starts_on: "2026-12-24", ends_on: "2027-01-05", reason_fr: "Congés", reason_en: "Holidays" }],
};

// Instants donnés en UTC ; Paris = UTC+1 en hiver, UTC+2 en été.
const at = (iso: string) => new Date(iso);

describe("parisDay", () => {
  it("donne la date de Paris, pas celle d'UTC (minuit passé à Paris, pas encore en UTC)", () => {
    // 23:30 UTC le samedi 31 octobre = 00:30 le dimanche 1er novembre à Paris (heure d'hiver)
    expect(parisDay(at("2026-10-31T23:30:00Z"))).toEqual({ date: "2026-11-01", weekday: 7 });
  });

  it("suit le passage à l'heure d'été", () => {
    // 22:30 UTC le samedi 28 mars 2026 = 23:30 à Paris, toujours samedi
    expect(parisDay(at("2026-03-28T22:30:00Z"))).toEqual({ date: "2026-03-28", weekday: 6 });
    // 22:30 UTC le dimanche 29 mars 2026 = 00:30 lundi à Paris (heure d'été, UTC+2)
    expect(parisDay(at("2026-03-29T22:30:00Z"))).toEqual({ date: "2026-03-30", weekday: 1 });
  });
});

describe("todayStatus", () => {
  it("mardi : ouvert, avec les deux plages dans l'ordre", () => {
    expect(todayStatus(restaurant, at("2026-11-03T10:00:00Z"))).toEqual({
      state: "open",
      ranges: [
        { opens: "12:00", closes: "14:00" },
        { opens: "19:00", closes: "22:00" },
      ],
    });
  });

  it("lundi : fermé (jour sans plage)", () => {
    expect(todayStatus(restaurant, at("2026-11-02T10:00:00Z"))).toEqual({ state: "closed", closure: null });
  });

  it("pendant une fermeture : fermé, avec le motif, même un jour d'ouverture", () => {
    const status = todayStatus(restaurant, at("2026-12-29T11:00:00Z")); // un mardi
    expect(status.state).toBe("closed");
    expect(status.state === "closed" && status.closure?.reason_fr).toBe("Congés");
  });

  it("le dernier jour de fermeture est inclus, le lendemain rouvre", () => {
    expect(todayStatus(restaurant, at("2027-01-05T11:00:00Z")).state).toBe("closed"); // mardi
    expect(todayStatus(restaurant, at("2027-01-06T11:00:00Z")).state).toBe("open"); // mercredi
  });

  it("horaires jamais vérifiés : à vérifier, jamais une supposition", () => {
    const status = todayStatus({ ...restaurant, hours_verified_at: null }, at("2026-11-03T10:00:00Z"));
    expect(status).toEqual({ state: "unknown" });
  });

  it("mode horaires sans aucune plage saisie : à vérifier", () => {
    expect(todayStatus({ ...restaurant, hours: [] }, at("2026-11-03T10:00:00Z"))).toEqual({ state: "unknown" });
  });

  it("modes accès libre, sur rendez-vous, inconnu", () => {
    const base = { hours_verified_at: null, hours: [], closures: [] };
    const now = at("2026-11-03T10:00:00Z");
    expect(todayStatus({ ...base, opening_mode: "always" }, now)).toEqual({ state: "always" });
    expect(todayStatus({ ...base, opening_mode: "appointment" }, now)).toEqual({ state: "appointment" });
    expect(todayStatus({ ...base, opening_mode: "unknown" }, now)).toEqual({ state: "unknown" });
  });

  it("une fermeture l'emporte aussi sur l'accès libre", () => {
    const site: PlaceHours = {
      opening_mode: "always",
      hours_verified_at: null,
      hours: [],
      closures: [{ starts_on: "2026-11-01", ends_on: "2027-03-31", reason_fr: "Fermé l'hiver", reason_en: null }],
    };
    expect(todayStatus(site, at("2026-12-01T10:00:00Z")).state).toBe("closed");
  });

  it("à 00:30 le dimanche à Paris, c'est dimanche qui compte (fermé), pas samedi", () => {
    expect(todayStatus(restaurant, at("2026-10-31T23:30:00Z")).state).toBe("closed");
  });
});

describe("isOpenToday", () => {
  it("retient l'ouvert et l'accès libre seulement", () => {
    expect(isOpenToday({ state: "open", ranges: [] })).toBe(true);
    expect(isOpenToday({ state: "always" })).toBe(true);
    expect(isOpenToday({ state: "closed", closure: null })).toBe(false);
    expect(isOpenToday({ state: "unknown" })).toBe(false);
    expect(isOpenToday({ state: "appointment" })).toBe(false);
  });
});
