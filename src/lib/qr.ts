import "server-only";
import QRCode, { type QRCodeToStringOptions } from "qrcode";
import { brandColors } from "@/config/brand";

// Adresse encodée dans le QR code : sans langue, pour que le livret s'ouvre dans celle du téléphone.
export function guideUrl(slug: string): string {
  // Une variable présente mais vide (oubli dans Vercel) compte comme absente.
  const site = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000").replace(/\/+$/, "");
  return `${site}/g/${slug}`;
}

// Un QR code vers localhost ne fonctionne sur aucun téléphone : à signaler dans l'admin.
export function isLocalUrl(url: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/.test(url);
}

// Correction d'erreur « M » (15 %) : code lisible même un peu abîmé, sans le surcharger.
// Marge de 4 modules (zone blanche exigée par la norme) et charbon sur blanc pour le contraste.
const options: QRCodeToStringOptions = {
  errorCorrectionLevel: "M",
  margin: 4,
  color: { dark: brandColors.text, light: "#FFFFFF" },
};

export function qrSvg(url: string): Promise<string> {
  return QRCode.toString(url, { ...options, type: "svg" });
}

// 1024 px : assez net pour une impression jusqu'à ~8 cm à 300 dpi.
export function qrPng(url: string): Promise<Buffer> {
  return QRCode.toBuffer(url, { ...options, type: "png", width: 1024 });
}
