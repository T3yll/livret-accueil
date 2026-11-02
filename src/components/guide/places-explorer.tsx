"use client";

import { Heart, List, Map as MapIcon, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { formatDistance } from "@/lib/distance";
import { mediaUrl } from "@/lib/guide-view";
import { localized } from "@/lib/localized";
import { isOpenToday, rangesOn, todayStatus } from "@/lib/opening-hours";
import { GUIDE_CATEGORIES, weekdayName, type PlaceCategory, type PlaceWithDistance } from "@/lib/places-view";
import { useNow } from "@/lib/use-now";
import { OpenBadge } from "./open-badge";
import { CATEGORY_ICONS } from "./place-icons";

// La carte (Leaflet) n'est chargée que si le voyageur l'ouvre : pages légères sur réseau faible.
const PlacesMap = dynamic(() => import("./places-map"), { ssr: false });

type Props = {
  slug: string;
  places: PlaceWithDistance[];
  origin: { lat: number; lng: number } | null;
  nowIso: string; // heure du serveur au rendu : même résultat au premier affichage côté navigateur
};

const chip =
  "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-4 text-[15px] font-semibold " +
  "focus-visible:outline-2 focus-visible:outline-primary aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-white";

export function PlacesExplorer({ slug, places, origin, nowIso }: Props) {
  const t = useTranslations("Places");
  const locale = useLocale() as Locale;
  // L'état « ouvert aujourd'hui » suit l'heure réelle (minuit passé, page venue du cache…).
  const now = useNow(nowIso);
  const [category, setCategory] = useState<PlaceCategory | "all">("all");
  const [openToday, setOpenToday] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"list" | "map">("list");

  const withStatus = useMemo(() => places.map((p) => ({ ...p, status: todayStatus(p, now) })), [places, now]);
  const categories = GUIDE_CATEGORIES.filter((c) => places.some((p) => p.category === c));
  const hasFavorites = places.some((p) => p.is_favorite);

  const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const filtered = withStatus.filter(
    (p) =>
      (category === "all" || p.category === category) &&
      (!openToday || isOpenToday(p.status)) &&
      (!favoritesOnly || p.is_favorite) &&
      (!query.trim() || normalize(p.name).includes(normalize(query.trim()))),
  );

  // Marchés classés par jour de la semaine : seulement les horaires vérifiés, jamais une supposition.
  const markets = withStatus.filter(
    (p) => p.category === "market" && p.opening_mode === "schedule" && p.hours_verified_at,
  );
  const marketDays = [1, 2, 3, 4, 5, 6, 7]
    .map((day) => ({ day, items: markets.flatMap((m) => rangesOn(m, day).map((r) => ({ market: m, ...r }))) }))
    .filter((d) => d.items.length > 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search size={18} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search")}
          aria-label={t("search")}
          className="min-h-12 w-full rounded-xl border border-border bg-surface pr-3 pl-10 text-base focus-visible:outline-2 focus-visible:outline-primary"
        />
      </div>

      <div role="group" aria-label={t("filters")} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <button type="button" className={chip} aria-pressed={category === "all"} onClick={() => setCategory("all")}>
          {t("all")}
        </button>
        {categories.map((c) => (
          <button key={c} type="button" className={chip} aria-pressed={category === c} onClick={() => setCategory(c)}>
            {t(`categories.${c}`)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className={chip} aria-pressed={openToday} onClick={() => setOpenToday((v) => !v)}>
          <span aria-hidden className="size-2 rounded-full bg-current" />
          {t("openToday")}
        </button>
        {hasFavorites && (
          <button type="button" className={chip} aria-pressed={favoritesOnly} onClick={() => setFavoritesOnly((v) => !v)}>
            <Heart size={16} aria-hidden />
            {t("favorites")}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm text-muted">
          {t("count", { count: filtered.length })}
        </p>
        <div role="group" aria-label={t("view")} className="flex gap-1 rounded-full bg-stone p-1">
          {(["list", "map"] as const).map((v) => {
            const Icon = v === "list" ? List : MapIcon;
            return (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold aria-pressed:bg-primary aria-pressed:text-white"
              >
                <Icon size={16} aria-hidden />
                {t(v)}
              </button>
            );
          })}
        </div>
      </div>

      {view === "map" ? (
        <PlacesMap
          slug={slug}
          origin={origin}
          places={filtered.map((p) => ({ id: p.id, name: p.name, lat: p.lat, lng: p.lng, category: p.category, is_favorite: p.is_favorite }))}
          labels={{ yourStay: t("yourStay"), seeDetails: t("seeDetails"), favorite: t("favorite") }}
        />
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl bg-surface p-4 text-muted">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((place) => {
            const Icon = CATEGORY_ICONS[place.category];
            const description = localized(place, "description", locale);
            return (
              <li key={place.id}>
                <Link
                  href={`/g/${slug}/places/${place.id}`}
                  className="flex gap-3 overflow-hidden rounded-2xl border border-border bg-surface p-3 hover:bg-stone focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {place.photo_path ? (
                    <Image
                      src={mediaUrl(place.photo_path)}
                      alt=""
                      width={96}
                      height={96}
                      className="size-24 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="flex size-24 shrink-0 items-center justify-center rounded-xl bg-stone text-primary">
                      <Icon size={28} strokeWidth={1.75} aria-hidden />
                    </span>
                  )}
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    {place.is_favorite && (
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-favorite">
                        <Heart size={14} fill="currentColor" aria-hidden />
                        {t("favorite")}
                      </span>
                    )}
                    <span className="font-heading text-xl leading-tight font-semibold">{place.name}</span>
                    <span className="text-sm text-muted">
                      {t(`category.${place.category}`)}
                      {place.km !== null && ` · ${formatDistance(place.km, locale)}`}
                    </span>
                    <OpenBadge status={place.status} label={t(`status.${place.status.state}`)} />
                    {description && <span className="line-clamp-2 text-sm">{description}</span>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {view === "list" && marketDays.length > 0 && (category === "all" || category === "market") && (
        <section aria-labelledby="markets-title" className="mt-4 flex flex-col gap-3">
          <h2 id="markets-title" className="text-[28px]">
            {t("markets")}
          </h2>
          <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
            {marketDays.map(({ day, items }) => (
              <li key={day} className="flex flex-col gap-1 px-4 py-3">
                <span className="font-semibold first-letter:uppercase">{weekdayName(day, locale)}</span>
                {items.map(({ market, opens, closes }) => (
                  <Link key={`${market.id}-${opens}`} href={`/g/${slug}/places/${market.id}`} className="text-primary underline-offset-2 hover:underline">
                    {market.name} · {opens}–{closes}
                  </Link>
                ))}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
