import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  // Le QR code pointe sur /g/… ; le proxy redirige vers /fr/g/… ou /en/g/…
  // selon la langue du téléphone, puis retient le choix dans un cookie fonctionnel.
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
