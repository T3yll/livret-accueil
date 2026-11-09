import { requireAdmin } from "@/lib/auth";
import { guideUrl, qrPng, qrSvg } from "@/lib/qr";
import { parseQrPage } from "@/lib/qr-pages";

// Téléchargement du QR code d'un logement : /admin/logements/<id>/qr?format=png|svg&page=places
export async function GET(request: Request, { params }: RouteContext<"/admin/logements/[id]/qr">) {
  const { id } = await params;
  // Une route n'hérite pas du layout de l'admin : la vérification est refaite ici.
  const { supabase } = await requireAdmin();
  const { data: property } = await supabase.from("properties").select("slug").eq("id", id).maybeSingle();
  if (!property) return new Response(null, { status: 404 });

  const search = new URL(request.url).searchParams;
  const format = search.get("format") === "svg" ? "svg" : "png";
  const page = parseQrPage(search.get("page"));
  const url = guideUrl(property.slug, page);
  const filename = `qr-${property.slug}${page ? `-${page}` : ""}.${format}`;
  const headers = {
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Cache-Control": "private, no-store",
  };

  if (format === "svg") {
    return new Response(await qrSvg(url), { headers: { ...headers, "Content-Type": "image/svg+xml" } });
  }
  return new Response(new Uint8Array(await qrPng(url)), { headers: { ...headers, "Content-Type": "image/png" } });
}
