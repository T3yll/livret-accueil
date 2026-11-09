import {
  Bike,
  Bus,
  createLucideIcon,
  FerrisWheel,
  Hospital,
  Landmark,
  Mountain,
  Pill,
  ShoppingBasket,
  ShoppingCart,
  Store,
  Ticket,
  ToyBrick,
  Utensils,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import type { PlaceCategory } from "@/lib/places-view";

// Lucide n'a pas d'icône de cheval : un fer à cheval, au même format que les autres.
const Horseshoe = createLucideIcon("Horseshoe", [
  ["path", { d: "M8 21H5.5C3.5 16 3 9 6.5 5.5a8 8 0 0 1 11 0C21 9 20.5 16 18.5 21H16c1.5-5 2-10-.5-12.5a5 5 0 0 0-7 0C6 11 6.5 16 8 21Z", key: "horseshoe" }],
]);

// Jeu d'icônes de la DA pour les catégories (lucide-react).
export const CATEGORY_ICONS: Record<PlaceCategory, LucideIcon> = {
  restaurant: Utensils,
  producer: Wheat,
  market: ShoppingBasket,
  shop: Store,
  activity: Ticket,
  heritage: Landmark,
  family: FerrisWheel,
  health: Hospital,
  hiking: Mountain,
  horse_riding: Horseshoe,
  bike_rental: Bike,
  kids_leisure: ToyBrick,
  groceries: ShoppingCart,
  pharmacy: Pill,
  transport: Bus,
};
