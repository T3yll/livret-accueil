# Livret d'accueil numérique — contexte projet

Ce fichier est lu automatiquement par Claude Code à chaque session. Il résume le projet ;
les détails sont dans `docs/`.

## Qui et quoi

- Porteur du projet : Rémi Leroi, entrepreneur individuel basé à Fajoles (Lot, 46300), près de Gourdon.
  Bac+3 en développement web. Parle français et anglais.
- Produit : un **livret d'accueil numérique** pour les hébergeurs touristiques professionnels du
  Lot et de la Dordogne (gîtes, chambres d'hôtes, cabanes, petits domaines). Le voyageur scanne un
  QR code et ouvre le livret sur son téléphone, en français ou en anglais, sans application à installer.
- Modèle : un produit de base (le livret) + des modules payants (bonnes adresses, guide du territoire,
  parcours de découverte, statistiques et stratégie de vente, parcours client avant/après séjour).
- Marque provisoire : « Deux Vallées ». **Le nom va changer** : il doit être défini à un seul endroit
  (`src/config/brand.ts`) et jamais écrit en dur ailleurs.

## Objectif de la V1

Une démo montrable en rendez-vous avant le **13 décembre 2026** : le livret de base + le module
« bonnes adresses » (carte, filtres, « ouvert aujourd'hui », coups de cœur), un espace admin réservé
à Rémi, des QR codes, consultation hors connexion. Voir `docs/CAHIER_DES_CHARGES.md`.

Hors V1 : comptes hébergeurs, paiement, statistiques, guide du territoire, parcours, langues autres
que FR/EN. La structure doit cependant prévoir l'activation de modules par logement.

## Stack

- Next.js (App Router) + React + TypeScript
- Supabase (Postgres, Auth, Storage, Row Level Security)
- Tailwind CSS (couleurs et polices en variables CSS, voir la DA)
- Leaflet + tuiles OpenStreetMap pour la carte (pas Google Maps)
- next-intl pour FR/EN
- PWA (manifest + service worker) pour le hors connexion
- Hébergement Vercel
- Icônes : lucide-react
- QR codes : bibliothèque `qrcode`

## Règles de développement

- **Mobile d'abord** : écran de référence 375 px, boutons et zones tactiles d'au moins 44 px.
- **Réseau faible** : les gîtes sont à la campagne. Pages légères, images optimisées (next/image,
  WebP/AVIF), chargement différé, et le livret doit rester consultable hors connexion après une visite.
- **Bilingue partout** : tout texte vu par le voyageur existe en FR et EN ; si l'EN manque, afficher le FR.
  Les textes d'interface passent par next-intl, jamais en dur.
- **Une seule base d'adresses pour tout le territoire** (`places`), partagée par tous les logements ;
  chaque logement n'en garde qu'une sélection (`property_places`).
- **« Ouvert aujourd'hui »** : calculé à partir des horaires hebdomadaires (plusieurs plages par jour
  possibles) et des fermetures (`place_closures`), dans le fuseau **Europe/Paris**. Sans horaires
  fiables : état « horaires à vérifier », jamais une supposition.
- **Aucune donnée inventée** : pas de notes ni d'avis (pas d'étoiles), pas de faux chiffres.
  La valeur, ce sont les coups de cœur de l'hôte.
- **Une section vide ne s'affiche jamais** côté voyageur.
- **Sécurité** : slug public non devinable par logement ; les codes d'accès (boîte à clés, portail)
  n'apparaissent que dans la section Arrivée ; l'admin est protégé par connexion et RLS.
- **RGPD** : pas de cookies de suivi, aucune donnée voyageur collectée en V1.
- **Accessibilité** : contrastes WCAG AA (voir les valeurs vérifiées dans la DA), textes alternatifs,
  navigation clavier dans l'admin.
- L'or (#A48652) est décoratif : jamais pour du texte.
- Commits petits et fréquents, messages en français.

## Documents de référence

- `docs/CAHIER_DES_CHARGES.md` : fonctionnalités, modèle de données, critères de validation, planning
- `docs/DIRECTION_ARTISTIQUE.md` : palette, typographie, composants, écrans (version corrigée)
- `docs/CONTEXTE.md` : contexte métier, terrain, concurrence, décisions déjà prises

## Façon de travailler avec moi

- Avance par étapes courtes, dans l'ordre du planning du cahier des charges.
- Avant une étape importante (schéma de base, structure des dossiers), propose le plan et attends mon accord.
- Explique brièvement ce que tu fais et pourquoi ; je suis développeur, mais pas expert Next.js/Supabase.
