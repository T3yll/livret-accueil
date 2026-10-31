import { describe, expect, it } from "vitest";
import { closuresSchema, hoursSchema } from "./place-schedule";

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
