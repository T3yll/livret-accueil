"use client";

import { CalendarX } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { localizedWithLang } from "@/lib/localized";
import { parisDay, rangesOn, todayStatus } from "@/lib/opening-hours";
import { formatDate, weekdayName, type GuidePlace } from "@/lib/places-view";
import { useNow } from "@/lib/use-now";
import { OpenBadge } from "./open-badge";

// Tout ce qui dépend de l'heure sur la fiche d'une adresse est recalculé dans le navigateur :
// une fiche ouverte hors connexion le lendemain doit montrer l'état du jour, pas celui du cache.

type Props = { place: GuidePlace; nowIso: string };

export function PlaceTodayStatus({ place, nowIso }: Props) {
  const t = useTranslations("Places");
  const locale = useLocale() as Locale;
  const status = todayStatus(place, useNow(nowIso));

  return (
    <>
      <OpenBadge status={status} label={t(`status.${status.state}`)} />
      {status.state === "open" && <p className="text-sm">{status.ranges.map((r) => `${r.opens}–${r.closes}`).join(", ")}</p>}
      {status.state === "closed" && status.closure && (
        <p className="text-sm text-muted">
          {localizedWithLang(status.closure, "reason", locale)?.text ??
            t("closedFromTo", {
              from: formatDate(status.closure.starts_on, locale),
              to: formatDate(status.closure.ends_on, locale),
            })}
        </p>
      )}
    </>
  );
}

export function PlaceWeek({ place, nowIso }: Props) {
  const t = useTranslations("Places");
  const locale = useLocale() as Locale;
  const today = parisDay(useNow(nowIso));
  const showSchedule = place.opening_mode === "schedule" && place.hours_verified_at && place.hours.length > 0;
  const upcomingClosures = place.closures.filter((c) => c.ends_on >= today.date);

  return (
    <>
      {showSchedule && (
        <section aria-labelledby="hours-title" className="flex flex-col gap-2">
          <h2 id="hours-title" className="text-2xl">
            {t("hours")}
          </h2>
          <table className="w-full overflow-hidden rounded-2xl bg-surface text-left">
            <tbody className="divide-y divide-border">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                const ranges = rangesOn(place, day);
                const isToday = day === today.weekday;
                return (
                  <tr key={day} className={isToday ? "font-semibold" : ""} aria-current={isToday ? "date" : undefined}>
                    <th scope="row" className="px-4 py-2 font-[inherit] first-letter:uppercase">
                      {weekdayName(day, locale)}
                      {isToday && <span className="sr-only"> ({t("today")})</span>}
                    </th>
                    <td className={`px-4 py-2 text-right ${ranges.length === 0 ? "text-muted" : ""}`}>
                      {ranges.length === 0 ? t("closedDay") : ranges.map((r) => `${r.opens}–${r.closes}`).join(", ")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      {upcomingClosures.length > 0 && (
        <ul className="flex flex-col gap-2">
          {upcomingClosures.map((c) => {
            const reason = localizedWithLang(c, "reason", locale);
            return (
              <li key={c.starts_on} className="flex items-start gap-2 text-sm">
                <CalendarX size={18} className="mt-0.5 shrink-0 text-closed" aria-hidden />
                <span>
                  {t("closedFromTo", { from: formatDate(c.starts_on, locale), to: formatDate(c.ends_on, locale) })}
                  {reason && <span lang={reason.lang}> · {reason.text}</span>}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
