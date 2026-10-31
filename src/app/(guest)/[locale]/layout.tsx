import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { brand } from "@/config/brand";
import { routing } from "@/i18n/routing";
import { fontVariables } from "../../fonts";
import "../../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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
        <NextIntlClientProvider messages={{ LanguageSwitcher: messages.LanguageSwitcher }}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
