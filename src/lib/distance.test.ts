import { describe, expect, it } from "vitest";
import { distanceKm, formatDistance } from "./distance";

describe("distanceKm", () => {
  it("Gourdon → Sarlat ≈ 23 km à vol d'oiseau", () => {
    const km = distanceKm({ lat: 44.7372, lng: 1.3833 }, { lat: 44.8901, lng: 1.2166 });
    expect(km).toBeGreaterThan(20);
    expect(km).toBeLessThan(25);
  });

  it("vaut 0 pour un même point", () => {
    expect(distanceKm({ lat: 44.7, lng: 1.4 }, { lat: 44.7, lng: 1.4 })).toBe(0);
  });
});

describe("formatDistance", () => {
  // Le français sépare nombre et unité par une espace insécable : on la normalise pour comparer.
  const fmt = (km: number, locale: string) => formatDistance(km, locale).replace(/\s/g, " ");

  it("mètres sous 1 km, une décimale sous 10 km, entier au-delà", () => {
    expect(fmt(0.83, "fr")).toBe("850 m");
    expect(fmt(4.23, "fr")).toBe("4,2 km");
    expect(fmt(4.23, "en")).toBe("4.2 km");
    expect(fmt(23.4, "fr")).toBe("23 km");
  });
});
