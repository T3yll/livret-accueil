import { describe, expect, it } from "vitest";
import { localized, localizedWithLang } from "./localized";

describe("localized", () => {
  it("prend l'anglais s'il existe, sinon le français", () => {
    expect(localized({ body_fr: "Bonjour", body_en: "Hello" }, "body", "en")).toBe("Hello");
    expect(localized({ body_fr: "Bonjour", body_en: " " }, "body", "en")).toBe("Bonjour");
    expect(localized({ body_fr: null, body_en: "Hello" }, "body", "fr")).toBeNull();
  });
});

describe("localizedWithLang", () => {
  it("signale un repli français sur une page anglaise", () => {
    expect(localizedWithLang({ body_fr: "Bonjour", body_en: null }, "body", "en")).toEqual({ text: "Bonjour", lang: "fr" });
    expect(localizedWithLang({ body_fr: "Bonjour", body_en: "Hello" }, "body", "en")).toEqual({ text: "Hello", lang: "en" });
    expect(localizedWithLang({ body_fr: "Bonjour" }, "body", "fr")).toEqual({ text: "Bonjour", lang: "fr" });
    expect(localizedWithLang({}, "body", "en")).toBeNull();
  });
});
