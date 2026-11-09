"use client";

import { CalendarDays } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useId } from "react";
import type { Locale } from "@/i18n/routing";
import { intlLocale } from "@/lib/places-view";

type Props = { label: string; value: string; min?: string; onChange: (value: string) => void };

// Champ de date aux couleurs du livret. Le champ natif reste en dessous, transparent : on touche la case
// et le téléphone ouvre son propre calendrier. Sur iPhone, un champ date natif vide n'affiche rien et
// refuse de rétrécir : d'où cette case qui écrit la date en clair (« sam. 12 déc. ») ou « Choisir ».
export function DateField({ label, value, min, onChange }: Props) {
  const t = useTranslations("Stay");
  const locale = useLocale() as Locale;
  const id = useId();
  const shown = value
    ? new Intl.DateTimeFormat(intlLocale(locale), { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(
        new Date(`${value}T00:00:00Z`),
      )
    : t("pick");

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <div className="relative flex min-h-12 min-w-0 items-center gap-2 rounded-xl border border-border bg-surface px-3 focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-primary">
        <CalendarDays size={18} className="shrink-0 text-primary" aria-hidden />
        <span aria-hidden className={`truncate ${value ? "font-semibold" : "text-muted"}`}>
          {shown}
        </span>
        <input
          id={id}
          type="date"
          value={value}
          min={min}
          onChange={(e) => onChange(e.target.value)}
          // Ordinateur : ouvre le calendrier au clic, pas seulement sur la petite icône.
          onClick={(e) => e.currentTarget.showPicker?.()}
          className="absolute inset-0 size-full min-w-0 cursor-pointer appearance-none opacity-0"
        />
      </div>
    </div>
  );
}
