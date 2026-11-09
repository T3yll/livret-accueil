# Contexte métier et décisions

## Le projet en bref

Rémi a quitté ses études et son alternance en développement web en août 2026 pour créer son
entreprise. Objectif : en vivre (environ 1 500 €/mois) d'ici **juin 2027**, avec un filet de sécurité
jusqu'à début 2028 (allocations chômage).

Parti d'un projet de conciergerie premium (ménage, gestion Airbnb pour des particuliers), il a pivoté
le 30 octobre 2026 après un entretien avec une gérante de domaine touristique local (cabanes
perchées avec spa à Lamothe-Fénelon, Lot) : la cible devient **les professionnels de
l'hébergement touristique**, et l'offre phare **le livret d'accueil numérique**.

## Ce que le terrain a appris (entretien du 30/10/2026)

- Les hébergeurs paient déjà un livret numérique (~15 €/mois), mais le trouvent insuffisant :
  pas de vraie carte, rien sur ce qui est ouvert, sections vides faute de temps, anglais affiché mais
  non traduit.
- Ils détestent les présentoirs papier de cartes d'activités (encombrants, périmés, les clients
  demandent quand même conseil).
- La saison dure presque toute l'année : au domaine visité, taux d'occupation ~72 % en avril-mai,
  ~58 % en juin, 65–75 % en septembre-octobre ; Toussaint et Noël complets. En hiver les gros sites
  (Rocamadour, Padirac) ferment et les voyageurs croient que « tout est mort » alors que des petits
  acteurs restent ouverts mais ne sont recensés nulle part → forte valeur du « ouvert aujourd'hui ».
- Clientèle : ~70 % de couples, ~25 % de familles, ~5 % PMR ; venus de 3 h de route max ; séjours
  courts (1,2 à 1,8 nuit) ; une part de clients anglais et espagnols, mal accueillis faute d'anglais.
- Idée d'une vidéo / avatar « Rémi, d'ici » qui présente les bons plans : humanise le produit.
- Besoin fort aussi côté commercialisation (statistiques, channel manager, Booking, publicité) :
  la gérante paie environ 12 000 €/an pour deux prestataires. C'est un futur module « service ».
- Réseau local à activer : Club Quatre Saisons (ouverture à l'année), office de tourisme, éductours.

## Décisions prises

- Cible : hébergeurs pros entre Gourdon, Sarlat, Souillac et la vallée de la Dordogne.
- Produit : base (livret) + modules ; V1 = base + bonnes adresses.
- Contenu fait pour l'hébergeur (base d'adresses tenue par Rémi, urgences préremplies, traduction
  incluse) : c'est l'avantage face aux outils génériques à 15 €.
- Pas de notes ni d'avis inventés ; les coups de cœur de l'hôte font la valeur.
- Plus tard : visibilité payante pour les prestataires, toujours signalée « Partenaire » ; la fiche
  de base reste gratuite et les coups de cœur ne se vendent pas.
- Nom définitif à choisir après les premiers retours ; « Deux Vallées » est provisoire.

## Idées pour la V2

### Recommandations personnalisées (idée de Christelle, notée le 2 novembre 2026)

Le livret s'adapte au voyageur (couple, famille, amis…) pour lui recommander les bonnes adresses.
Contrainte de Rémi : **ne pas surcharger le livret**. Principe retenu : personnaliser ce qui existe, ne rien ajouter
de visible.

- **Une seule question, une seule fois**, à la première ouverture : portrait de Rémi, « Vous êtes… » en couple ·
  en famille · entre amis · seul, et « Passer ». Jamais bloquante (Wi-Fi et arrivée restent accessibles).
- **Le carrousel des coups de cœur devient « Ma sélection pour vous »** : même place, même look ; les adresses
  adaptées passent devant, avec la raison sur la carte (« Idéal en famille »). Sous le titre : « Pour une famille ·
  modifier », pour affiner (âge des enfants, envies) sans l'imposer.
- **Sur la carte, la pastille « Coups de cœur » devient « Pour vous »**.
- Pas de question si le logement ne reçoit qu'un type de public (ex. gîte pour 2) : réglage « logement pour… » dans l'admin.
- **Fonctionnement** : étiquettes sur chaque adresse dans l'admin (pour qui, thèmes, PMR, temps de pluie) et score
  calculé dans le navigateur. Pas d'IA : hors connexion, gratuit, aucune recommandation inventée.
- **RGPD** : les réponses restent sur le téléphone, rien n'est envoyé.
- **Modèle** : module payant « Conseiller personnalisé », activable par logement.
- **Avant de développer** : demander aux 3 hébergeurs de la démo si ça les intéresse.

### Retours du 2e entretien avec Christelle (9 novembre 2026)

Synthèse et décisions dans `docs/BRIEF_V2.md` (ce qu'on développe) et `docs/IDEES_ET_VISION.md`
(ce qu'on garde pour plus tard). En bref : la V1 est belle et claire mais encore « sans vie » ;
priorité à la personnification (Rémi, notes vocales), aux dates de séjour (ne montrer que ce qui
sera ouvert) et à la préparation du séjour (les voyageurs ne lisent pas). Christelle et Anne-Laure
veulent voir la V2 la première quinzaine de décembre 2026.

## Concurrence observée

- notre.guide (outil utilisé par le domaine visité) : menu latéral de 12 rubriques, liens vers
  Google Maps/Waze au lieu d'une carte, horaires statiques, pas de recherche ni de filtre,
  sections vides, emojis. Bons points à reprendre : téléchargement hors connexion, bouton
  « Réserver », marchés par jour, temps de trajet vers gares et aéroports, formulaire d'arrivée tardive.

## Ressources existantes

- Domaine : conciergerie-des-deux-vallees.fr ; email contact@conciergerie-des-deux-vallees.fr
- Micro-entreprise : Rémi Leroi, SIREN 948 211 727
