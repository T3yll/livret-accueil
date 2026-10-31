import type { Locale } from "@/i18n/routing";

type Bilingual<K extends string> = { [P in `${K}_fr` | `${K}_en`]?: string | null };

// Renvoie le texte dans la langue demandée, sinon le français, sinon null.
// Un texte vide ou fait d'espaces compte comme absent (une section vide ne s'affiche pas).
export function localized<K extends string>(
  record: Bilingual<K>,
  key: K,
  locale: Locale,
): string | null {
  const pick = (value: string | null | undefined) => (value && value.trim() ? value : null);
  const fr = pick(record[`${key}_fr` as keyof Bilingual<K>]);
  if (locale === "fr") return fr;
  return pick(record[`${key}_en` as keyof Bilingual<K>]) ?? fr;
}
