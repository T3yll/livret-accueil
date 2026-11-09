import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { GuideHeader } from "@/components/guide/guide-header";
import { brand } from "@/config/brand";
import { getGuide } from "@/lib/guide";

type Props = PageProps<"/[locale]/g/[slug]/informations">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Legal" });
  return { title: t("title"), robots: { index: false, follow: false } };
}

// Mentions légales et confidentialité, dans le livret : enregistrées pour le hors connexion comme le reste.
export default async function LegalPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  if (!(await getGuide(slug))) notFound();

  const t = await getTranslations("Legal");
  const blocks = [
    { title: t("publisherTitle"), text: t("publisher", { product: brand.name, email: brand.contactEmail }) },
    { title: t("hostingTitle"), text: t("hosting") },
    { title: t("privacyTitle"), text: t("privacy") },
    { title: t("storageTitle"), text: t("storage") },
    { title: t("thirdPartiesTitle"), text: t("thirdParties") },
    { title: t("rightsTitle"), text: t("rights", { email: brand.contactEmail }) },
    { title: t("creditsTitle"), text: t("credits") },
  ];

  return (
    <main className="mx-auto flex min-h-dvh max-w-[640px] flex-col gap-6 px-4 pt-2 pb-12">
      <GuideHeader slug={slug} />
      <div className="flex flex-col gap-2">
        <div aria-hidden className="h-px w-12 bg-accent" />
        <h1 className="text-[28px] leading-tight">{t("title")}</h1>
      </div>
      {blocks.map((block) => (
        <section key={block.title} className="flex flex-col gap-1">
          <h2 className="font-sans text-base font-semibold">{block.title}</h2>
          <p className="text-[15px] whitespace-pre-line">{block.text}</p>
        </section>
      ))}
    </main>
  );
}
