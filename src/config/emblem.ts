// Emblème de la marque : un arc (le soleil, la voûte), deux cyprès et les collines des deux vallées.
// Seule définition du dessin, partagée par le composant React, les icônes de l'appli et la carte QR.
// Repère 64 × 64 ; les traits utilisent `stroke`, les cyprès `fill`.

// Le dessin occupe y = 17 → 52 : le cadre est décalé de 2,5 pour le centrer.
export const EMBLEM_VIEWBOX = "0 2.5 64 64";

export const emblemStrokes = [
  "M11 41 A21 21 0 0 1 53 41", // arc
  "M6 46 C17 39 26 39 33 43.5 C40 48 49 46.5 58 42", // première colline
  "M14 52 C25 47.5 39 48.5 50 52", // seconde colline
];

export const emblemFills = [
  "M27.5 42 C24.5 35 25 25 28 17 C31 25 31.5 35 28.5 42 Z", // grand cyprès
  "M34.5 42.5 C32.5 37.5 32.8 31 35 25.5 C37.2 31 37.5 37.5 35.5 42.5 Z", // petit cyprès
];

export const EMBLEM_STROKE_WIDTH = 2;

// Version texte (SVG autonome) pour les images générées côté serveur.
// `scale` réduit le dessin dans son carré (zone sûre des icônes « maskable »).
export function emblemSvg({
  color,
  background,
  size = 512,
  scale = 1,
}: {
  color: string;
  background?: string;
  size?: number;
  scale?: number;
}): string {
  // Réduction autour du centre du cadre (32 ; 34,5).
  const dx = 32 * (1 - scale);
  const dy = 34.5 * (1 - scale);
  const strokes = emblemStrokes
    .map((d) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${EMBLEM_STROKE_WIDTH}" stroke-linecap="round"/>`)
    .join("");
  const fills = emblemFills.map((d) => `<path d="${d}" fill="${color}"/>`).join("");
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${EMBLEM_VIEWBOX}">` +
    (background ? `<rect y="2.5" width="64" height="64" fill="${background}"/>` : "") +
    `<g transform="translate(${dx} ${dy}) scale(${scale})">${strokes}${fills}</g></svg>`
  );
}
