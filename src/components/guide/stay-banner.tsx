"use client";

import { CalendarDays } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import type { Locale } from "@/i18n/routing";
import { formatStayRange } from "@/lib/places-view";
import { useStay } from "@/lib/use-stay";
import { StaySheet } from "./stay-sheet";

// Bandeau discret de l'accueil du livret : les dates du séjour, ou l'invitation à les indiquer.
export function StayBanner({ slug }: { slug: string }) {
  const t = useTranslations("Stay");
  const locale = useLocale() as Locale;
  const { stay, save } = useStay(slug);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          stay
            ? "-mx-2 inline-flex min-h-11 items-center gap-2 self-start rounded-lg px-2 text-left text-sm focus-visible:outline-2 focus-visible:outline-primary"
            : "flex min-h-14 w-full items-center gap-3 rounded-2xl border border-primary/30 bg-surface px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-primary"
        }
      >
        <CalendarDays size={stay ? 18 : 22} className="shrink-0 text-primary" aria-hidden />
        {stay ? (
          <span className="text-sm">
            {t("banner", { range: formatStayRange(stay, locale) })} · <span className="font-semibold text-primary underline underline-offset-2">{t("modify")}</span>
          </span>
        ) : (
          <span className="flex flex-col">
            <span className="font-semibold text-primary">{t("ask")}</span>
            <span className="text-sm text-muted">{t("nudge")}</span>
          </span>
        )}
      </button>
      {open && <StaySheet stay={stay} onSave={save} onClose={() => setOpen(false)} />}
    </>
  );
}
