// Slug public d'un logement : 8 caractères aléatoires + le nom lisible.
// Ex. « k7p2x9qa-moulin-de-la-garrigue ». Le préfixe aléatoire rend l'URL impossible
// à deviner (31^8 ≈ 850 milliards de combinaisons) ; le nom n'est là que pour la lisibilité.

// Sans 0/o, 1/l/i : lisible si quelqu'un recopie l'adresse à la main.
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
const TOKEN_LENGTH = 8;
const NAME_MAX_LENGTH = 40;

export function randomToken(length = TOKEN_LENGTH): string {
  // Tirage par rejet : évite le biais du modulo.
  const limit = 256 - (256 % ALPHABET.length);
  let token = "";
  while (token.length < length) {
    for (const byte of crypto.getRandomValues(new Uint8Array(length * 2))) {
      if (byte < limit && token.length < length) token += ALPHABET[byte % ALPHABET.length];
    }
  }
  return token;
}

export function slugifyName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, NAME_MAX_LENGTH)
    .replace(/^-+|-+$/g, "");
}

export function generateSlug(name: string): string {
  const readable = slugifyName(name);
  return readable ? `${randomToken()}-${readable}` : randomToken();
}

// Même règle que la contrainte CHECK de la table properties.
export const SLUG_PATTERN = /^[a-z0-9]{8}(-[a-z0-9]+)*$/;
