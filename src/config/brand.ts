// Seul endroit où la marque est écrite. Le nom est provisoire : le changer ici suffit.
export const brand = {
  name: "Deux Vallées",
  productName: "Livret d'accueil",
  territory: "Lot · Dordogne",
  domain: "conciergerie-des-deux-vallees.fr",
  contactEmail: "contact@conciergerie-des-deux-vallees.fr",
} as const;

// Couleurs de la DA là où les variables CSS ne s'appliquent pas (manifest, icônes, carte QR).
// Les mêmes valeurs sont dans globals.css.
export const brandColors = {
  background: "#F7F5EF",
  text: "#292B27",
  muted: "#646A66",
  primary: "#465B48",
  info: "#42677A",
  accent: "#A48652",
  border: "#DED9CD",
} as const;
