# Direction artistique — Livret d'accueil numérique (version corrigée)

Version de référence pour le développement. Basée sur la DA « L'élégance des maisons de campagne »,
avec les corrections de contraste et de cohérence. **En cas de conflit avec une maquette image,
ce document fait foi.**

## Concept

Un petit guide privé du territoire, préparé par quelqu'un du coin. Interface claire et lumineuse,
lisible en plein jour ; la marque (charbon et or) signe l'expérience sans prendre le dessus sur
l'identité de chaque hébergement.

Quatre principes : clarté, authenticité, hospitalité, discrétion.

## Palette (contrastes vérifiés sur fond ivoire #F7F5EF)

| Rôle | Nom | Hex | Contraste | Usage |
| --- | --- | --- | --- | --- |
| Fond | Ivoire calcaire | `#F7F5EF` | — | Fond des pages |
| Surface | Blanc | `#FFFFFF` | — | Cartes, champs |
| Surface secondaire | Pierre naturelle | `#EAE6DC` | — | Encarts, fonds d'icônes |
| Texte | Charbon | `#292B27` | 13,1 | Titres et textes |
| Texte secondaire | Gris ardoise | `#646A66` | 5,1 | Métadonnées |
| Principale | Vert sauge foncé | `#465B48` | 6,8 | Boutons, navigation, liens ; texte blanc dessus : 7,4 |
| Signature | Or champagne | `#A48652` | 3,2 | **Décor uniquement** (filets, emblème) — jamais de texte |
| Ouvert | Vert foncé | `#286344` | 6,5 | Badge « Ouvert aujourd'hui » |
| Fermé | Gris ardoise | `#646A66` | 5,1 | Badge « Fermé aujourd'hui » |
| Coup de cœur | Terre cuite | `#A34F3D` | 5,2 | Icône et accents coup de cœur |
| Fond coup de cœur | Rosé pierre | `#F4ECE4` | — | Encart des recommandations de l'hôte |
| Information | Bleu ardoise | `#42677A` | 5,6 | « Horaires à vérifier », infos |
| Séparateurs | Beige pierre | `#DED9CD` | — | Bordures, filets |

Répartition indicative : 65 % ivoire et blanc, 20 % photos et pierre, 10 % vert, 5 % charbon et or.

Ne pas utiliser les couleurs vives de la maquette image (#16A34A, #DC2626, #F59E0B, #D4AF6A) :
contraste insuffisant.

## Variables CSS

```css
:root {
  --color-background: #F7F5EF;
  --color-surface: #FFFFFF;
  --color-stone: #EAE6DC;
  --color-text: #292B27;
  --color-muted: #646A66;
  --color-primary: #465B48;
  --color-accent: #A48652;
  --color-open: #286344;
  --color-closed: #646A66;
  --color-favorite: #A34F3D;
  --color-favorite-bg: #F4ECE4;
  --color-info: #42677A;
  --color-border: #DED9CD;

  /* personnalisation par hébergeur (plus tard) : retombent sur la marque */
  --host-primary: var(--color-primary);
  --host-accent: var(--color-accent);

  --font-heading: "Cormorant Garamond", Georgia, serif;
  --font-body: "DM Sans", system-ui, sans-serif;
}
```

## Typographie (Google Fonts)

- Titres : **Cormorant Garamond** 500 (600 pour les titres de fiches)
- Texte et interface : **DM Sans** 400 (500–600 pour boutons et libellés)

| Élément | Taille | Police |
| --- | --- | --- |
| Titre d'accueil | 32 px | Cormorant Garamond 500 |
| Titre de section | 28 px | Cormorant Garamond 500 |
| Titre de fiche | 24 px | Cormorant Garamond 600 |
| Sous-titre | 18 px | DM Sans 600 |
| Texte courant | 16 px | DM Sans 400 |
| Texte secondaire | 14 px | DM Sans 400 |
| Légende (non essentielle) | 12 px | DM Sans 500 |
| Bouton | 15 px | DM Sans 600 |

Rien d'utile au voyageur en dessous de 14 px.

## Icônes et carte

- **Lucide** (lucide-react), trait 1,75–2 px, 20–24 px, charbon ou vert ; fond circulaire pierre
  pour les catégories.
- Catégories : restaurant `utensils`, producteur `wheat`, activité `footprints`, site `landmark`,
  Wi-Fi `wifi`, arrivée `key-round`, départ `door-open`, équipement `flame`, coup de cœur `heart`.
- Marqueurs : ronds 32–36 px, fond ivoire, contour vert foncé, icône au centre ; sélectionné :
  fond vert, icône blanche ; coup de cœur : petite pastille terre cuite. Pas de marqueurs multicolores.

## Composants

- **Carte d'une adresse** : photo, nom, catégorie, distance, badge d'ouverture, coup de cœur éventuel,
  courte description ; toute la carte est cliquable. **Pas de notes ni d'avis.**
- **Badge d'ouverture** : 3 états — ouvert (`#286344`), fermé (`#646A66`), horaires à vérifier (`#42677A`).
  Toujours texte + couleur, jamais la couleur seule.
- **Coup de cœur** : encart `#F4ECE4`, icône cœur `#A34F3D`, citation de l'hôte.
- **Wi-Fi** : réseau et mot de passe visibles en clair, bouton « Copier », retour « Mot de passe copié ».
- **Sélecteur de langue** : discret, FR / EN en V1 (ES plus tard).

## Écrans de la V1

1. **Accueil** : grande photo, emblème discret, « Bienvenue », message de l'hôte, accès directs à
   Arrivée, Wi-Fi, Contact, Bonnes adresses ; sélecteur de langue.
2. **Arrivée** : adresse et accès, horaires, code ou remise des clés, Wi-Fi, équipements, départ, contact.
3. **Bonnes adresses** : « Bonnes adresses autour de vous », filtres (Tout, Restaurants, Producteurs,
   Activités, Patrimoine), bascules « Ouvert aujourd'hui » et « Coups de cœur », vue liste / carte
   (liste par défaut, filtres conservés au changement de vue).
4. **Fiche d'une adresse** : photo, nom, catégorie, distance, horaires et état, description,
   mot de l'hôte, téléphone, site, « Itinéraire ».
5. **Wi-Fi** : écran dédié avec copie.

## Règles d'interface

Mobile-first 375 px · boutons ≥ 44 px (idéal 48) · rayons de cartes 12–16 px · espacements en
multiples de 4/8 · largeur max du contenu 600–700 px sur grand écran · barre de navigation en bas
si utile · images en chargement différé · gestion des erreurs réseau.

## Carte QR imprimée (A6, 105 × 148 mm)

Recto : emblème, « Livret d'accueil », « Bienvenue chez vous », QR code grand avec marge blanche,
« Scannez pour découvrir votre livret », « LOT · DORDOGNE ».
Verso : nom du logement, adresse web du livret, message de l'hôte, contact.
Papier crème mat 300–350 g. Tester le QR sur plusieurs téléphones avant impression.

## Personnalisation (après la V1)

Niveau plateforme (marque) : emblème, typographie, composants. Niveau logement : nom, photos,
couleur secondaire (`--host-primary`, `--host-accent`), message, coups de cœur, logo éventuel.
