import { getTranslations, setRequestLocale } from "next-intl/server";
import { brand } from "@/config/brand";
import { Emblem } from "@/components/guide/emblem";
import { LanguageSwitcher } from "@/components/guide/language-switcher";

// Accueil du domaine : rien de privé ici, on invite simplement à scanner le QR code.
export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");

  return (
    <main className="mx-auto flex min-h-dvh max-w-[640px] flex-col items-center justify-center gap-6 px-6 text-center">
      <Emblem size={72} />
      <p className="text-sm tracking-[0.2em] text-muted uppercase">{brand.name}</p>
      <h1 className="text-[32px]">{t("title")}</h1>
      <p className="text-muted">{t("scanPrompt")}</p>
      <LanguageSwitcher />
    </main>
  );
}
