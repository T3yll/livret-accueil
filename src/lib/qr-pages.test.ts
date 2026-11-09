import { describe, expect, it } from "vitest";
import { parseQrPage } from "./qr-pages";

describe("parseQrPage", () => {
  it("accepte la carte et les sections du livret", () => {
    expect(parseQrPage("places")).toBe("places");
    expect(parseQrPage("wifi")).toBe("wifi");
    expect(parseQrPage("prepare")).toBe("prepare");
  });

  it("retombe sur l'accueil pour toute autre valeur", () => {
    expect(parseQrPage(undefined)).toBeNull();
    expect(parseQrPage("../admin")).toBeNull();
    expect(parseQrPage(["places"])).toBeNull();
  });
});
