import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { fontVariables } from "../../fonts";
import "../../globals.css";

export const metadata: Metadata = {
  title: { default: `Admin · ${brand.name}`, template: `%s · Admin ${brand.name}` },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="fr" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
