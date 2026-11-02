import sharp from "sharp";
import { brandColors } from "@/config/brand";
import { emblemSvg } from "@/config/emblem";

// Icônes de l'appli (écran d'accueil du téléphone), générées depuis l'emblème au moment du build.
// « maskable » : Android découpe l'icône en cercle ou en goutte, le dessin reste dans la zone sûre.
const ICONS: Record<string, { size: number; scale: number }> = {
  "icon-192.png": { size: 192, scale: 0.8 },
  "icon-512.png": { size: 512, scale: 0.8 },
  "maskable-512.png": { size: 512, scale: 0.6 },
  "apple-touch-icon.png": { size: 180, scale: 0.75 },
};

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(ICONS).map((file) => ({ file }));
}

export async function GET(_request: Request, { params }: RouteContext<"/icons/[file]">) {
  const { file } = await params;
  const icon = ICONS[file];
  if (!icon) return new Response(null, { status: 404 });

  const svg = emblemSvg({ color: brandColors.accent, background: brandColors.text, size: icon.size, scale: icon.scale });
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=604800" },
  });
}
