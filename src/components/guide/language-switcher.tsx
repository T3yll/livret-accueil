"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

export function LanguageSwitcher() {
  const t = useTranslations("LanguageSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  return (
    <nav aria-label={t("label")} className="flex gap-1 rounded-full bg-stone p-1">
      {routing.locales.map((code: Locale) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            lang={code}
            aria-current={active ? "true" : undefined}
            onClick={() =>
              // @ts-expect-error -- les params de la route courante sont valides pour cette route
              router.replace({ pathname, params }, { locale: code })
            }
            className={`min-h-11 min-w-11 rounded-full px-3 text-sm font-semibold ${
              active ? "bg-primary text-white" : "text-text"
            }`}
          >
            <span aria-hidden="true">{code.toUpperCase()}</span>
            <span className="sr-only">{t(code)}</span>
          </button>
        );
      })}
    </nav>
  );
}
