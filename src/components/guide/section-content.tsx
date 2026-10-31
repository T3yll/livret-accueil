import { Mail, Phone, PlayCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import type { Guide } from "@/lib/guide";
import { formatTime, type GuideSection } from "@/lib/guide-view";
import { localizedWithLang } from "@/lib/localized";
import { RichText } from "@/lib/rich-text";
import { parseMedia, parseSectionData } from "@/lib/sections";
import { CopyButton } from "./copy-button";
import { Directions } from "./directions";
import { Photos } from "./photos";

type Props = { section: GuideSection; property: Guide["property"]; locale: Locale };

const card = "flex flex-col gap-1 rounded-2xl bg-surface p-4";
const label = "text-sm text-muted";

function Body({ section, locale }: { section: GuideSection; locale: Locale }) {
  const body = localizedWithLang(section, "body", locale);
  return body ? <RichText text={body.text} lang={body.lang} /> : null;
}

export async function SectionContent({ section, property, locale }: Props) {
  const photos = <Photos items={parseMedia(section.media)} locale={locale} />;

  switch (section.type) {
    case "arrival":
      return <ArrivalContent section={section} property={property} locale={locale} />;
    case "wifi":
      return <WifiContent section={section} locale={locale} />;
    case "departure":
      return <DepartureContent section={section} locale={locale} />;
    case "contacts":
      return <ContactsContent section={section} property={property} locale={locale} />;
    case "equipment": {
      const title = localizedWithLang(section, "title", locale);
      return (
        <article className="flex flex-col gap-3">
          {title && (
            <h2 lang={title.lang} className="text-2xl font-semibold">
              {title.text}
            </h2>
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

const linkRow =
  "flex min-h-12 items-center gap-3 rounded-xl bg-surface px-4 py-2 hover:bg-stone focus-visible:outline-2 focus-visible:outline-primary";

async function ContactsContent({ section, property, locale }: Props) {
  const t = await getTranslations("Contacts");
  const hasHost = property.contact_phone || property.contact_email;

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
