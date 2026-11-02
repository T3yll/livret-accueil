# Avancement du projet

État au 2 novembre 2026. À lire en reprenant le projet (nouveau PC, nouvelle session).
Le contexte métier et les règles sont dans `CLAUDE.md` et les autres fichiers de `docs/`.

## Où on en est dans le planning

| Semaine | Livrable | État |
| --- | --- | --- |
| 1 · 2 → 8 nov. | Projet initialisé, base de données, admin hébergeurs et logements | ✅ Fait et testé |
| 2 · 9 → 15 nov. | Sections du livret, affichage voyageur FR/EN | ✅ Fait et testé |
| 3 · 16 → 22 nov. | Base d'adresses, carte, « ouvert aujourd'hui », coups de cœur | ✅ Fait et testé |
| 4 · 23 → 29 nov. | PWA hors connexion, QR codes, mise en ligne Vercel, DA appliquée | ⏳ À faire |
| 5 · 30 nov. → 13 déc. | Saisie des 30 adresses, livret de démo, rendez-vous avec 3 hébergeurs | ⏳ À faire |

## Ce qui existe

- **Admin** (`/admin`, connexion par mot de passe, réservée aux comptes de la table `admins`) :
  hébergeurs, logements (photo, publication, slug régénérable, module bonnes adresses),
  sections du livret (ordre, activation, FR/EN, photos), base d'adresses (horaires par plages,
  fermetures, date de vérification, archivage), choix des adresses par logement et coups de cœur.
- **Livret voyageur** (`/g/<slug>` → `/fr/...` ou `/en/...`) : accueil, 7 sections, Wi-Fi copiable,
  contacts et urgences, itinéraire (Google Maps, Plans, Waze), bonnes adresses (liste, filtres,
  recherche, carte Leaflet, marchés par jour, fiche).
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

- Bouton « Copier » du Wi-Fi sur un vrai téléphone (testé seulement dans le navigateur intégré).
- Avertissement « N archivée(s) » sur la fiche d'un logement.
- Un blocage unique (2,5 min) au premier enregistrement d'une section, jamais reproduit :
  probablement la première compilation en mode dev.
- Node 20 est en fin de support pour `supabase-js` : passer en Node 22.

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

## Prochaine étape : semaine 4

Proposer le plan avant de coder (règle de `CLAUDE.md`) : PWA et hors connexion (manifest, service worker,
cache du livret et des adresses), QR codes PNG/SVG et carte A6 imprimable, mise en ligne sur Vercel
(variables d'environnement, domaine, URL de redirection Supabase Auth), passe de DA (emblème, détails visuels).
