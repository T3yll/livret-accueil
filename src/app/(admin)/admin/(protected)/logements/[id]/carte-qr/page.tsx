import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PrintButton } from "@/components/admin/print-button";
import { Emblem } from "@/components/guide/emblem";
import { brand } from "@/config/brand";
import { requireAdmin } from "@/lib/auth";
import { guideUrl, isLocalUrl, qrSvg } from "@/lib/qr";
import { parseQrPage } from "@/lib/qr-pages";

export const metadata = { title: "Carte QR à imprimer" };

// Carte A6 (105 × 148 mm) d'après la DA : recto pour scanner, verso pour le logement.
// À l'impression, chaque face occupe une page A6 et l'en-tête de l'admin disparaît.
export default async function QrCardPage({ params, searchParams }: PageProps<"/admin/logements/[id]/carte-qr">) {
  const { id } = await params;
  const page = parseQrPage((await searchParams).page);
  const { supabase } = await requireAdmin();
  const { data: property } = await supabase
    .from("properties")
    .select("id, name, slug, welcome_fr, contact_phone, contact_email")
    .eq("id", id)
    .maybeSingle();
  if (!property) notFound();

  const url = guideUrl(property.slug, page);
  const [svg, fr, en, frSections, enSections] = await Promise.all([
    qrSvg(url),
    getTranslations({ locale: "fr", namespace: "QrCard" }),
    getTranslations({ locale: "en", namespace: "QrCard" }),
    getTranslations({ locale: "fr", namespace: "Sections" }),
    getTranslations({ locale: "en", namespace: "Sections" }),
  ]);
  // La phrase sous le QR dit ce qu'il ouvre : le livret, la carte ou une section.
  const scanFr = !page ? fr("scan") : page === "places" ? fr("scanPlaces") : fr("scanSection", { section: frSections(page) });
  const scanEn = !page ? en("scan") : page === "places" ? en("scanPlaces") : en("scanSection", { section: enSections(page) });
  const displayUrl = url.replace(/^https?:\/\//, "");
  // Au verso, l'adresse du livret entier, même quand le QR ouvre une page précise.
  const guideAddress = guideUrl(property.slug).replace(/^https?:\/\//, "");

  const card =
    "relative flex h-[148mm] w-[105mm] shrink-0 flex-col items-center overflow-hidden bg-background text-center " +
    "shadow-[0_1px_4px_rgb(0_0_0/0.15)] print:shadow-none [print-color-adjust:exact]";

  return (
    <div className="flex flex-col gap-6">
      {/* Format de page pour l'impression : A6 sans marge (l'imprimante ajoute les siennes). */}
      <style>{"@page { size: 105mm 148mm; margin: 0; }"}</style>

      <div className="flex flex-col gap-3 print:hidden">
        <p>
          <Link href={`/admin/logements/${property.id}`} className="text-sm font-semibold text-primary underline">
            ← {property.name}
          </Link>
        </p>
        <h1 className="text-[28px]">Carte QR à imprimer</h1>
        {isLocalUrl(url) && (
          <p role="alert" className="rounded-xl bg-favorite-bg px-4 py-3 text-sm text-favorite">
            Le QR code pointe vers {displayUrl} : il ne fonctionnera sur aucun téléphone. Renseignez
            NEXT_PUBLIC_SITE_URL avec l&apos;adresse du site en ligne avant d&apos;imprimer.
          </p>
        )}
        <div className="flex flex-col gap-1 text-sm text-muted">
          <p>
            Pour un fichier à envoyer à l&apos;imprimeur, choisissez la destination{" "}
            <strong className="text-text">Enregistrer au format PDF</strong> : le format A6, les marges et les couleurs
            sont alors appliqués automatiquement (2 pages : recto puis verso).
          </p>
          <p>
            Sur une imprimante de bureau, le navigateur impose ses réglages : choisissez A6, marges « Aucune », échelle
            100 % et cochez « Graphiques d&apos;arrière-plan ».
          </p>
          <p>Papier crème mat 300–350 g. Testez le QR code sur un iPhone et un Android avant de lancer le tirage.</p>
        </div>
        <div>
          <PrintButton>Imprimer</PrintButton>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 print:block">
        {/* Recto */}
        {/* Saut de page après le recto seulement : après le verso, il ajouterait une page blanche. */}
        <section aria-label="Recto" className={`${card} justify-between px-[10mm] py-[9mm] print:break-after-page`}>
          <div className="flex flex-col items-center gap-[2mm]">
            <Emblem size={64} />
            <p className="text-[9pt] tracking-[0.25em] text-muted uppercase">{brand.name}</p>
          </div>

          <div className="flex flex-col items-center gap-[1.5mm]">
            <h2 className="font-heading text-[20pt] leading-tight">{fr("title")}</h2>
            <p className="font-heading text-[13pt] text-muted italic">{fr("welcome")}</p>
            <p lang="en" className="text-[8pt] text-muted">
              {en("title")} · {en("welcome")}
            </p>
          </div>

          <div
            role="img"
            aria-label={`QR code : ${displayUrl}`}
            className="size-[58mm] rounded-[3mm] bg-white [&>svg]:size-full"
            dangerouslySetInnerHTML={{ __html: svg }}
          />

          <div className="flex flex-col items-center gap-[1mm]">
            <p className="text-[10pt] font-semibold">{scanFr}</p>
            <p lang="en" className="text-[8.5pt] text-muted">
              {scanEn}
            </p>
          </div>

          <div className="flex w-full items-center gap-[3mm]">
            <span aria-hidden className="h-px flex-1 bg-accent" />
            <p className="text-[8pt] tracking-[0.3em] text-muted uppercase">{brand.territory}</p>
            <span aria-hidden className="h-px flex-1 bg-accent" />
          </div>
        </section>

        {/* Verso */}
        <section aria-label="Verso" className={`${card} justify-between px-[11mm] py-[11mm]`}>
          <div className="flex w-full flex-col items-center gap-[4mm]">
            <h2 className="font-heading text-[22pt] leading-tight">{property.name}</h2>
            <span aria-hidden className="h-px w-[14mm] bg-accent" />
            {property.welcome_fr && (
              <p className="line-clamp-[9] text-left text-[9.5pt] leading-relaxed whitespace-pre-line">
                {property.welcome_fr}
              </p>
            )}
          </div>

          <div className="flex w-full flex-col gap-[4mm] text-left">
            <div>
              <p className="text-[8pt] tracking-[0.15em] text-muted uppercase">
                {fr("guideAddress")} · <span lang="en">{en("guideAddress")}</span>
              </p>
              {/* Retour à la ligne après un « / » plutôt qu'au milieu d'un mot. */}
              <p className="text-[10pt] font-semibold [overflow-wrap:anywhere]">
                {guideAddress.split("/").map((part, i) => (
                  <Fragment key={i}>
                    {i > 0 && (
                      <>
                        /<wbr />
                      </>
                    )}
                    {part}
                  </Fragment>
                ))}
              </p>
              <p className="text-[8pt] text-muted">
                {fr("noApp")} · <span lang="en">{en("noApp")}</span>
              </p>
            </div>
            {(property.contact_phone || property.contact_email) && (
              <div>
                <p className="text-[8pt] tracking-[0.15em] text-muted uppercase">
                  {fr("contact")} · <span lang="en">{en("contact")}</span>
                </p>
                {property.contact_phone && (
                  <p className="flex items-center gap-[2mm] text-[10pt]">
                    <Phone size={12} className="text-primary" aria-hidden />
                    {property.contact_phone}
                  </p>
                )}
                {property.contact_email && (
                  <p className="flex items-center gap-[2mm] text-[10pt] break-all">
                    <Mail size={12} className="shrink-0 text-primary" aria-hidden />
                    {property.contact_email}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-[2mm]">
            <Emblem size={22} />
            <p className="text-[8pt] tracking-[0.25em] text-muted uppercase">{brand.name}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
