import { describe, expect, it } from "vitest";
import { withEnglishFallback } from "./accept-language";

describe("withEnglishFallback", () => {
  it("garde l'en-tête quand le français ou l'anglais y figure", () => {
    expect(withEnglishFallback("fr-FR,fr;q=0.9")).toBe("fr-FR,fr;q=0.9");
    expect(withEnglishFallback("en-GB,en;q=0.9")).toBe("en-GB,en;q=0.9");
    expect(withEnglishFallback("de-DE,de;q=0.9,fr;q=0.8")).toBe("de-DE,de;q=0.9,fr;q=0.8");
  });

  it("passe en anglais un téléphone ni français ni anglais", () => {
    expect(withEnglishFallback("nl-NL,nl;q=0.9")).toBe("en");
    expect(withEnglishFallback("de")).toBe("en");
  });

  it("ne touche pas à un en-tête absent", () => {
    expect(withEnglishFallback(null)).toBeNull();
    expect(withEnglishFallback("")).toBe("");
  });
});
