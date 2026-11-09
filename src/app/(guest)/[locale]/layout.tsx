import type { Metadata, Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { brand, brandColors } from "@/config/brand";
import { routing } from "@/i18n/routing";
import { fontVariables } from "../../fonts";
import "../../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Couleur de la barre du navigateur et de l'appli installée : le fond ivoire du livret.
// viewportFit « cover » : la page peut s'étendre sous les barres du téléphone (carte plein écran).
export const viewport: Viewport = { themeColor: brandColors.background, viewportFit: "cover" };

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: { default: `${brand.productName} · ${brand.name}`, template: `%s · ${brand.name}` },
    description: t("description"),
  };
}

export default async function GuestLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full">
        {/* Seuls les textes des composants navigateur sont envoyés au client (pages légères). */}
        <NextIntlClientProvider messages={{ LanguageSwitcher: messages.LanguageSwitcher, Places: messages.Places, Offline: messages.Offline, Stay: messages.Stay, Welcome: messages.Welcome }}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
