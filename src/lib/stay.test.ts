import { describe, expect, it } from "vitest";
import { stayStatus, type PlaceHours } from "./opening-hours";
import { parseStay, stayDates, weekdayOf } from "./stay";

const TODAY = "2026-12-01";

describe("parseStay", () => {
  it("accepte un séjour valable, y compris d'un seul jour", () => {
    expect(parseStay("2026-12-12", "2026-12-15", TODAY)).toEqual({ from: "2026-12-12", to: "2026-12-15" });
    expect(parseStay("2026-12-12", "2026-12-12", TODAY)).toEqual({ from: "2026-12-12", to: "2026-12-12" });
  });

  it("garde un séjour en cours, commencé avant aujourd'hui", () => {
    expect(parseStay("2026-11-28", "2026-12-03", TODAY)).not.toBeNull();
  });

  it.each([
    ["départ avant l'arrivée", "2026-12-15", "2026-12-12"],
    ["séjour terminé", "2026-11-20", "2026-11-25"],
    ["date impossible", "2026-02-31", "2026-03-02"],
    ["format invalide", "12/12/2026", "15/12/2026"],
    ["paramètre absent", null, "2026-12-15"],
    ["séjour trop long", "2026-12-01", "2027-03-01"],
  ])("ignore : %s", (_, from, to) => {
    expect(parseStay(from, to, TODAY)).toBeNull();
  });
});

describe("stayDates / weekdayOf", () => {
  it("liste tous les jours, même au passage à l'heure d'hiver", () => {
    expect(stayDates({ from: "2026-10-24", to: "2026-10-26" })).toEqual(["2026-10-24", "2026-10-25", "2026-10-26"]);
  });

  it("jour ISO : 1 = lundi, 7 = dimanche", () => {
    expect(weekdayOf("2026-12-14")).toBe(1);
    expect(weekdayOf("2026-12-13")).toBe(7);
  });
});

// Du samedi 12 au mardi 15 décembre 2026.
const STAY = { from: "2026-12-12", to: "2026-12-15" };

const verified = (weekdays: number[], extra: Partial<PlaceHours> = {}): PlaceHours => ({
  opening_mode: "schedule",
  hours_verified_at: "2026-11-01",
  hours: weekdays.map((weekday) => ({ weekday, opens_at: "10:00:00", closes_at: "18:00:00" })),
  closures: [],
  ...extra,
});

const closure = (starts_on: string, ends_on: string) => ({ starts_on, ends_on, reason_fr: null, reason_en: null });

describe("stayStatus", () => {
  it("donne les jours d'ouverture pendant le séjour", () => {
    expect(stayStatus(verified([2, 6]), STAY)).toEqual({ state: "open", days: ["2026-12-12", "2026-12-15"], allDays: false });
  });

  it("signale un lieu ouvert tous les jours du séjour", () => {
    expect(stayStatus(verified([1, 2, 3, 4, 5, 6, 7]), STAY)).toMatchObject({ state: "open", allDays: true });
  });

  it("fermé si aucun jour d'ouverture ne tombe pendant le séjour", () => {
    expect(stayStatus(verified([3, 4]), STAY)).toEqual({ state: "closed" });
  });

  it("une fermeture saisie retire les jours concernés", () => {
    const place = verified([1, 2, 3, 4, 5, 6, 7], { closures: [closure("2026-12-14", "2026-12-20")] });
    expect(stayStatus(place, STAY)).toEqual({ state: "open", days: ["2026-12-12", "2026-12-13"], allDays: false });
  });

  it("une fermeture hivernale couvrant tout le séjour masque le lieu, même sans horaires vérifiés", () => {
    const place: PlaceHours = { opening_mode: "unknown", hours_verified_at: null, hours: [], closures: [closure("2026-11-15", "2027-03-31")] };
    expect(stayStatus(place, STAY)).toEqual({ state: "closed" });
  });

  it("jamais présenté comme ouvert sans horaires vérifiés", () => {
    expect(stayStatus({ ...verified([6]), hours_verified_at: null }, STAY)).toEqual({ state: "unknown" });
    expect(stayStatus({ opening_mode: "unknown", hours_verified_at: null, hours: [], closures: [] }, STAY)).toEqual({ state: "unknown" });
  });

  it("accès libre et sur rendez-vous restent disponibles", () => {
    expect(stayStatus({ opening_mode: "always", hours_verified_at: null, hours: [], closures: [] }, STAY)).toEqual({ state: "always" });
    expect(stayStatus({ opening_mode: "appointment", hours_verified_at: null, hours: [], closures: [] }, STAY)).toEqual({ state: "appointment" });
  });
});
