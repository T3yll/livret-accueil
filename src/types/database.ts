// Types de la base. Écrits à la main au format de `supabase gen types` en attendant
// le projet cloud : à régénérer avec `npm run db:types` après chaque migration.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Timestamps = { created_at: string; updated_at: string };

type HostRow = {
  id: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
} & Timestamps;

type PropertyRow = {
  id: string;
  host_id: string;
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
  status: Database["public"]["Enums"]["property_status"];
  published_at: string | null;
} & Timestamps;

type GuideSectionRow = {
  id: string;
  property_id: string;
  type: Database["public"]["Enums"]["section_type"];
  title_fr: string | null;
  title_en: string | null;
  body_fr: string | null;
  body_en: string | null;
  data: Json;
  media: Json;
  position: number;
  is_active: boolean;
} & Timestamps;

type PlaceRow = {
  id: string;
  name: string;
  category: Database["public"]["Enums"]["place_category"];
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
  opening_mode: Database["public"]["Enums"]["opening_mode"];
  hours_verified_at: string | null;
  archived_at: string | null;
} & Timestamps;

type OpeningHoursRow = { id: string; place_id: string; weekday: number; opens_at: string; closes_at: string };

type ClosureRow = {
  id: string;
  place_id: string;
  starts_on: string;
  ends_on: string;
  reason_fr: string | null;
  reason_en: string | null;
};

type PropertyPlaceRow = {
  property_id: string;
  place_id: string;
  is_favorite: boolean;
  comment_fr: string | null;
  comment_en: string | null;
  position: number;
  created_at: string;
};

type ModuleRow = { key: string; name: string; description: string | null };

type PropertyModuleRow = {
  property_id: string;
  module_key: string;
  is_active: boolean;
  starts_on: string | null;
  ends_on: string | null;
};

// Insert : les colonnes avec valeur par défaut ou nullables deviennent facultatives.
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type NullableKeys<T> = { [K in keyof T]: null extends T[K] ? K : never }[keyof T];
type InsertOf<T, Defaults extends keyof T> = Optional<T, Defaults | NullableKeys<T>>;

type Table<Row, Defaults extends keyof Row> = {
  Row: Row;
  Insert: InsertOf<Row, Defaults>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      admins: Table<{ user_id: string; created_at: string }, "created_at">;
      hosts: Table<HostRow, "id" | "created_at" | "updated_at">;
      properties: Table<PropertyRow, "id" | "status" | "created_at" | "updated_at">;
      guide_sections: Table<
        GuideSectionRow,
        "id" | "data" | "media" | "position" | "is_active" | "created_at" | "updated_at"
      >;
      places: Table<PlaceRow, "id" | "opening_mode" | "created_at" | "updated_at">;
      place_opening_hours: Table<OpeningHoursRow, "id">;
      place_closures: Table<ClosureRow, "id">;
      property_places: Table<PropertyPlaceRow, "is_favorite" | "position" | "created_at">;
      modules: Table<ModuleRow, never>;
      property_modules: Table<PropertyModuleRow, "is_active">;
    };
    Views: {
      places_needing_review: { Row: PlaceRow; Relationships: [] };
    };
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      get_guide: { Args: { p_slug: string }; Returns: Json };
    };
    Enums: {
      property_status: "draft" | "published";
      section_type: "arrival" | "wifi" | "house" | "equipment" | "departure" | "contacts" | "practical";
      place_category:
        | "restaurant"
        | "producer"
        | "market"
        | "shop"
        | "activity"
        | "heritage"
        | "family"
        | "health";
      opening_mode: "schedule" | "always" | "appointment" | "unknown";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];
