import { ChevronLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./language-switcher";

// En-tête des pages de section : retour à l'accueil du livret + langue.
export async function GuideHeader({ slug }: { slug: string }) {
  const t = await getTranslations("Guide");
  return (
    <header className="flex items-center justify-between gap-4">
      <Link
        href={`/g/${slug}`}
        className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-[15px] font-semibold text-primary focus-visible:outline-2 focus-visible:outline-primary"
      >
        <ChevronLeft size={20} aria-hidden />
        {t("back")}
      </Link>
      <LanguageSwitcher />
    </header>
  );
}

export function DraftNotice({ label }: { label: string }) {
  return (
    <p role="status" className="rounded-xl bg-stone px-4 py-3 text-sm text-info">
      {label}
    </p>
  );
}
