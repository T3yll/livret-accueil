import { Heart } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { curator } from "@/config/brand";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { formatDistance } from "@/lib/distance";
import { mediaUrl } from "@/lib/guide-view";
import { localizedWithLang } from "@/lib/localized";
import type { PlaceWithDistance } from "@/lib/places-view";
import { CuratorAvatar } from "./curator-avatar";
import { CATEGORY_ICONS } from "./place-icons";

// Les coups de cœur, dès l'accueil du livret : grandes cartes à faire défiler, signées par
// quelqu'un du coin. C'est la valeur du livret face aux outils génériques.
export async function FavoritesCarousel({ slug, places, locale }: { slug: string; places: PlaceWithDistance[]; locale: Locale }) {
  if (places.length === 0) return null;
  const [t, tPlaces] = await Promise.all([getTranslations("Favorites"), getTranslations("Places")]);

  return (
    <section aria-labelledby="favorites-title" className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <CuratorAvatar size={48} />
        <div className="flex flex-col">
          <h2 id="favorites-title" className="text-[28px] leading-tight">
            {t("title", { name: curator.name })}
          </h2>
          <p className="text-sm text-muted">{t("intro", { name: curator.name, home: curator.home })}</p>
        </div>
      </div>

      {/* Défilement horizontal, cartes calées au bord (scroll-snap) ; déborde jusqu'aux bords de l'écran. */}
      <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
        {/* Les coups de cœur avec photo d'abord : ce sont les plus parlants au premier coup d'œil. */}
        {[...places].sort((a, b) => Number(Boolean(b.photo_path)) - Number(Boolean(a.photo_path))).map((place) => {
          const Icon = CATEGORY_ICONS[place.category];
          const comment = localizedWithLang(place, "comment", locale);
          const alt = localizedWithLang(place, "photo_alt", locale);
          return (
            <li key={place.id} className="w-[78%] max-w-72 shrink-0 snap-start">
              <Link
                href={`/g/${slug}/places/${place.id}`}
                className="flex h-full flex-col overflow-hidden rounded-2xl bg-favorite-bg focus-visible:outline-2 focus-visible:outline-primary"
              >
                <span className="relative block">
                  {place.photo_path ? (
                    <Image
                      src={mediaUrl(place.photo_path)}
                      alt={alt?.text ?? ""}
                      width={576}
                      height={384}
                      sizes="(max-width: 640px) 78vw, 288px"
                      className="aspect-[3/2] w-full object-cover"
                    />
                  ) : (
                    <span className="flex aspect-[3/2] w-full items-center justify-center bg-stone text-primary">
                      <Icon size={40} strokeWidth={1.5} aria-hidden />
                    </span>
                  )}
                  <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-surface/95 px-2.5 py-1 text-sm font-semibold text-favorite">
                    <Heart size={14} fill="currentColor" aria-hidden />
                    {tPlaces("favorite", { name: curator.name })}
                  </span>
                </span>
                <span className="flex flex-1 flex-col gap-2 p-4">
                  <span className="font-heading text-2xl leading-tight font-semibold">{place.name}</span>
                  <span className="flex items-center gap-1.5 text-sm text-muted">
                    <Icon size={16} strokeWidth={1.75} className="text-primary" aria-hidden />
                    {tPlaces(`category.${place.category}`)}
                    {place.km !== null && ` · ${formatDistance(place.km, locale)}`}
                  </span>
                  {comment && (
                    <span lang={comment.lang} className="line-clamp-4 font-heading text-lg leading-snug italic">
                      « {comment.text} »
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
