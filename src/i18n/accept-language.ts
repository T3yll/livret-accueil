// Langue du téléphone (en-tête Accept-Language, ex. « nl-NL,nl;q=0.9 »).
// Le livret existe en français et en anglais : un téléphone qui ne parle ni l'un ni l'autre
// (néerlandais, allemand…) reçoit l'anglais, plus souvent compris par un touriste étranger
// que le français, langue par défaut. Sans en-tête (robots), rien ne change.
export function withEnglishFallback(acceptLanguage: string | null): string | null {
  if (!acceptLanguage?.trim()) return acceptLanguage;
  const languages = acceptLanguage.split(",").map((part) => part.split(";")[0].trim().toLowerCase().split("-")[0]);
  return languages.some((lang) => lang === "fr" || lang === "en") ? acceptLanguage : "en";
}
