import {
  Armchair,
  Baby,
  Bath,
  BedDouble,
  Check,
  Coffee,
  Droplet,
  Flame,
  Layers,
  Leaf,
  Luggage,
  Mail,
  Navigation,
  Phone,
  PlayCircle,
  TrainFront,
  Wind,
  X,
  type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import type { Guide } from "@/lib/guide";
import { formatDistance } from "@/lib/distance";
import { directionsLinks, formatTime, type GuideSection } from "@/lib/guide-view";
import type { PlaceWithDistance } from "@/lib/places-view";
import { localized, localizedWithLang } from "@/lib/localized";
import { RichText } from "@/lib/rich-text";
import { mediaUrl } from "@/lib/guide-view";
import { parseMedia, parseSectionData, PROVIDED_ITEMS, type ProvidedItem } from "@/lib/sections";
import { AudioPlayer } from "./audio-player";
import { CopyButton } from "./copy-button";
import { Directions } from "./directions";
import { Photos } from "./photos";

type Props = {
  section: GuideSection;
  property: Guide["property"];
  locale: Locale;
  nearby?: PlaceWithDistance[]; // adresses santé, pour la section Contacts
};

const card = "flex flex-col gap-1 rounded-2xl bg-surface p-4";
const label = "text-sm text-muted";

function Body({ section, locale }: { section: GuideSection; locale: Locale }) {
  const body = localizedWithLang(section, "body", locale);
  return body ? <RichText text={body.text} lang={body.lang} /> : null;
}

export async function SectionContent({ section, property, locale, nearby = [] }: Props) {
  const photos = <Photos items={parseMedia(section.media)} locale={locale} />;

  switch (section.type) {
    case "arrival":
      return <ArrivalContent section={section} property={property} locale={locale} />;
    case "wifi":
      return <WifiContent section={section} locale={locale} />;
    case "departure":
      return <DepartureContent section={section} locale={locale} />;
    case "contacts":
      return <ContactsContent section={section} property={property} locale={locale} nearby={nearby} />;
    case "prepare":
      return <PrepareContent section={section} property={property} locale={locale} />;
    case "equipment": {
      const title = localizedWithLang(section, "title", locale);
      // Note vocale : en premier, c'est plus simple d'écouter devant l'appareil que de lire.
      const audio = localizedWithLang(section, "audio_path", locale);
      const tEquipment = await getTranslations("Equipment");
      return (
        <article className="flex flex-col gap-3">
          {title && (
            <h2 lang={title.lang} className="text-2xl font-semibold">
              {title.text}
            </h2>
          )}
          {audio && (
            <AudioPlayer
              src={mediaUrl(audio.text)}
              lang={audio.lang}
              title={tEquipment("listen")}
              transcript={localized(section, "transcript", audio.lang)}
            />
          )}
          <Body section={section} locale={locale} />
          {photos}
        </article>
      );
    }
    default:
      return (
        <div className="flex flex-col gap-4">
          <Body section={section} locale={locale} />
          {photos}
        </div>
      );
  }
}

async function ArrivalContent({ section, property, locale }: Props) {
  const t = await getTranslations("Arrival");
  const d = parseSectionData("arrival", section.data);
  const parking = localizedWithLang(d, "parking", locale);

  return (
    <div className="flex flex-col gap-4">
      <dl className="grid gap-3">
        {d.checkin_from && (
          <div className={card}>
            <dt className={label}>{t("checkin")}</dt>
            <dd className="text-lg font-semibold">
              {d.checkin_until
                ? t("checkinBetween", { from: formatTime(d.checkin_from, locale), until: formatTime(d.checkin_until, locale) })
                : t("checkinFrom", { time: formatTime(d.checkin_from, locale) })}
            </dd>
          </div>
        )}
        {d.key_handover && (
          <div className={card}>
            <dt className={label}>{t("keys")}</dt>
            <dd className="text-lg font-semibold">{t(`keyHandover.${d.key_handover}`)}</dd>
          </div>
        )}
        {d.access_code && (
          <div className={card}>
            <dt className={label}>{t("accessCode")}</dt>
            <dd className="font-mono text-2xl font-semibold tracking-widest">{d.access_code}</dd>
          </div>
        )}
        {parking && (
          <div className={card}>
            <dt className={label}>{t("parking")}</dt>
            <dd lang={parking.lang}>{parking.text}</dd>
          </div>
        )}
      </dl>
      <Body section={section} locale={locale} />
      {d.video_url && (
        <a
          href={d.video_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 font-semibold text-primary hover:bg-stone"
        >
          <PlayCircle size={20} aria-hidden />
          {t("video")}
        </a>
      )}
      <Photos items={parseMedia(section.media)} locale={locale} />
      <Directions property={property} locale={locale} />
    </div>
  );
}

async function WifiContent({ section, locale }: Omit<Props, "property">) {
  const t = await getTranslations("Wifi");
  const d = parseSectionData("wifi", section.data);

  if (d.no_wifi) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-lg">{t("noWifi")}</p>
        <Body section={section} locale={locale} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <dl className="grid gap-3">
        <div className={card}>
          <dt className={label}>{t("network")}</dt>
          <dd className="text-lg font-semibold break-all">{d.ssid}</dd>
        </div>
        {d.password && (
          <div className={card}>
            <dt className={label}>{t("password")}</dt>
            <dd className="font-mono text-lg font-semibold break-all select-all">{d.password}</dd>
          </div>
        )}
      </dl>
      {d.password && (
        <CopyButton value={d.password} labels={{ copy: t("copy"), copied: t("copied"), failed: t("copyFailed") }} />
      )}
      <Body section={section} locale={locale} />
      <Photos items={parseMedia(section.media)} locale={locale} />
    </div>
  );
}

async function DepartureContent({ section, locale }: Omit<Props, "property">) {
  const t = await getTranslations("Departure");
  const d = parseSectionData("departure", section.data);
  return (
    <div className="flex flex-col gap-4">
      {d.checkout_time && (
        <p className="rounded-2xl bg-surface p-4 text-lg font-semibold">
          {t("checkoutBefore", { time: formatTime(d.checkout_time, locale) })}
        </p>
      )}
      <Body section={section} locale={locale} />
      <Photos items={parseMedia(section.media)} locale={locale} />
    </div>
  );
}

// Numéros nationaux, identiques partout en France.
const EMERGENCY_NUMBERS = [
  { number: "15", key: "samu", scheme: "tel" },
  { number: "18", key: "firefighters", scheme: "tel" },
  { number: "112", key: "european", scheme: "tel" },
  { number: "114", key: "deaf", scheme: "sms" }, // le 114 se joint par SMS
  { number: "3237", key: "pharmacy", scheme: "tel" },
] as const;

const pill =
  "inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-3 text-sm font-semibold hover:bg-stone focus-visible:outline-2 focus-visible:outline-primary";

const linkRow =
  "flex min-h-12 items-center gap-3 rounded-xl bg-surface px-4 py-2 hover:bg-stone focus-visible:outline-2 focus-visible:outline-primary";

async function ContactsContent({ section, property, locale, nearby = [] }: Props) {
  const [t, tPlaces] = await Promise.all([getTranslations("Contacts"), getTranslations("Places")]);
  const hasHost = property.contact_phone || property.contact_email;
  const tGuideDirections = (await getTranslations("Guide"))("directions");

  return (
    <div className="flex flex-col gap-6">
      {hasHost && (
        <section aria-labelledby="host-title" className="flex flex-col gap-2">
          <h2 id="host-title" className="text-2xl">
            {t("host")}
          </h2>
          {property.contact_phone && (
            <a href={`tel:${property.contact_phone.replace(/\s/g, "")}`} className={linkRow}>
              <Phone size={20} className="text-primary" aria-hidden />
              <span>
                <span className="block text-sm text-muted">{t("call")}</span>
                <span className="font-semibold">{property.contact_phone}</span>
              </span>
            </a>
          )}
          {property.contact_email && (
            <a href={`mailto:${property.contact_email}`} className={linkRow}>
              <Mail size={20} className="text-primary" aria-hidden />
              <span className="min-w-0">
                <span className="block text-sm text-muted">{t("email")}</span>
                <span className="block font-semibold break-all">{property.contact_email}</span>
              </span>
            </a>
          )}
        </section>
      )}

      <Body section={section} locale={locale} />

      {nearby.length > 0 && (
        <section aria-labelledby="nearby-title" className="flex flex-col gap-2">
          <h2 id="nearby-title" className="text-2xl">
            {tPlaces("emergencyPlaces")}
          </h2>
          <ul className="flex flex-col gap-2">
            {nearby.map((place) => (
              <li key={place.id} className="flex flex-col gap-2 rounded-xl bg-surface p-4">
                <span>
                  <span className="block font-semibold">{place.name}</span>
                  <span className="text-sm text-muted">
                    {[place.city, place.km !== null && formatDistance(place.km, locale)].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <span className="flex flex-wrap gap-2">
                  {place.phone && (
                    <a href={`tel:${place.phone.replace(/\s/g, "")}`} className={`${pill} text-primary`}>
                      <Phone size={16} aria-hidden />
                      {place.phone}
                    </a>
                  )}
                  <a
                    href={directionsLinks(place.lat, place.lng, locale)[0].href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${pill} text-primary`}
                  >
                    <Navigation size={16} aria-hidden />
                    {tGuideDirections}
                  </a>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="emergency-title" className="flex flex-col gap-2">
        <h2 id="emergency-title" className="text-2xl">
          {t("emergencies")}
        </h2>
        <ul className="flex flex-col gap-2">
          {EMERGENCY_NUMBERS.map(({ number, key, scheme }) => (
            <li key={number}>
              <a href={`${scheme}:${number}`} className={linkRow}>
                <span className="w-14 shrink-0 text-2xl font-semibold text-primary">{number}</span>
                <span>{t(key)}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

const PROVIDED_ICONS: Record<ProvidedItem, LucideIcon> = {
  sheets: BedDouble,
  towels: Bath,
  coffee: Coffee,
  soap: Droplet,
  hairdryer: Wind,
  baby_cot: Baby,
  high_chair: Armchair,
  dishcloths: Layers,
  firewood: Flame,
};

// « Préparer mon séjour » : de quoi faire sa valise en 30 secondes. Icônes et lignes courtes, pas de paragraphe.
async function PrepareContent({ section, property, locale }: Props) {
  const t = await getTranslations("Prepare");
  const d = parseSectionData("prepare", section.data);
  const provided = PROVIDED_ITEMS.flatMap((item) => {
    const value = d[`provided_${item}`];
    return value ? [{ item, value }] : [];
  });
  // Ce qui est fourni d'abord, puis ce qu'il faut apporter.
  provided.sort((a, b) => Number(a.value === "no") - Number(b.value === "no"));
  const coffeeMaker = localizedWithLang(d, "coffee_maker", locale);
  const bring = localizedWithLang(d, "bring", locale);
  const bringLines = bring?.text.split("\n").map((line) => line.replace(/^\s*-\s*/, "").trim()).filter(Boolean) ?? [];
  const taxi = localizedWithLang(d, "taxi", locale);

  return (
    <div className="flex flex-col gap-8">
      {(provided.length > 0 || d.dry_toilets) && (
        <section aria-labelledby="provided-title" className="flex flex-col gap-3">
          <h2 id="provided-title" className="text-2xl">
            {t("provided")}
          </h2>
          <ul className="grid grid-cols-2 gap-2">
            {provided.map(({ item, value }) => {
              const Icon = PROVIDED_ICONS[item];
              return (
                <li key={item} className="flex items-start gap-2 rounded-2xl bg-surface p-3">
                  <Icon size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-primary" aria-hidden />
                  <span className="flex min-w-0 flex-col">
                    <span className="font-semibold">{t(`items.${item}`)}</span>
                    <span className={`inline-flex items-center gap-1 text-sm ${value === "yes" ? "text-open" : "text-favorite"}`}>
                      {value === "yes" ? <Check size={14} aria-hidden /> : <X size={14} aria-hidden />}
                      {value === "yes" ? t("yes") : t("no")}
                    </span>
                    {item === "coffee" && coffeeMaker && (
                      <span lang={coffeeMaker.lang} className="text-sm text-muted">
                        {coffeeMaker.text}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
          {d.dry_toilets && (
            <p className="flex items-center gap-2 text-sm">
              <Leaf size={18} className="shrink-0 text-primary" aria-hidden />
              {t("dryToilets")}
            </p>
          )}
        </section>
      )}

      {bringLines.length > 0 && (
        <section aria-labelledby="bring-title" className="flex flex-col gap-3">
          <h2 id="bring-title" className="text-2xl">
            {t("bring")}
          </h2>
          <ul lang={bring?.lang} className="flex flex-col gap-2">
            {bringLines.map((line) => (
              <li key={line} className="flex items-center gap-2">
                <Luggage size={18} className="shrink-0 text-primary" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
        </section>
      )}

      <Body section={section} locale={locale} />
      <Photos items={parseMedia(section.media)} locale={locale} />

      <Directions property={property} locale={locale} />
      {d.station && (
        <div className={card}>
          <p className="flex items-center gap-2 font-semibold">
            <TrainFront size={20} className="text-primary" aria-hidden />
            {t("byTrain")}
          </p>
          <p>
            {d.station_minutes
              ? t("stationWithTime", { station: d.station, minutes: d.station_minutes })
              : t("station", { station: d.station })}
          </p>
          {taxi && (
            <p lang={taxi.lang} className="text-sm">
              {taxi.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
