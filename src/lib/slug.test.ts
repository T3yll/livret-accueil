import { describe, expect, it } from "vitest";
import { generateSlug, randomToken, SLUG_PATTERN, slugifyName } from "./slug";

describe("slugifyName", () => {
  it("retire les accents et la ponctuation", () => {
    expect(slugifyName("Le Moulin de l'Ouysse — Gîte")).toBe("le-moulin-de-l-ouysse-gite");
  });

  it("coupe les noms trop longs sans laisser de tiret final", () => {
    const slug = slugifyName("Domaine des cabanes perchées de la vallée de la Dordogne");
    expect(slug.length).toBeLessThanOrEqual(40);
    expect(slug.endsWith("-")).toBe(false);
  });
});

describe("generateSlug", () => {
  it("respecte la contrainte de la base", () => {
    for (const name of ["Gîte des Chênes", "!!!", "", "Cabane n°3"]) {
      expect(generateSlug(name)).toMatch(SLUG_PATTERN);
    }
  });

  it("produit des préfixes différents à chaque appel", () => {
    const tokens = new Set(Array.from({ length: 1000 }, () => randomToken()));
    expect(tokens.size).toBe(1000);
  });
});
