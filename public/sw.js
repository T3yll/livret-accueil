// Service worker du livret voyageur : consultation hors connexion après une première visite.
// Écrit à la main (pas de bibliothèque) : quatre caches, chacun avec une stratégie simple.
//
// - pages du livret (/fr/g/…, /en/g/…) : réseau d'abord, cache si le réseau échoue ou traîne ;
// - fichiers de l'appli (/_next/static, immuables) : cache d'abord ;
// - photos (/_next/image) et tuiles de carte vues : cache d'abord, en nombre limité.
//
// L'admin, l'authentification et le reste du site ne passent jamais par ce cache.
// Changer VERSION vide les anciens caches au prochain chargement.

const VERSION = "v1";
const PAGES = `pages-${VERSION}`;
const ASSETS = `assets-${VERSION}`;
const IMAGES = `images-${VERSION}`;
const TILES = `tiles-${VERSION}`;
const CACHES = [PAGES, ASSETS, IMAGES, TILES];

const OFFLINE_PAGE = "/offline.html";
const GUIDE_PAGE = /^\/(fr|en)\/g\/[^/]+(\/.*)?$/;
// Au-delà, on sert la version enregistrée (réseau faible à la campagne) ; la réponse
// du réseau, si elle arrive, met quand même le cache à jour pour la visite suivante.
const NETWORK_TIMEOUT_MS = 4000;
// Pages déjà enregistrées depuis moins longtemps : pas retéléchargées à chaque visite.
const PRECACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000;
const MAX_IMAGES = 150;
const MAX_TILES = 400;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => cache.add(OFFLINE_PAGE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !CACHES.includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith("/_next/static/")) {
      event.respondWith(cacheFirst(ASSETS, request));
    } else if (url.pathname === "/_next/image") {
      event.respondWith(cacheFirst(IMAGES, request, MAX_IMAGES));
    } else if (url.pathname.startsWith("/icons/")) {
      event.respondWith(cacheFirst(ASSETS, request));
    } else if (request.mode === "navigate" && GUIDE_PAGE.test(url.pathname)) {
      event.respondWith(guidePage(event, url));
    }
    // Les requêtes de navigation interne de Next (en-tête RSC) ne sont pas interceptées :
    // hors connexion, Next les voit échouer et recharge la page entière, servie par le cache.
    return;
  }

  // Tuiles OpenStreetMap : seulement celles déjà vues (pas de téléchargement en masse,
  // interdit par les conditions d'utilisation d'OSM).
  if (url.hostname.endsWith("tile.openstreetmap.org")) {
    event.respondWith(cacheFirst(TILES, request, MAX_TILES));
  }
});

// Les pages sont rangées sans paramètres d'URL : une seule version par page.
const pageKey = (url) => url.origin + url.pathname;

async function guidePage(event, url) {
  const cache = await caches.open(PAGES);
  const network = fetch(event.request).then(async (response) => {
    if (isCacheablePage(response)) await cache.put(pageKey(url), response.clone());
    return response;
  });
  event.waitUntil(network.catch(() => {}));

  const timeout = new Promise((resolve) => setTimeout(resolve, NETWORK_TIMEOUT_MS, "timeout"));
  try {
    const first = await Promise.race([network, timeout]);
    if (first !== "timeout") return first;
    const cached = await cache.match(pageKey(url));
    return cached ?? (await network);
  } catch {
    // Hors connexion : la page elle-même, sinon l'accueil du livret, sinon la page d'excuse.
    const home = url.pathname.match(/^\/(fr|en)\/g\/[^/]+/)[0];
    return (
      (await cache.match(pageKey(url))) ??
      (await cache.match(url.origin + home)) ??
      (await cache.match(OFFLINE_PAGE)) ??
      Response.error()
    );
  }
}

function isCacheablePage(response) {
  return response.ok && response.type === "basic" && !response.redirected;
}

async function cacheFirst(cacheName, request, maxEntries) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  // Les tuiles sont chargées sans CORS : réponse « opaque » (statut 0), qu'on garde aussi.
  if (response.ok || response.type === "opaque") {
    await cache.put(request, response.clone());
    if (maxEntries) trim(cache, maxEntries);
  }
  return response;
}

// Supprime les entrées les plus anciennes au-delà de la limite.
async function trim(cache, maxEntries) {
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - maxEntries)).map((key) => cache.delete(key)));
}

// La page demande d'enregistrer tout le livret : chaque page, et les fichiers JS/CSS qu'elle
// utilise (sinon une page jamais ouverte s'afficherait hors connexion sans ses composants).
self.addEventListener("message", (event) => {
  if (event.data?.type !== "precache" || !Array.isArray(event.data.urls)) return;
  event.waitUntil(precache(event.data.urls.filter((path) => GUIDE_PAGE.test(path))));
});

async function precache(paths) {
  const pages = await caches.open(PAGES);
  const assets = await caches.open(ASSETS);
  // Une page à la fois : ne pas saturer une connexion faible.
  for (const path of paths) {
    const url = new URL(path, self.location.origin);
    try {
      const cached = await pages.match(pageKey(url));
      const date = cached && Date.parse(cached.headers.get("date") ?? "");
      if (date && Date.now() - date < PRECACHE_MAX_AGE_MS) continue;

      const response = await fetch(url, { credentials: "same-origin" });
      if (!isCacheablePage(response)) continue;
      const html = await response.clone().text();
      await pages.put(pageKey(url), response);

      const files = new Set(html.match(/\/_next\/static\/[^"'\s\\)]+/g) ?? []);
      for (const file of files) {
        if (!(await assets.match(file))) await assets.add(file).catch(() => {});
      }
    } catch {
      return; // réseau perdu : on reprendra à la prochaine visite
    }
  }
}
