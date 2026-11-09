# Brief V2 — Un livret vivant

Rédigé le 9 novembre 2026, à partir des retours de Christelle (2e entretien, démo de la V1) et des
idées de Rémi. **À lire avec `CLAUDE.md`.** Les idées écartées ou reportées sont dans
`docs/IDEES_ET_VISION.md` : ne pas les développer maintenant.

## Objectif

Présenter la V2 à Christelle et Anne-Laure **la première quinzaine de décembre 2026** (date à caler).
Cible de développement : **démo prête le 5 décembre**.

Verdict de Christelle sur la V1 : belle, claire, la carte en vue principale est appréciée, mais
« il n'y a pas plus de fonctionnalités que sur les livrets existants » et c'est encore « sans vie ».

**Le cap de la V2 : rendre le livret humain et vivant, sans le surcharger.**

Trois constats du terrain guident tout :
1. **Les voyageurs ne lisent pas.** Icônes, phrases courtes, et de la voix plutôt que des paragraphes.
2. **La pire déception, c'est l'adresse fermée.** Le livret doit montrer ce qui sera ouvert *pendant le séjour*.
3. **Les questions arrivent quand ils font la valise**, pas une fois sur place.

Garde-fous (non négociables) :
- **Chic mais accessible** : doit convenir à un domaine haut de gamme comme à une chambre d'hôtes.
- **Rien de plus à l'écran qu'aujourd'hui sans retirer autre chose.** Tout ajout s'intègre à un
  élément existant ou se replie.
- Pas de page « nos valeurs » : l'identité se ressent dans le ton et le visuel.
- Rien d'inventé : pas d'IA qui génère des réponses ou des recommandations en V2.

## Avant tout : finir la V1 (prioritaire)

Ces points restent bloquants pour toute démo (voir `docs/AVANCEMENT.md`, « Prochaine étape ») :

- [ ] Vérifier les horaires des 30 adresses (indispensable : la V2 filtre sur les dates de séjour)
- [ ] Domaine définitif + `NEXT_PUBLIC_SITE_URL` avant tout tirage de carte QR
- [ ] Mentions légales et confidentialité accessibles depuis le livret

## Périmètre de la V2, par priorité

### P1 — Indispensable pour la démo de décembre

#### 1. L'accueil personnifié : Rémi présente le logement

Le cœur de la V2. Un accueil humain qui apparaît **une seule fois**, à la première ouverture.

- Une **fenêtre d'accueil** élégante (pas un pop-up agressif) : portrait de Rémi, quelques mots,
  et une **note vocale** à écouter.
- Le texte et la voix suivent ce schéma : « Bonjour, je suis Rémi. Pascal et Brigitte, les
  propriétaires de ce gîte, m'ont confié leurs petits coins préférés pour vous. » Les prénoms des
  hôtes viennent de la fiche hébergeur.
- Bouton principal vers la suite (voir point 2), et « Passer ». Jamais bloquant : arrivée et Wi-Fi
  restent accessibles. Rouvrable ensuite depuis le portrait de Rémi sur l'accueil.
- **Notes vocales** : de vrais enregistrements (Rémi ou les hôtes), téléversés dans l'admin
  (Storage Supabase, MP3/M4A, courts : 30 à 60 s). Une version FR et une EN. Pas de voix de synthèse
  en V2.
- Lecteur audio sobre, aux couleurs de la DA, avec la transcription repliable (accessibilité,
  et pour ceux qui ne peuvent pas écouter).
- Les fichiers audio sont mis en cache pour le hors connexion, comme les photos déjà vues.

#### 2. Les dates de séjour : on ne montre que ce qui sera ouvert

Idée la plus forte de l'entretien.

- Juste après l'accueil (étape 1) : « Vous êtes là du … au … ? » avec un sélecteur de dates simple.
  Facultatif (« Passer »), modifiable ensuite depuis un bandeau discret (« Votre séjour : 12 → 15 déc. · modifier »).
  **Décision du 9 novembre** : les dates restent facultatives (accès au code et au Wi-Fi jamais bloqué), mais sans
  dates, un rappel visible s'affiche sur l'accueil, la carte et la liste. La fenêtre d'accueil commence par le choix
  de la langue.
- **Les dates peuvent arriver par le lien** : `…/g/<slug>?du=2026-12-12&au=2026-12-15`, pour que
  l'hébergeur les mette dans son message de pré-séjour. Dans ce cas, on ne pose pas la question.
- Avec des dates, la carte et la liste des bonnes adresses s'ouvrent filtrées sur
  **« Ouvert pendant votre séjour »** : un lieu est gardé s'il est ouvert au moins un des jours du séjour,
  et sa fiche indique les jours d'ouverture (« Ouvert mar. et jeu. pendant votre séjour »).
- Le filtre « Ouvert aujourd'hui » existant reste disponible.
- Les adresses aux horaires non vérifiés restent visibles avec « Horaires à vérifier », jamais
  présentées comme ouvertes.
- Stockage : sur le téléphone uniquement (`localStorage`), rien n'est envoyé (RGPD).
- Réutiliser `src/lib/opening-hours.ts` (fuseau Europe/Paris), avec des tests pour une plage de dates.

#### 3. « Préparer mon séjour » : la valise

Nouvelle section du livret, la première affichée **avant l'arrivée** (si les dates sont connues et
que l'arrivée est dans le futur), sinon accessible normalement.

- **Ce qui est fourni** : liste à icônes, réponses en oui/non (draps, serviettes, café et type de
  cafetière, savon, sèche-cheveux, lit bébé, toilettes sèches, etc.). Saisie en cases à cocher dans l'admin.
- **À ne pas oublier** : courte liste éditable (pull pour les soirées fraîches, anti-moustique,
  chaussons…).
- **Venir jusqu'ici** : en voiture (adresse, itinéraire), en train (gare la plus proche, temps de trajet,
  taxi conseillé).
- Phrases de 10 mots maximum par ligne. Pas de paragraphe.

#### 4. Coups de cœur : retrouver l'icône

Retour précis de Christelle : sur la carte, le cœur remplace l'icône de catégorie et on ne sait plus ce
qu'est le lieu.

- Garder **l'icône de catégorie** dans le marqueur, entourée d'un **anneau terre cuite** (#A34F3D) pour
  le coup de cœur, sur le même principe que l'anneau doré du logement.
- Garder le carrousel « Les coups de cœur de Rémi » sur l'accueil (validé : « méga pertinent »).

#### 5. Catégories qui correspondent aux vraies questions

Ce que les voyageurs demandent le plus : randonnées, cheval, vélo, courses, sorties enfants, pharmacie,
transport.

- **Corriger** les icônes mal attribuées (des musées affichent l'icône « randonnée »). Revoir la
  correspondance catégorie → icône, et la catégorie des 30 adresses.
- **Nouvelles catégories** (migration de l'enum `place_category`) : `hiking` (randonnées),
  `horse_riding` (équitation), `bike_rental` (location de vélos), `kids_leisure` (parcs aquatiques,
  accrobranche, loisirs enfants), `groceries` (courses), `pharmacy` (pharmacie), `transport` (taxi, gare).
- **Infos pratiques des commerces** : cases « Livre à domicile », « Drive », « Sur réservation », et un
  champ libre court (ex. « Livraison 7 €, le soir même »). Affichées en pictogrammes sur la fiche.
- Les catégories restent regroupées en peu de filtres à l'écran (5 ou 6 chips maximum) pour ne pas surcharger.

#### 6. QR code vers une page précise

- Dans l'admin, générer un QR code pour une page donnée du livret : la carte des bonnes adresses,
  une section (ex. Équipements, Wi-Fi). Usage : un QR sur la table du salon qui ouvre directement la carte.
- La carte A6 propose de choisir la page cible.

### P2 — Si le temps le permet avant le 5 décembre

#### 7. Expériences à vivre

Ce qui sort du commun et que les voyageurs ne trouvent pas seuls : visite nocturne du parc animalier
de Gramat, gouffre de Padirac aux flambeaux, repas dans les grottes de Presque, ateliers (vitrail,
cuisine), dégustations chez un producteur.

- Une étiquette **« Expérience »** sur un lieu (pas une catégorie à part), avec un encart distinct sur l'accueil
  ou dans les bonnes adresses.
- Les expériences ont souvent **des dates précises** (un soir par semaine l'été, quelques soirs l'hiver) :
  ajouter des **occurrences datées** (table `place_events` : lieu, date, heure, description FR/EN, lien de
  réservation). Avec les dates de séjour, n'afficher que celles qui tombent pendant le séjour.

#### 8. Équipements : écouter plutôt que lire

- Dans la section Équipements, chaque équipement peut avoir une **note vocale** et une photo du bouton à utiliser.
- **Bibliothèque d'équipements réutilisables** dans l'admin (Nespresso, Senseo, micro-ondes, sèche-linge de
  telle marque…) : on rédige une fois, on ajoute à plusieurs logements, on adapte si besoin.

#### 9. Randonnées : une vue dédiée

Il y en a trop pour la carte principale.

- Les randonnées n'apparaissent pas sur la carte par défaut : un filtre ou un onglet « Randonnées »
  affiche **une sélection courte** (5 à 10), avec point de départ, durée, distance, difficulté, lien vers
  la fiche officielle ou la trace (GPX).
- Pas de tracé complet sur la carte en V2.

### Hors V2 (voir `docs/IDEES_ET_VISION.md`)

Chatbot ou FAQ par IA, services payants (babysitting, massage, lavage de voiture, livraison de courses,
chauffeur), formulaires (arrivée tardive, petits-déjeuners, réservation), codes promo partenaires,
version pour les sites touristiques et offices de tourisme, messages automatiques de pré-séjour,
recommandations personnalisées complètes (profil du voyageur), comptes hébergeurs, paiement.

## Changements de données (à valider par une proposition de migration)

- `hosts` : prénoms des hôtes à afficher (`display_names`, ex. « Pascal et Brigitte »).
- `properties` : notes vocales d'accueil FR/EN (chemins Storage), transcriptions FR/EN, gare la plus
  proche et temps de trajet, réglages « Préparer mon séjour ».
- Nouvelle section de livret de type `prepare` (données structurées : fourni oui/non, à emporter, accès).
- `place_category` : nouvelles valeurs (voir point 5).
- `places` : `delivers`, `has_drive`, `booking_required`, `practical_note` FR/EN, `is_experience`.
- (P2) `place_events`, `equipment_templates` + lien logement ↔ équipements, note vocale par équipement.
- Mettre à jour `get_guide(slug)` pour exposer ces champs, sans jamais exposer de donnée sensible.
- Tests : plage de dates (« ouvert pendant le séjour »), paramètres d'URL, RLS des nouvelles tables.

## Critères de validation de la V2

- [ ] À la première ouverture, l'accueil de Rémi apparaît, la note vocale se lit sur iPhone et Android,
      et ne réapparaît plus ensuite ; « Passer » fonctionne.
- [ ] Avec `?du=…&au=…` dans le lien, la carte s'ouvre filtrée sur le séjour sans poser de question.
- [ ] Pour un séjour de décembre, les sites fermés l'hiver n'apparaissent pas (vérifié à la main sur 5 lieux).
- [ ] « Préparer mon séjour » se lit en moins de 30 secondes.
- [ ] Les coups de cœur gardent leur icône de catégorie avec l'anneau terre cuite.
- [ ] Les 30 adresses ont la bonne catégorie et la bonne icône.
- [ ] Un QR code ouvre directement la carte des bonnes adresses.
- [ ] L'écran d'accueil du livret n'a pas plus d'éléments visibles qu'en V1 (hors fenêtre d'accueil).
- [ ] Tout fonctionne hors connexion après une première visite, audio compris.

## À préparer côté Rémi (contenu, hors dev)

- Enregistrer la note vocale d'accueil du gîte de démo, en FR et en EN (téléphone, pièce calme, 30–45 s).
- Une photo portrait pour `curator.photo`.
- Rechercher 5 à 10 randonnées, 2 ou 3 centres équestres, loueurs de vélos, drive et livraison de courses
  (Leclerc et Carrefour de Gourdon), taxis, pharmacies du secteur.
- Repérer 5 expériences à vivre de l'hiver et du printemps (avec leurs dates).
