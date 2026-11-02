import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Enums, Json } from "@/types/database";

// Forme du JSON renvoyé par la fonction SQL get_guide(slug).
export type Guide = {
  property: {
    id: string;
    name: string;
    slug: string;
    address: string | null;
    postal_code: string | null;
    city: string | null;
    lat: number | null;
    lng: number | null;
    cover_photo_path: string | null;
    cover_photo_alt_fr: string | null;
    cover_photo_alt_en: string | null;
    welcome_fr: string | null;
    welcome_en: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    status: Enums<"property_status">;
    updated_at: string;
  };
  sections: {
    id: string;
    type: Enums<"section_type">;
    title_fr: string | null;
    title_en: string | null;
    body_fr: string | null;
    body_en: string | null;
    data: Json;
    media: Json;
    position: number;
    is_active: boolean;
    updated_at: string;
  }[];
  modules: string[];
  places: {
    id: string;
    name: string;
    category: Enums<"place_category">;
    description_fr: string | null;
    description_en: string | null;
    address: string | null;
    postal_code: string | null;
    city: string | null;
    lat: number;
    lng: number;
    phone: string | null;
    website: string | null;
    booking_url: string | null;
    photo_path: string | null;
    photo_alt_fr: string | null;
    photo_alt_en: string | null;
    photo_credit: string | null;
    opening_mode: Enums<"opening_mode">;
    hours_verified_at: string | null;
    is_favorite: boolean;
    comment_fr: string | null;
    comment_en: string | null;
    hours: { weekday: number; opens_at: string; closes_at: string }[];
    closures: { starts_on: string; ends_on: string; reason_fr: string | null; reason_en: string | null }[];
  }[];
};

// Mis en cache pour la durée d'une requête (metadata + page ne font qu'un appel).
// Un admin connecté voit aussi les brouillons : c'est la prévisualisation.
export const getGuide = cache(async (slug: string): Promise<Guide | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_guide", { p_slug: slug });
  if (error) throw error;
  return (data as Guide | null) ?? null;
});
