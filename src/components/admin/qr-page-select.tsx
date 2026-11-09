"use client";

import { usePathname, useRouter } from "next/navigation";
import { SECTION_LABELS } from "@/components/admin/section-labels";
import { Select } from "@/components/ui/field";
import { QR_PAGES, type QrPage } from "@/lib/qr-pages";

const LABELS: Record<QrPage, string> = { places: "Carte des bonnes adresses", ...SECTION_LABELS };

// Page ouverte par le QR code : l'aperçu, les téléchargements et la carte A6 suivent le choix (?qr=…).
export function QrPageSelect({ value }: { value: QrPage | null }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Select
      label="Page ouverte par le QR code"
      value={value ?? ""}
      onChange={(e) => router.replace(e.target.value ? `${pathname}?qr=${e.target.value}` : pathname, { scroll: false })}
      hint="Ex. un QR sur la table du salon qui ouvre directement la carte, un autre près de la box pour le Wi-Fi."
    >
      <option value="">Accueil du livret</option>
      {QR_PAGES.map((page) => (
        <option key={page} value={page}>
          {LABELS[page]}
        </option>
      ))}
    </Select>
  );
}
