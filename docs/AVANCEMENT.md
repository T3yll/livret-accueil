# Avancement du projet

État au 2 novembre 2026 (semaine 4 commencée). À lire en reprenant le projet (nouveau PC, nouvelle session).
Le contexte métier et les règles sont dans `CLAUDE.md` et les autres fichiers de `docs/`.

## Où on en est dans le planning

| Semaine | Livrable | État |
| --- | --- | --- |
| 1 · 2 → 8 nov. | Projet initialisé, base de données, admin hébergeurs et logements | ✅ Fait et testé |
| 2 · 9 → 15 nov. | Sections du livret, affichage voyageur FR/EN | ✅ Fait et testé |
| 3 · 16 → 22 nov. | Base d'adresses, carte, « ouvert aujourd'hui », coups de cœur | ✅ Fait et testé |
| 4 · 23 → 29 nov. | PWA hors connexion, QR codes, mise en ligne Vercel, DA appliquée | ✅ Fait, en ligne sur https://livret-accueil.vercel.app (domaine définitif à brancher) |
| 5 · 30 nov. → 13 déc. | Saisie des 30 adresses, livret de démo, rendez-vous avec 3 hébergeurs | ⏳ À faire |

## Ce qui existe

- **Admin** (`/admin`, connexion par mot de passe, réservée aux comptes de la table `admins`) :
  hébergeurs, logements (photo, publication, slug régénérable, module bonnes adresses),
  sections du livret (ordre, activation, FR/EN, photos), base d'adresses (horaires par plages,
  fermetures, date de vérification, archivage), choix des adresses par logement et coups de cœur.
- **Livret voyageur** (`/g/<slug>` → `/fr/...` ou `/en/...`) : accueil, 7 sections, Wi-Fi copiable,
  contacts et urgences, itinéraire (Google Maps, Plans, Waze), bonnes adresses (liste, filtres,
  recherche, carte Leaflet, marchés par jour, fiche).
- **Hors connexion (PWA)** : `public/sw.js` (écrit à la main). À la première visite, toutes les pages du livret
  dans la langue courante et leurs fichiers JS/CSS sont enregistrées en arrière-plan ; ensuite, pages en
  « réseau d'abord » avec repli sur le cache au bout de 4 s. Photos et tuiles de carte : seulement celles déjà vues.
  Manifest par logement (`/<langue>/g/<slug>/manifest.webmanifest`), icônes générées depuis l'emblème
  (`/icons/…`), page `/offline.html`, bandeau « Hors connexion », invitation à l'installation (Android : bouton ;
  iPhone : marche à suivre). **Actif seulement en production** (`npm run build && npm start`).
- **QR codes** (fiche d'un logement dans l'admin) : aperçu, PNG 1024 px, SVG, carte A6 recto verso imprimable
  (`/admin/logements/<id>/carte-qr`). Le QR encode `NEXT_PUBLIC_SITE_URL/g/<slug>` (sans langue).
- **Emblème** : dessin unique dans `src/config/emblem.ts` (composant `Emblem`, icônes, carte QR).
- **Base Supabase** (projet cloud `oeheumqsfmcqaiwisgxr`, région Europe) : 3 migrations dans
  `supabase/migrations/`, toutes appliquées. Aucun accès anonyme aux tables : le voyageur passe
  uniquement par la fonction `get_guide(slug)`.
- **Tests** : `npm test` (69 tests : calcul « ouvert aujourd'hui », règles d'accès RLS sur un
  Postgres embarqué, sections, distances…).

## Choix techniques à connaître

- Next.js 16.4 : `cacheComponents` désactivé (modèle de rendu classique), `proxy.ts` au lieu de `middleware.ts`.
- Formulaires admin : les actions renvoient la saisie (`values`) et le `<form>` est reconstruit
  à chaque réponse (`formKey`), sinon React 19 efface la saisie après une erreur.
- « Ouvert aujourd'hui » est calculé dans `src/lib/opening-hours.ts`, à l'heure de Paris, aussi côté navigateur
  (prévu pour le hors connexion). Horaires jamais vérifiés → « Horaires à vérifier ».
- `allowedDevOrigins` dans `next.config.ts` permet d'ouvrir le serveur de dev depuis un téléphone du même Wi-Fi.

## Données actuelles (base cloud)

- **Gîte de démonstration** (fictif), publié : `/g/demo4x7q-gite-de-demonstration`. Son slug est dans
  `supabase/seed.sql` : le régénérer depuis l'admin si le dépôt devient public.
- **10 adresses réelles** saisies depuis des sources publiques (Cougnac, Padirac, Marqueyssac, Castelnaud,
  marchés de Sarlat et Gourdon, Forêt des Singes, Maison Louis Roque, Rocamadour, La Roque-Gageac),
  ajoutées au gîte de démo. **Horaires non vérifiés** : à confirmer par téléphone puis
  « Horaires vérifiés aujourd'hui ». Aucune photo, aucun coup de cœur.
- 4 adresses « TEST … à supprimer » archivées. Suppression définitive (éditeur SQL Supabase) :
  `delete from public.places where name like 'TEST % à supprimer';`

## Points non vérifiés ou à surveiller

- Avertissement « N archivée(s) » sur la fiche d'un logement.
- Un blocage unique (2,5 min) au premier enregistrement d'une section, jamais reproduit :
  probablement la première compilation en mode dev.
- Ce PC est en Node 22.
- **Service worker testé** dans Edge headless (serveur coupé : sections et fiches jamais ouvertes, filtres de la liste,
  repli sur l'accueil, page « Pas de connexion »). Le navigateur intégré de Claude bloque les service workers.
- QR codes vérifiés dans l'admin : aperçu, PNG 1024 px et SVG (décodés par un lecteur indépendant), carte A6
  exactement à 105 × 148 mm sans débordement, routes refusées sans connexion. En « Enregistrer au format PDF » :
  2 pages A6, fond crème compris. Sur imprimante de bureau, Chrome impose ses réglages (A6, marges, échelle,
  arrière-plan à régler à la main). **Pas encore fait** : un tirage papier.
- **Testé par Rémi sur téléphone le 2 novembre 2026**, sur le site en ligne : connexion admin, QR code scanné,
  livret en mode avion après une visite, ajout à l'écran d'accueil, bouton « Copier » du Wi-Fi. Tout fonctionne.
- Une adresse vue hors connexion affiche « ouvert aujourd'hui » recalculé à l'heure du téléphone.

## Reprendre sur un autre PC

```bash
git clone https://github.com/T3yll/livret-accueil.git
cd livret-accueil
npm install
cp .env.example .env.local   # remplir avec l'URL et la clé publique (Supabase → Connect)
npm run dev
```

Pour créer ou appliquer des migrations : `npx supabase login`, puis
`npx supabase link --project-ref oeheumqsfmcqaiwisgxr`.

## Mise en ligne (Vercel)

- Projet Vercel `livret-accueil`, relié au dépôt GitHub : chaque push sur `master` redéploie.
  Adresse : https://livret-accueil.vercel.app
- Variables (Vercel → Settings → Environment Variables) : `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`. Ce sont des variables `NEXT_PUBLIC_` :
  intégrées au build, **toute modification demande un redéploiement**.
- Ne pas ajouter l'intégration Supabase de Vercel (elle créerait d'autres variables, voire une autre base).
- Vérifié en ligne : livret, adresses, photos (AVIF), manifest, icônes, service worker non mis en cache,
  hors connexion (20 pages enregistrées à la première visite).
- La connexion admin se fait par mot de passe : aucune URL de redirection Supabase n'est nécessaire.
  Quand le domaine sera choisi, mettre quand même Supabase → Authentication → URL Configuration → Site URL
  sur l'adresse définitive (utilisée dans les emails, par exemple mot de passe oublié).

## Prochaine étape

1. Domaine définitif dans Vercel (`conciergerie-des-deux-vallees.fr` ou sous-domaine), DNS, puis
   `NEXT_PUBLIC_SITE_URL` mis à jour et redéploiement **avant d'imprimer les cartes QR**.
2. Tirage papier d'une carte QR avec l'adresse définitive, scannée avec un iPhone et un Android.
3. Semaine 5 : saisie des 30 adresses, horaires vérifiés, photos, coups de cœur, livret de démo, rendez-vous.
