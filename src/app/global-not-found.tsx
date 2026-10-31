import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { fontVariables } from "./fonts";
import "./globals.css";

// 404 pour les adresses qui ne correspondent à aucune route (l'appli a deux layouts racine).
export const metadata: Metadata = {
  title: `404 · ${brand.name}`,
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="fr" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-[32px]">Page introuvable</h1>
        <p className="text-muted" lang="en">
          Page not found
        </p>
      </body>
    </html>
  );
}
