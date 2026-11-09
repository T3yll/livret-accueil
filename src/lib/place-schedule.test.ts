import { describe, expect, it } from "vitest";
import { closuresSchema, eventsSchema, hoursSchema, weeklyDates } from "./place-schedule";

describe("hoursSchema", () => {
  it("accepte midi et soir le même jour, et 24:00", () => {
    const ok = hoursSchema.safeParse([
      { weekday: 2, opens_at: "12:00", closes_at: "14:00" },
      { weekday: 2, opens_at: "19:00", closes_at: "24:00" },
    ]);
    expect(ok.success).toBe(true);
  });

  it("refuse une fermeture avant l'ouverture", () => {
    expect(hoursSchema.safeParse([{ weekday: 1, opens_at: "14:00", closes_at: "12:00" }]).success).toBe(false);
  });

  it("refuse deux plages qui se chevauchent", () => {
    const result = hoursSchema.safeParse([
      { weekday: 3, opens_at: "10:00", closes_at: "15:00" },
      { weekday: 3, opens_at: "14:00", closes_at: "18:00" },
    ]);
    expect(result.success).toBe(false);
  });

  it("refuse un jour hors 1–7", () => {
    expect(hoursSchema.safeParse([{ weekday: 8, opens_at: "10:00", closes_at: "11:00" }]).success).toBe(false);
  });
});

describe("closuresSchema", () => {
  it("accepte une fermeture d'un seul jour", () => {
    expect(
      closuresSchema.safeParse([{ starts_on: "2026-12-25", ends_on: "2026-12-25", reason_fr: null, reason_en: null }])
        .success,
    ).toBe(true);
  });

  it("refuse une fin avant le début", () => {
    expect(
      closuresSchema.safeParse([{ starts_on: "2027-03-01", ends_on: "2026-11-01", reason_fr: null, reason_en: null }])
        .success,
    ).toBe(false);
  });
});

describe("eventsSchema", () => {
  const base = { starts_on: "2026-12-12", start_time: "", end_time: "", label_fr: " ", label_en: null, booking_url: "" };

  it("transforme les champs vides en null", () => {
    const result = eventsSchema.parse([base]);
    expect(result[0]).toEqual({ starts_on: "2026-12-12", start_time: null, end_time: null, label_fr: null, label_en: null, booking_url: null });
  });

  it("refuse une fin avant le début et un lien sans https", () => {
    expect(eventsSchema.safeParse([{ ...base, start_time: "20:00", end_time: "18:00" }]).success).toBe(false);
    expect(eventsSchema.safeParse([{ ...base, booking_url: "www.exemple.fr" }]).success).toBe(false);
  });
});

describe("weeklyDates", () => {
  it("répète chaque semaine jusqu'à la date incluse", () => {
    expect(weeklyDates("2026-12-03", "2026-12-24")).toEqual(["2026-12-10", "2026-12-17", "2026-12-24"]);
  });

  it("ne renvoie rien si la fin est avant la semaine suivante ou invalide", () => {
    expect(weeklyDates("2026-12-03", "2026-12-09")).toEqual([]);
    expect(weeklyDates("2026-12-03", "")).toEqual([]);
  });

  it("passe le changement d'heure sans décaler le jour", () => {
    expect(weeklyDates("2027-03-25", "2027-04-01")).toEqual(["2027-04-01"]);
  });
});
