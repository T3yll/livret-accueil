# Cahier des charges — Livret d'accueil numérique V1

31 octobre 2026 · Rémi Leroi

## Contexte et objectif

La V1 est un livret d'accueil numérique pour les hébergements touristiques du Lot et de la Dordogne (gîtes, chambres d'hôtes, cabanes, petits domaines). Le voyageur l'ouvre en scannant un QR code, en français ou en anglais. Objectif : une démo prête à montrer en rendez-vous avant le **13 décembre 2026**.

**Le problème observé sur le terrain :**

- Les hébergeurs répondent sans cesse aux mêmes questions (arrivée, Wi-Fi, équipements, où manger).
- Les présentoirs papier remplis de cartes d'activités sont encombrants, vite périmés, et les voyageurs ne savent pas quoi choisir.
- Hors saison, les gros sites ferment : les voyageurs croient que « tout est mort », alors que des adresses restent ouvertes sans être recensées.
- Les outils de livret existants (autour de 15 €/mois) n'ont pas de contenu local ni de recommandations personnelles.

**La réponse :** un produit de base (le livret), enrichi de modules payants. La V1 contient la base et le premier module, les bonnes adresses avec carte et « ouvert aujourd'hui ».

**Modèle visé (hors V1) :** abonnement mensuel par établissement pour la base, modules en option (guide du territoire, parcours, statistiques et stratégie de vente, parcours client avant et après séjour), et plus tard visibilité payante, toujours signalée, pour les prestataires.

## Utilisateurs et parcours

| Profil | Qui | Ce qu'il fait dans la V1 |
| --- | --- | --- |
| Voyageur | Couples et familles, souvent à moins de 3 h de route ; une part de clients étrangers (anglais, espagnols) | Consulte le livret sur son téléphone, sans compte ni installation |
| Hébergeur | Gérant d'un ou plusieurs logements | Reçoit son livret et ses QR codes, envoie ses contenus ; ne se connecte pas en V1 |
| Administrateur | Rémi | Crée et remplit les livrets, gère la base d'adresses du territoire |

**Parcours du voyageur :**

1. Il reçoit le lien avant son arrivée (message de réservation) ou scanne le QR code sur place.
2. Le livret s'ouvre dans sa langue (détectée automatiquement, modifiable).
3. Il trouve en quelques secondes l'arrivée, le Wi-Fi et les consignes.
4. Il ouvre les bonnes adresses, voit ce qui est ouvert aujourd'hui, filtre par type et lance l'itinéraire.
5. Il ajoute le livret à son écran d'accueil et le consulte même sans réseau.

**Parcours de l'administrateur :**

1. Il crée un hébergeur, puis ses logements.
2. Il remplit les sections du livret en français et en anglais.
3. Il choisit les adresses du logement dans la base commune et marque ses coups de cœur.
4. Il prévisualise, publie, puis télécharge le QR code à imprimer.

## Périmètre

| Dans la V1 | Pas dans la V1 |
| --- | --- |
| Livret de base, côté voyageur, FR/EN | Création de compte et saisie par les hébergeurs eux-mêmes |
| Module bonnes adresses avec carte, filtres et « ouvert aujourd'hui » | Paiement en ligne et abonnements |
| Base d'adresses commune à tout le territoire | Guide du territoire (vidéos, articles) |
| Coups de cœur par logement | Parcours de découverte et jeux |
| QR code par logement | Statistiques de consultation détaillées |
| Espace admin réservé à l'administrateur | Messages automatiques avant et après séjour |
| Consultation hors connexion (PWA) | Visibilité payante pour les prestataires |
| Un livret de démonstration complet (gîte fictif du secteur) | Langues autres que français et anglais |

La structure de la V1 doit déjà prévoir l'activation de modules par logement, pour pouvoir ajouter les extensions sans tout refaire.

### Ce que la V1 corrige par rapport à l'outil actuel

Analyse du livret utilisé par un domaine local (notre.guide), consulté le 31 octobre 2026. Une bonne partie des défauts vient du contenu non rempli, faute de temps : l'outil ne suffit pas, il faut aussi le contenu.

| Constat sur l'outil actuel | Ce que fait la V1 |
| --- | --- |
| Pas de carte intégrée, seulement des liens vers Google Maps et Waze | Carte intégrée de toutes les adresses, itinéraire en un geste |
| Horaires statiques, aucun « ouvert / fermé » | Filtre « Ouvert aujourd'hui » calculé avec les horaires et les fermetures |
| Aucune recherche, aucun filtre | Filtres par catégorie, recherche par nom |
| Sections vides (urgences, manger, commodités, événements, météo) | Base d'adresses du territoire tenue par Rémi ; urgences préremplies ; une section vide ne s'affiche pas |
| Anglais proposé mais contenu uniquement en français | Traduction anglaise incluse dans le service |
| Wi-Fi et horaires d'accueil manquants, incohérences | Champs essentiels obligatoires avant publication, relecture incluse |
| Pas de date de mise à jour | « Horaires vérifiés le … » sur chaque adresse |
| Emojis et icônes hétérogènes | Jeu d'icônes unique issu de la DA |

**À garder de l'outil actuel :** téléchargement pour le hors connexion, fiches avec bouton « Réserver », marchés classés par jour, temps de trajet vers gares et aéroports, formulaire d'arrivée tardive.

**Pistes de modules futurs :** météo, agenda des événements alimenté par l'office de tourisme, services payants de l'établissement (massages, petit-déjeuner, location de Wi-Fi) réservables depuis le livret.

## Fonctionnalités côté voyageur

Tout tient sur un téléphone, sans compte, et l'essentiel s'atteint en deux gestes au plus.

### Accueil du livret

- [ ] Photo du logement, nom, message de bienvenue de l'hébergeur
- [ ] Accès direct aux 4 infos les plus demandées : arrivée, Wi-Fi (avec bouton copier), contact, adresse
- [ ] Choix de la langue FR/EN, détection automatique au premier affichage

### Sections du livret de base

Chaque section est activable ou non par logement, et réordonnable.

- [ ] **Arrivée** : horaires, accès, parking, boîte à clés ou remise des clés, lien d'itinéraire, vidéo d'accès facultative
- [ ] **Wi-Fi** : nom du réseau, mot de passe, copie en un geste
- [ ] **Le logement** : présentation, pièces, règles de la maison
- [ ] **Équipements** : mode d'emploi (chauffage, spa, poêle, lave-linge…), avec photo ou courte vidéo
- [ ] **Départ** : heure, consignes (clés, poubelles, lave-vaisselle)
- [ ] **Contacts utiles** : hébergeur, urgences (15, 18, 112), médecin, pharmacie de garde
- [ ] **Infos pratiques** : tri des déchets, commerces de base, horaires utiles

### Module bonnes adresses

- [ ] Liste et carte (OpenStreetMap) des adresses choisies pour ce logement
- [ ] Catégories : restaurants, producteurs et marchés, commerces, activités, sites à visiter, sorties en famille
- [ ] Filtre **« Ouvert aujourd'hui »**, basé sur les horaires et les fermetures saisonnières
- [ ] **Coups de cœur** de l'hébergeur mis en avant, avec son commentaire personnel
- [ ] Distance depuis le logement
- [ ] Fiche d'une adresse : photo, description, horaires, téléphone, site, bouton itinéraire (ouvre l'application de navigation)
- [ ] Mention « Horaires vérifiés le … » pour la confiance
- [ ] Recherche par nom et marchés classés par jour de la semaine
- [ ] Section **Urgences** préremplie selon la commune (15, 18, 112, pharmacie de garde, hôpital le plus proche)
- [ ] Une section sans contenu ne s'affiche jamais

### Hors connexion

- [ ] Le livret et la liste des adresses restent consultables sans réseau après une première visite
- [ ] Invitation discrète à ajouter le livret à l'écran d'accueil

## Espace d'administration

En V1, seul l'administrateur se connecte ; l'interface vise la rapidité de saisie, pas la beauté.

- [ ] Connexion sécurisée (email + lien magique ou mot de passe)
- [ ] **Hébergeurs** : créer, modifier, lister (nom, contact, notes)
- [ ] **Logements** : rattachés à un hébergeur ; nom, adresse et coordonnées GPS, photo principale, message de bienvenue
- [ ] **Sections du livret** : texte en FR et EN côte à côte, ajout de photos ou vidéos, activer, désactiver, réordonner
- [ ] **Base d'adresses** commune : créer, modifier, archiver un lieu ; catégorie, coordonnées, horaires par jour, périodes de fermeture, date de dernière vérification
- [ ] **Sélection par logement** : choisir des adresses dans la base, marquer les coups de cœur, ajouter un commentaire personnel
- [ ] **Modules** : activer ou désactiver « bonnes adresses » par logement
- [ ] **Prévisualisation** du livret tel que le voit le voyageur, en FR et EN
- [ ] **Publication** : brouillon ou publié
- [ ] **QR code** : téléchargement en PNG et SVG, avec une version à imprimer (carte A6 aux couleurs de la marque)
- [ ] Signalement des adresses dont les horaires n'ont pas été vérifiés depuis plus de 3 mois

## Modèle de données

Le choix central : **une seule base d'adresses pour tout le territoire**, partagée par tous les livrets. Un lieu est mis à jour une fois pour tous, et chaque logement n'en garde qu'une sélection.

| Table | Champs principaux | Lien |
| --- | --- | --- |
| `hosts` (hébergeurs) | nom, contact, téléphone, email, notes | — |
| `properties` (logements) | host_id, nom, slug public, adresse, lat/lng, photo, message d'accueil FR/EN, statut (brouillon/publié) | appartient à un hébergeur |
| `guide_sections` | property_id, type (arrivée, wifi, équipements…), titre FR/EN, contenu FR/EN, médias, ordre, actif | appartient à un logement |
| `places` (lieux) | nom, catégorie, description FR/EN, adresse, lat/lng, téléphone, site, photo, horaires hebdomadaires, dernière vérification, archivé | commun à tous |
| `place_closures` | place_id, date de début, date de fin, motif | fermetures saisonnières d'un lieu |
| `property_places` | property_id, place_id, coup de cœur (oui/non), commentaire FR/EN, ordre | sélection d'un logement |
| `property_modules` | property_id, module (ex. `places`), actif, dates | modules activés |

**Règles :**

- Les horaires sont stockés par jour de la semaine, avec plusieurs plages possibles (midi et soir). « Ouvert aujourd'hui » croise les horaires du jour et les fermetures en cours, dans le fuseau Europe/Paris.
- Tous les textes visibles par le voyageur existent en FR et en EN. Si l'anglais manque, le français s'affiche.
- Le slug public du logement est non devinable (ex. `/g/k7p2-moulin-de-xxx`), pour éviter qu'on consulte les codes Wi-Fi et d'accès des autres logements.
- Les codes d'accès sensibles (boîte à clés, portail) ne s'affichent pas sur la page d'accueil du livret, uniquement dans la section Arrivée.

## Exigences techniques

| Besoin | Choix |
| --- | --- |
| Application (voyageur + admin) | Next.js, React, TypeScript |
| Base de données, connexion, fichiers | Supabase (Postgres, Auth, Storage, règles d'accès par ligne) |
| Style | Tailwind CSS |
| Carte | Leaflet + tuiles OpenStreetMap |
| Langues | next-intl, FR et EN |
| Hors connexion | PWA (manifest + service worker) |
| Hébergement | Vercel, domaine conciergerie-des-deux-vallees.fr ou sous-domaine dédié |
| QR codes | Génération côté serveur (bibliothèque `qrcode`) |

- **Mobile d'abord** : conçu pour un écran de 375 px, lisible sans zoom, boutons d'au moins 44 px.
- **Rapide sur un réseau faible** : page d'accueil du livret sous 2 secondes en 4G moyenne, images compressées et redimensionnées.
- **Accessibilité** : contrastes suffisants, navigation au clavier dans l'admin, textes alternatifs sur les images.
- **Sécurité** : admin protégé par connexion, règles d'accès Supabase, aucune donnée de voyageur collectée en V1.
- **RGPD** : pas de cookies de suivi ; mentions légales et page de confidentialité accessibles depuis le livret.
- **Identité visuelle** : voir `DIRECTION_ARTISTIQUE.md` ; couleurs et polices centralisées dans des variables pour pouvoir, plus tard, personnaliser le livret aux couleurs de chaque hébergeur.

## Validation, planning et questions ouvertes

### La V1 est terminée quand

- [ ] Un livret de démonstration complet est en ligne, en FR et EN, pour un gîte fictif du secteur Gourdon–Sarlat
- [ ] La base contient au moins 30 adresses réelles du secteur, dont 15 ouvertes hors saison, avec horaires vérifiés
- [ ] « Ouvert aujourd'hui » donne le bon résultat sur 10 adresses testées à la main
- [ ] Le livret se consulte sans réseau après une première visite
- [ ] Un nouveau livret se crée et se publie en moins de 30 minutes depuis l'admin
- [ ] Le QR code imprimé ouvre le bon livret sur iPhone et Android
- [ ] 3 hébergeurs l'ont vu et ont fait leurs retours

### Planning indicatif (à temps partiel)

| Semaine | Livrable |
| --- | --- |
| 2 → 8 novembre | Projet initialisé, base de données, admin hébergeurs et logements |
| 9 → 15 novembre | Sections du livret, affichage voyageur FR/EN |
| 16 → 22 novembre | Base d'adresses, carte, « ouvert aujourd'hui », coups de cœur |
| 23 → 29 novembre | PWA hors connexion, QR codes, mise en ligne, DA appliquée |
| 30 nov. → 13 déc. | Saisie des 30 adresses, livret de démo, rendez-vous avec 3 hébergeurs |

### Questions ouvertes

- Quelles questions les voyageurs posent-ils le plus ? (demandé à Christelle, à compléter avec les 3 hébergeurs)
- Nom du produit : sous la marque Deux Vallées, ou un nom propre ?
- Domaine : sous-domaine du site actuel ou domaine dédié ?
- Personnalisation aux couleurs de chaque hébergeur : en option plus tard, ou dès la base ?
