# Idées en réserve et vision à long terme

Ce fichier garde les idées **qui ne sont pas à développer maintenant**. Le périmètre en cours est
dans `docs/BRIEF_V2.md`. Une idée passe d'ici au brief seulement après décision de Rémi.

Dernière mise à jour : 9 novembre 2026 (2e entretien avec Christelle, échange avec l'oncle de Rémi).

## La vision : le partenaire local des hébergeurs

L'avantage n'est pas la technique : c'est **l'ancrage local** (contenu vérifié, connaissance des lieux,
relations avec les prestataires, présence physique). Un outil générique, ou une IA, ne peut pas le copier.
Avis de l'oncle de Rémi : c'est ce qui protège face aux logiciels qui se font rattraper par l'IA.

Trois étages, à construire dans cet ordre :

1. **Le livret d'accueil** (en cours) : produit de base + modules.
2. **L'accompagnement commercial**, d'abord comme service (temps de Rémi), puis outillé :
   suivi des statistiques et des KPI publicitaires, réglages Booking / Airbnb / channel manager.
3. **La mise en relation (apporteur d'affaires)** : le livret recommande des prestataires partenaires ;
   quand un voyageur réserve, le prestataire verse une commission, partagée entre l'hébergeur et Rémi.
   L'hébergeur rentabilise ainsi son abonnement.

### Points de vigilance sur la vision

- **Connexion directe à Booking** : l'accès aux API de Booking est réservé aux éditeurs agréés
  (programme « connectivity partner »), long à obtenir. Passer d'abord par l'export des données ou par le
  channel manager du client (Reservit, etc.), et vérifier leurs API.
- **Commissions d'apporteur d'affaires** : contrat écrit avec chaque prestataire, facturation, et règle
  de partage avec l'hébergeur à définir. À faire valider (CCI ou comptable) avant de lancer.
- **Transparence** : une recommandation rémunérée doit être signalée « Partenaire ». Les coups de cœur de
  Rémi ne se vendent jamais : c'est ce qui fait la confiance.
- **Le bon moment** : ces étages n'ont de valeur qu'avec beaucoup d'hébergeurs équipés (exemple de
  Christelle : avec 150 hébergements, on négocie avec n'importe quel prestataire ; avec 2, non).

## Modules et idées en réserve

### Parcours voyageur

- **Messages de pré-séjour** (J-8, J-3, veille) et de fin de séjour, avec le lien du livret et les dates
  (`?du=&au=`). Airbnb bloque les liens dans sa messagerie : les hébergeurs passent par l'e-mail ou le SMS
  de leur logiciel de réservation. Commencer par fournir des **modèles de messages** à copier-coller.
- **Formulaires** : arrivée tardive, choix des petits-déjeuners, demande de réservation, acceptation des
  conditions avec signature, réponse envoyée par e-mail à l'hébergeur (Nid'en'Ô utilise Tally). En attendant :
  un lien vers le formulaire existant de l'hébergeur dans la section Arrivée.
- **Contenu selon le moment du séjour** (« où j'en suis ») : avant, pendant, après, voire « vous étiez
  hier à… ».

### Personnalisation

- **Recommandations personnalisées** (couple, famille, amis ; envies : ferme ou rando…) : voir
  `docs/CONTEXTE.md`, « Idées pour la V2 ». Version légère : une ou deux questions au plus, dans la
  fenêtre d'accueil.
- **Avatar animé** (au-delà de la photo et de la voix de la V2) et apparitions ciblées (escape game :
  le personnage apparaît au bon endroit).
- **Questions fréquentes par la voix ou un assistant**, nourri uniquement par les infos de l'hébergeur,
  avec « je ne sais pas, appelez l'hôte » quand l'info manque. Jamais de réponse inventée.
- **Voix de synthèse** pour décliner les notes vocales (autres langues, équipements), si la qualité est
  assez bonne pour rester chic.

### Contenu et territoire

- **Vidéos de 3 secondes** des lieux partenaires, tournées par Rémi (argument de démarchage : « je mets
  votre lieu en valeur auprès de mes voyageurs »).
- **Randonnées** avec tracés sur une couche de carte dédiée (et lien vers une appli de randonnée).
- Espagnol, puis autres langues.

### Services payants (« conciergerie à la carte »)

Module de services commandés depuis le livret, rendus par Rémi ou par des partenaires locaux,
avec commission :
- livraison de courses, drive, repas ;
- chauffeur depuis la gare, taxi ;
- babysitting (soirée sans les enfants, mariages à proximité) ;
- massage à domicile, accès à un spa (ex. domaine de Rochebois, Aquasen) ;
- lavage de voiture sur place ;
- pressing ;
- location de vélos, billetterie, expériences.

Notes de Christelle : peu de demandes chacune, mais la proposition compte. Commencer par 10 hébergements
proches, choisis, pour garder le lien. Plus tard, éventuellement des salariés pour les interventions.

### Partenariats et monétisation

- **Deux formules pour les prestataires** : payer pour apparaître en « Partenaire », ou apparaître
  gratuitement en échange de réductions pour les voyageurs (codes promo, sur le modèle des
  expériences Airbnb). À chiffrer.
- **Matériel** : tablettes louées dans les logements, QR codes multiples (table du salon, entrée).
- **Tarifs et modèle économique** : à travailler avec Anne-Laure.

### Autres publics

- **Sites touristiques et offices de tourisme** : la même interface sans partie « logement »
  (grottes, parcs, musées), avec les hébergements recensés autour. Contact possible au département
  via Christelle. Risque : les offices peuvent voir la numérisation comme une concurrence ; la présenter
  comme un outil à leur service.
- Les professionnels du tourisme eux-mêmes : saisir les dates d'un client au téléphone pour voir ce qui
  sera ouvert (déjà possible avec les dates de séjour de la V2).

## Repères concurrence (2e entretien)

- **Conciergerie parisienne (« Even gestion ») vue avec Christelle** : livret clair par grandes
  tuiles à images (assistance, accès, transports, urgences, FAQ, services payants, expériences),
  mais pas ludique et renvoie vers Airbnb. À retenir : on sait tout de suite où chercher.
- Les pages « nos engagements, nos valeurs » sont inutiles : personne ne les lit.
