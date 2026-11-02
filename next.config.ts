import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  // Modèle de rendu classique (dynamique par défaut) : plus simple pour l'admin,
  // qui lit la session à chaque requête. On pourra activer cacheComponents plus tard.
  cacheComponents: false,
  // Mode dev uniquement : ouvrir le serveur local depuis un téléphone sur le même Wi-Fi
  // (adresses privées du réseau domestique, et nom Bonjour du Mac en .local).
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "*.local"],
  experimental: {
    // 404 commune : l'appli a deux layouts racine (voyageur et admin).
    globalNotFound: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Le service worker ne doit jamais rester en cache : sinon une nouvelle version du livret
  // (nouveau VERSION dans sw.js) mettrait des heures à arriver sur les téléphones.
  async headers() {
    return [{ source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }] }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
};

export default withNextIntl(nextConfig);
