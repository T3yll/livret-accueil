import {
  FerrisWheel,
  Footprints,
  Hospital,
  Landmark,
  ShoppingBasket,
  Store,
  Utensils,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import type { PlaceCategory } from "@/lib/places-view";

// Jeu d'icônes de la DA pour les catégories (lucide-react).
export const CATEGORY_ICONS: Record<PlaceCategory, LucideIcon> = {
  restaurant: Utensils,
  producer: Wheat,
  market: ShoppingBasket,
  shop: Store,
  activity: Footprints,
  heritage: Landmark,
  family: FerrisWheel,
  health: Hospital,
};
