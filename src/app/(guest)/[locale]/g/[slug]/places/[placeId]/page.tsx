import { CalendarX, ChevronLeft, ExternalLink, Globe, Heart, Phone } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { DraftNotice } from "@/components/guide/guide-header";
import { LanguageSwitcher } from "@/components/guide/language-switcher";
import { OpenBadge } from "@/components/guide/open-badge";
import { CATEGORY_ICONS } from "@/components/guide/place-icons";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { formatDistance } from "@/lib/distance";
import { getGuide } from "@/lib/guide";
import { directionsLinks, mediaUrl } from "@/lib/guide-view";
import { localizedWithLang } from "@/lib/localized";
import { parisDay, rangesOn, todayStatus } from "@/lib/opening-hours";
import { formatDate, guidePlaces, weekdayName } from "@/lib/places-view";
import { RichText } from "@/lib/rich-text";

type Props = PageProps<"/[locale]/g/[slug]/places/[placeId]">;

async function findPlace(slug: string, placeId: string) {
  const guide = await getGuide(slug);
  const place = guide ? guidePlaces(guide).find((p) => p.id === placeId) : undefined;
  return guide && place ? { guide, place } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, placeId } = await params;
  const found = await findPlace(slug, placeId);
  return { title: found?.place.name, robots: { index: false, follow: false } };
}

const actionLink =
  "flex min-h-12 items-center gap-3 rounded-xl border border-border bg-surface px-4 font-semibold hover:bg-stone focus-visible:outline-2 focus-visible:outline-primary";

export default async function PlacePage({ params }: Props) {
  const { locale: rawLocale, slug, placeId } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);

  const found = await findPlace(slug, placeId);
  if (!found) notFound();
  const { guide, place } = found;

  const [t, tGuide] = await Promise.all([getTranslations("Places"), getTranslations("Guide")]);
  const now = new Date();
  const status = todayStatus(place, now);
  const today = parisDay(now);
  const Icon = CATEGORY_ICONS[place.category];
  const description = localizedWithLang(place, "description", locale);
  const comment = localizedWithLang(place, "comment", locale);
  const photoAlt = localizedWithLang(place, "photo_alt", locale);
  const address = [place.address, [place.postal_code, place.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const showSchedule = place.opening_mode === "schedule" && place.hours_verified_at && place.hours.length > 0;
  const upcomingClosures = place.closures.filter((c) => c.ends_on >= today.date);

  return (
    <main className="mx-auto flex min-h-dvh max-w-[640px] flex-col gap-6 pb-12">
      <div className="relative">
        {place.photo_path && (
          <Image
            src={mediaUrl(place.photo_path)}
            alt={photoAlt?.text ?? ""}
            width={1280}
            height={853}
            priority
            sizes="(max-width: 640px) 100vw, 640px"
            className="aspect-[4/3] w-full object-cover sm:rounded-b-3xl"
          />
        )}
        <div
          className={`flex items-center justify-between gap-4 px-4 pt-2 ${place.photo_path ? "absolute inset-x-0 top-0" : ""}`}
        >
          <Link
            href={`/g/${slug}/places`}
            className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-lg bg-background/90 px-2 text-[15px] font-semibold text-primary focus-visible:outline-2 focus-visible:outline-primary"
          >
            <ChevronLeft size={20} aria-hidden />
            {t("back")}
          </Link>
          <LanguageSwitcher />
        </div>
      </div>

      <div className="flex flex-col gap-6 px-4">
        {guide.property.status === "draft" && <DraftNotice label={tGuide("draftNotice")} />}

        <header className="flex flex-col gap-2">
          <p className="flex items-center gap-2 text-sm text-muted">
            <Icon size={18} strokeWidth={1.75} className="text-primary" aria-hidden />
            {t(`category.${place.category}`)}
            {place.km !== null && ` · ${formatDistance(place.km, locale)}`}
          </p>
          <h1 className="text-[28px] leading-tight font-semibold">{place.name}</h1>
          <OpenBadge status={status} label={t(`status.${status.state}`)} />
          {status.state === "open" && (
            <p className="text-sm">
              {status.ranges.map((r) => `${r.opens}–${r.closes}`).join(", ")}
            </p>
          )}
          {status.state === "closed" && status.closure && (
            <p className="text-sm text-muted">
              {localizedWithLang(status.closure, "reason", locale)?.text ??
                t("closedFromTo", {
                  from: formatDate(status.closure.starts_on, locale),
                  to: formatDate(status.closure.ends_on, locale),
                })}
            </p>
          )}
        </header>

        {place.is_favorite && (
          <section aria-labelledby="host-word" className="flex flex-col gap-2 rounded-2xl bg-favorite-bg p-4">
            <h2 id="host-word" className="flex items-center gap-2 font-sans text-base font-semibold text-favorite">
              <Heart size={18} fill="currentColor" aria-hidden />
              {comment ? t("hostWord") : t("favorite")}
            </h2>
            {comment && (
              <blockquote lang={comment.lang} className="font-heading text-xl italic">
                « {comment.text} »
              </blockquote>
            )}
          </section>
        )}

        {description && <RichText text={description.text} lang={description.lang} />}

        <div className="flex flex-col gap-2">
          {place.phone && (
            <a href={`tel:${place.phone.replace(/\s/g, "")}`} className={actionLink}>
              <Phone size={20} className="text-primary" aria-hidden />
              <span>
                <span className="block text-sm font-normal text-muted">{t("call")}</span>
                {place.phone}
              </span>
            </a>
          )}
          {place.booking_url && (
            <a href={place.booking_url} target="_blank" rel="noopener noreferrer" className={actionLink}>
              <ExternalLink size={20} className="text-primary" aria-hidden />
              {t("book")}
            </a>
          )}
          {place.website && (
            <a href={place.website} target="_blank" rel="noopener noreferrer" className={actionLink}>
              <Globe size={20} className="text-primary" aria-hidden />
              {t("website")}
            </a>
          )}
        </div>

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

        {place.hours_verified_at && (
          <p className="text-sm text-muted">{t("verifiedOn", { date: formatDate(place.hours_verified_at, locale) })}</p>
        )}

        <section aria-labelledby="place-directions" className="flex flex-col gap-3">
          <h2 id="place-directions" className="text-2xl">
            {tGuide("directions")}
          </h2>
          {address && <p>{address}</p>}
          <ul className="flex flex-col gap-2">
            {directionsLinks(place.lat, place.lng, locale).map((link) => (
              <li key={link.app}>
                <a href={link.href} target="_blank" rel="noopener noreferrer" className={actionLink}>
                  <span className="sr-only">{tGuide("openIn", { app: link.app })}</span>
                  <span aria-hidden>{link.app}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
