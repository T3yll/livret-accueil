"use client";

import { ChevronLeft, Heart, List, Map as MapIcon, Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { curator } from "@/config/brand";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { formatDistance } from "@/lib/distance";
import { mediaUrl } from "@/lib/guide-view";
import { localized, localizedWithLang } from "@/lib/localized";
import { isOpenToday, rangesOn, todayStatus } from "@/lib/opening-hours";
import { GUIDE_CATEGORIES, weekdayName, type PlaceCategory, type PlaceWithDistance } from "@/lib/places-view";
import { useNow } from "@/lib/use-now";
import { CuratorAvatar } from "./curator-avatar";
import { floatingButton } from "./map-ui";
import { OpenBadge } from "./open-badge";
import { CATEGORY_ICONS } from "./place-icons";

// La carte (Leaflet) n'est chargée que si le voyageur l'ouvre : pages légères sur réseau faible.
const PlacesMap = dynamic(() => import("./places-map"), { ssr: false });

type Props = {
  slug: string;
  places: PlaceWithDistance[];
  origin: { lat: number; lng: number } | null;
  nowIso: string; // heure du serveur au rendu : même résultat au premier affichage côté navigateur
  originLabel: string; // nom du logement, affiché en permanence sous son marqueur
};

const chip =
  "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-4 text-[15px] font-semibold " +
  "focus-visible:outline-2 focus-visible:outline-primary aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-white";

export function PlacesExplorer({ slug, places, origin, nowIso, originLabel }: Props) {
  const t = useTranslations("Places");
  const locale = useLocale() as Locale;
  // L'état « ouvert aujourd'hui » suit l'heure réelle (minuit passé, page venue du cache…).
  const now = useNow(nowIso);
  const [category, setCategory] = useState<PlaceCategory | "all">("all");
  const [openToday, setOpenToday] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // La carte en plein écran est l'affichage par défaut. La liste ajoute une étape dans
  // l'historique (?vue=liste) : le bouton retour du téléphone ramène à la carte.
  const searchParams = useSearchParams();
  const view: "list" | "map" = searchParams.get("vue") === "liste" ? "list" : "map";
  const pushedList = useRef(false);
  const setView = (next: "list" | "map") => {
    if (next === view) return;
    if (next === "list") {
      window.history.pushState(null, "", "?vue=liste");
      pushedList.current = true;
      window.scrollTo(0, 0);
    } else if (pushedList.current) {
      pushedList.current = false;
      window.history.back();
    } else {
      window.history.replaceState(null, "", window.location.pathname);
    }
  };

  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    rootRef.current?.closest("main")?.setAttribute("data-view", view);
  }, [view]);

  // Plein écran : la page ne défile plus.
  useEffect(() => {
    if (view !== "map") return;
    window.scrollTo(0, 0);
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [view]);

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

  // Un lieu masqué par un filtre ne reste pas sélectionné.
  const selected = view === "map" ? filtered.find((p) => p.id === selectedId) : undefined;

  // Échap referme la fiche résumée.
  useEffect(() => {
    if (view !== "map" || !selectedId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelectedId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, selectedId]);

  const categoryChips = (
    <>
      <button type="button" className={chip} aria-pressed={category === "all"} onClick={() => setCategory("all")}>
        {t("all")}
      </button>
      {categories.map((c) => (
        <button key={c} type="button" className={chip} aria-pressed={category === c} onClick={() => setCategory(c)}>
          {t(`categories.${c}`)}
        </button>
      ))}
    </>
  );
  const favoritesChip = hasFavorites && (
    <button type="button" className={chip} aria-pressed={favoritesOnly} onClick={() => setFavoritesOnly((v) => !v)}>
      <Heart size={16} aria-hidden />
      {t("favorites")}
    </button>
  );

  // Marchés classés par jour de la semaine : seulement les horaires vérifiés, jamais une supposition.
  const markets = withStatus.filter(
    (p) => p.category === "market" && p.opening_mode === "schedule" && p.hours_verified_at,
  );
  const marketDays = [1, 2, 3, 4, 5, 6, 7]
    .map((day) => ({ day, items: markets.flatMap((m) => rangesOn(m, day).map((r) => ({ market: m, ...r }))) }))
    .filter((d) => d.items.length > 0);

  // En mode carte, la carte EST le contenu de la page (pas un calque fixe) : sur iPhone, Safari
  // ne laisse passer sous sa barre flottante que le contenu normal, il découpe les éléments fixes.
  // La page masque alors son en-tête (data-view sur <main>, voir globals.css).
  if (view === "map") {
    return (
      <div ref={rootRef}>
        {/* Contrôles flottants sur la carte, comme les cartes mobiles courantes (Google Maps, Airbnb) :
            retour et filtres en haut, liste en bas au centre (à portée de pouce), position en bas à droite. */}
        <section aria-label={t("map")} className="relative h-[100lvh] overflow-hidden bg-background">
          <PlacesMap
            origin={origin}
            places={filtered.map((p) => ({ id: p.id, name: p.name, lat: p.lat, lng: p.lng, category: p.category, is_favorite: p.is_favorite }))}
            selectedId={selected?.id ?? null}
            onSelect={setSelectedId}
            originLabel={originLabel}
            controlsHidden={Boolean(selected)}
            labels={{
              yourStay: t("yourStay"),
              favorite: t("favorite", { name: curator.name }),
              locateMe: t("locateMe"),
              showStay: t("showStay"),
              youAreHere: t("youAreHere"),
              locationDenied: t("locationDenied"),
              locationUnavailable: t("locationUnavailable"),
            }}
          />

          {/* Bandeau en dégradé ivoire sous l'heure et les filtres : la carte ne s'arrête pas net en haut. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-[999] h-[calc(max(0.75rem,env(safe-area-inset-top))+5.5rem)] bg-linear-to-b from-background from-35% via-background/70 to-transparent"
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] flex items-center gap-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <Link
              href={`/g/${slug}`}
              aria-label={t("backToGuide")}
              className={`pointer-events-auto ml-3 shrink-0 ${floatingButton}`}
            >
              <ChevronLeft size={22} aria-hidden />
            </Link>
            <div
              role="group"
              aria-label={t("filters")}
              className="pointer-events-auto flex min-w-0 flex-1 gap-2 overflow-x-auto py-1.5 pr-3 [scrollbar-width:none] [&>button]:border-transparent [&>button]:shadow-[0_1px_4px_rgb(0_0_0/0.25)]"
            >
              {favoritesChip}
              {categoryChips}
            </div>
          </div>

          <p aria-live="polite" className="sr-only">
            {t("count", { count: filtered.length })}
          </p>

          {selected ? (
            <PlaceSheet slug={slug} place={selected} locale={locale} onClose={() => setSelectedId(null)} />
          ) : (
            // En bas à gauche, en face des boutons de position : le centre de la carte reste dégagé.
            <div className="map-above-toolbar pointer-events-none absolute bottom-[calc(max(1rem,env(safe-area-inset-bottom))+1.25rem)] left-3 z-[1000]">
              <button
                type="button"
                onClick={() => setView("list")}
                className="pointer-events-auto inline-flex min-h-12 items-center gap-2 rounded-full bg-text px-5 text-[15px] font-semibold text-white shadow-[0_2px_12px_rgb(0_0_0/0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <List size={18} aria-hidden />
                {t("list")} · {filtered.length}
              </button>
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="flex flex-col gap-4">
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
        {categoryChips}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className={chip} aria-pressed={openToday} onClick={() => setOpenToday((v) => !v)}>
          <span aria-hidden className="size-2 rounded-full bg-current" />
          {t("openToday")}
        </button>
        {favoritesChip}
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

      {filtered.length === 0 ? (
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
                        {t("favorite", { name: curator.name })}
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

type PlaceWithStatus = PlaceWithDistance & { status: ReturnType<typeof todayStatus> };

// Fiche résumée d'un lieu touché sur la carte : photo, état du jour, description, mot de l'hôte.
function PlaceSheet({ slug, place, locale, onClose }: { slug: string; place: PlaceWithStatus; locale: Locale; onClose: () => void }) {
  const t = useTranslations("Places");
  const Icon = CATEGORY_ICONS[place.category];
  const description = localized(place, "description", locale);
  const comment = place.is_favorite ? localizedWithLang(place, "comment", locale) : null;
  const href = `/g/${slug}/places/${place.id}`;

  return (
    <div className="map-above-toolbar absolute inset-x-0 bottom-0 z-[1001] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <article
        aria-labelledby="sheet-title"
        className="relative mx-auto flex max-h-[60dvh] max-w-[640px] flex-col overflow-y-auto rounded-2xl bg-surface shadow-[0_4px_24px_rgb(0_0_0/0.25)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="absolute top-2 right-2 z-10 inline-flex size-11 items-center justify-center rounded-full bg-background/90 text-text focus-visible:outline-2 focus-visible:outline-primary"
        >
          <X size={20} aria-hidden />
        </button>
        {place.photo_path && (
          <Link href={href} tabIndex={-1} aria-hidden>
            <Image
              src={mediaUrl(place.photo_path)}
              alt=""
              width={640}
              height={360}
              sizes="(max-width: 640px) 100vw, 640px"
              className="h-32 w-full object-cover"
            />
          </Link>
        )}
        <div className={`flex flex-col gap-1 p-4 pt-3 ${place.photo_path ? "" : "pr-14"}`}>
          {place.is_favorite && (
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-favorite">
              <Heart size={14} fill="currentColor" aria-hidden />
              {t("favorite", { name: curator.name })}
            </span>
          )}
          <h2 id="sheet-title" className="text-2xl leading-tight font-semibold">
            {place.name}
          </h2>
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <Icon size={16} strokeWidth={1.75} className="text-primary" aria-hidden />
            {t(`category.${place.category}`)}
            {place.km !== null && ` · ${formatDistance(place.km, locale)}`}
          </p>
          <OpenBadge status={place.status} label={t(`status.${place.status.state}`)} />
          {description && <p className="line-clamp-2 text-[15px]">{description}</p>}
          {comment && (
            <figure className="mt-1 flex flex-col gap-2 rounded-xl bg-favorite-bg px-3 py-2">
              <blockquote lang={comment.lang} className="font-heading text-lg leading-snug italic">
                <span className="line-clamp-2">« {comment.text} »</span>
              </blockquote>
              <figcaption className="flex items-center gap-2 text-sm font-semibold">
                <CuratorAvatar size={24} />
                {curator.name}
              </figcaption>
            </figure>
          )}
          <Link
            href={href}
            className="mt-2 inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-4 text-[15px] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {t("seeDetails")}
          </Link>
        </div>
      </article>
    </div>
  );
}
