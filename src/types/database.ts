export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      equipment_templates: {
        Row: {
          audio_path_en: string | null
          audio_path_fr: string | null
          body_en: string | null
          body_fr: string | null
          created_at: string
          id: string
          media: Json
          title_en: string | null
          title_fr: string
          transcript_en: string | null
          transcript_fr: string | null
          updated_at: string
        }
        Insert: {
          audio_path_en?: string | null
          audio_path_fr?: string | null
          body_en?: string | null
          body_fr?: string | null
          created_at?: string
          id?: string
          media?: Json
          title_en?: string | null
          title_fr: string
          transcript_en?: string | null
          transcript_fr?: string | null
          updated_at?: string
        }
        Update: {
          audio_path_en?: string | null
          audio_path_fr?: string | null
          body_en?: string | null
          body_fr?: string | null
          created_at?: string
          id?: string
          media?: Json
          title_en?: string | null
          title_fr?: string
          transcript_en?: string | null
          transcript_fr?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      guide_sections: {
        Row: {
          audio_path_en: string | null
          audio_path_fr: string | null
          body_en: string | null
          body_fr: string | null
          created_at: string
          data: Json
          id: string
          is_active: boolean
          media: Json
          position: number
          property_id: string
          title_en: string | null
          title_fr: string | null
          transcript_en: string | null
          transcript_fr: string | null
          type: Database["public"]["Enums"]["section_type"]
          updated_at: string
        }
        Insert: {
          audio_path_en?: string | null
          audio_path_fr?: string | null
          body_en?: string | null
          body_fr?: string | null
          created_at?: string
          data?: Json
          id?: string
          is_active?: boolean
          media?: Json
          position?: number
          property_id: string
          title_en?: string | null
          title_fr?: string | null
          transcript_en?: string | null
          transcript_fr?: string | null
          type: Database["public"]["Enums"]["section_type"]
          updated_at?: string
        }
        Update: {
          audio_path_en?: string | null
          audio_path_fr?: string | null
          body_en?: string | null
          body_fr?: string | null
          created_at?: string
          data?: Json
          id?: string
          is_active?: boolean
          media?: Json
          position?: number
          property_id?: string
          title_en?: string | null
          title_fr?: string | null
          transcript_en?: string | null
          transcript_fr?: string | null
          type?: Database["public"]["Enums"]["section_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guide_sections_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      hosts: {
        Row: {
          contact_name: string | null
          created_at: string
          display_names: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          contact_name?: string | null
          created_at?: string
          display_names?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          contact_name?: string | null
          created_at?: string
          display_names?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      modules: {
        Row: {
          description: string | null
          key: string
          name: string
        }
        Insert: {
          description?: string | null
          key: string
          name: string
        }
        Update: {
          description?: string | null
          key?: string
          name?: string
        }
        Relationships: []
      }
      place_closures: {
        Row: {
          ends_on: string
          id: string
          place_id: string
          reason_en: string | null
          reason_fr: string | null
          starts_on: string
        }
        Insert: {
          ends_on: string
          id?: string
          place_id: string
          reason_en?: string | null
          reason_fr?: string | null
          starts_on: string
        }
        Update: {
          ends_on?: string
          id?: string
          place_id?: string
          reason_en?: string | null
          reason_fr?: string | null
          starts_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_closures_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_closures_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places_needing_review"
            referencedColumns: ["id"]
          },
        ]
      }
      place_events: {
        Row: {
          booking_url: string | null
          created_at: string
          end_time: string | null
          id: string
          label_en: string | null
          label_fr: string | null
          place_id: string
          start_time: string | null
          starts_on: string
        }
        Insert: {
          booking_url?: string | null
          created_at?: string
          end_time?: string | null
          id?: string
          label_en?: string | null
          label_fr?: string | null
          place_id: string
          start_time?: string | null
          starts_on: string
        }
        Update: {
          booking_url?: string | null
          created_at?: string
          end_time?: string | null
          id?: string
          label_en?: string | null
          label_fr?: string | null
          place_id?: string
          start_time?: string | null
          starts_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_events_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_events_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places_needing_review"
            referencedColumns: ["id"]
          },
        ]
      }
      place_opening_hours: {
        Row: {
          closes_at: string
          id: string
          opens_at: string
          place_id: string
          weekday: number
        }
        Insert: {
          closes_at: string
          id?: string
          opens_at: string
          place_id: string
          weekday: number
        }
        Update: {
          closes_at?: string
          id?: string
          opens_at?: string
          place_id?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "place_opening_hours_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_opening_hours_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places_needing_review"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          address: string | null
          archived_at: string | null
          booking_required: boolean
          booking_url: string | null
          category: Database["public"]["Enums"]["place_category"]
          city: string | null
          created_at: string
          delivers: boolean
          description_en: string | null
          description_fr: string | null
          has_drive: boolean
          hike_difficulty: Database["public"]["Enums"]["hike_difficulty"] | null
          hike_distance_km: number | null
          hike_duration_min: number | null
          hours_verified_at: string | null
          id: string
          is_experience: boolean
          lat: number
          lng: number
          name: string
          opening_mode: Database["public"]["Enums"]["opening_mode"]
          phone: string | null
          photo_alt_en: string | null
          photo_alt_fr: string | null
          photo_credit: string | null
          photo_path: string | null
          postal_code: string | null
          practical_note_en: string | null
          practical_note_fr: string | null
          trail_url: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          archived_at?: string | null
          booking_required?: boolean
          booking_url?: string | null
          category: Database["public"]["Enums"]["place_category"]
          city?: string | null
          created_at?: string
          delivers?: boolean
          description_en?: string | null
          description_fr?: string | null
          has_drive?: boolean
          hike_difficulty?:
            | Database["public"]["Enums"]["hike_difficulty"]
            | null
          hike_distance_km?: number | null
          hike_duration_min?: number | null
          hours_verified_at?: string | null
          id?: string
          is_experience?: boolean
          lat: number
          lng: number
          name: string
          opening_mode?: Database["public"]["Enums"]["opening_mode"]
          phone?: string | null
          photo_alt_en?: string | null
          photo_alt_fr?: string | null
          photo_credit?: string | null
          photo_path?: string | null
          postal_code?: string | null
          practical_note_en?: string | null
          practical_note_fr?: string | null
          trail_url?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          archived_at?: string | null
          booking_required?: boolean
          booking_url?: string | null
          category?: Database["public"]["Enums"]["place_category"]
          city?: string | null
          created_at?: string
          delivers?: boolean
          description_en?: string | null
          description_fr?: string | null
          has_drive?: boolean
          hike_difficulty?:
            | Database["public"]["Enums"]["hike_difficulty"]
            | null
          hike_distance_km?: number | null
          hike_duration_min?: number | null
          hours_verified_at?: string | null
          id?: string
          is_experience?: boolean
          lat?: number
          lng?: number
          name?: string
          opening_mode?: Database["public"]["Enums"]["opening_mode"]
          phone?: string | null
          photo_alt_en?: string | null
          photo_alt_fr?: string | null
          photo_credit?: string | null
          photo_path?: string | null
          postal_code?: string | null
          practical_note_en?: string | null
          practical_note_fr?: string | null
          trail_url?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          cover_photo_alt_en: string | null
          cover_photo_alt_fr: string | null
          cover_photo_path: string | null
          created_at: string
          host_id: string
          id: string
          lat: number | null
          lng: number | null
          name: string
          postal_code: string | null
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["property_status"]
          updated_at: string
          welcome_audio_path_en: string | null
          welcome_audio_path_fr: string | null
          welcome_en: string | null
          welcome_fr: string | null
          welcome_transcript_en: string | null
          welcome_transcript_fr: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          cover_photo_alt_en?: string | null
          cover_photo_alt_fr?: string | null
          cover_photo_path?: string | null
          created_at?: string
          host_id: string
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          postal_code?: string | null
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["property_status"]
          updated_at?: string
          welcome_audio_path_en?: string | null
          welcome_audio_path_fr?: string | null
          welcome_en?: string | null
          welcome_fr?: string | null
          welcome_transcript_en?: string | null
          welcome_transcript_fr?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          cover_photo_alt_en?: string | null
          cover_photo_alt_fr?: string | null
          cover_photo_path?: string | null
          created_at?: string
          host_id?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          postal_code?: string | null
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["property_status"]
          updated_at?: string
          welcome_audio_path_en?: string | null
          welcome_audio_path_fr?: string | null
          welcome_en?: string | null
          welcome_fr?: string | null
          welcome_transcript_en?: string | null
          welcome_transcript_fr?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "hosts"
            referencedColumns: ["id"]
          },
        ]
      }
      property_modules: {
        Row: {
          ends_on: string | null
          is_active: boolean
          module_key: string
          property_id: string
          starts_on: string | null
        }
        Insert: {
          ends_on?: string | null
          is_active?: boolean
          module_key: string
          property_id: string
          starts_on?: string | null
        }
        Update: {
          ends_on?: string | null
          is_active?: boolean
          module_key?: string
          property_id?: string
          starts_on?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_modules_module_key_fkey"
            columns: ["module_key"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "property_modules_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_places: {
        Row: {
          comment_en: string | null
          comment_fr: string | null
          created_at: string
          is_favorite: boolean
          place_id: string
          position: number
          property_id: string
        }
        Insert: {
          comment_en?: string | null
          comment_fr?: string | null
          created_at?: string
          is_favorite?: boolean
          place_id: string
          position?: number
          property_id: string
        }
        Update: {
          comment_en?: string | null
          comment_fr?: string | null
          created_at?: string
          is_favorite?: boolean
          place_id?: string
          position?: number
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_places_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_places_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places_needing_review"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_places_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      places_needing_review: {
        Row: {
          address: string | null
          archived_at: string | null
          booking_url: string | null
          category: Database["public"]["Enums"]["place_category"] | null
          city: string | null
          created_at: string | null
          description_en: string | null
          description_fr: string | null
          hours_verified_at: string | null
          id: string | null
          lat: number | null
          lng: number | null
          name: string | null
          opening_mode: Database["public"]["Enums"]["opening_mode"] | null
          phone: string | null
          photo_alt_en: string | null
          photo_alt_fr: string | null
          photo_path: string | null
          postal_code: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          archived_at?: string | null
          booking_url?: string | null
          category?: Database["public"]["Enums"]["place_category"] | null
          city?: string | null
          created_at?: string | null
          description_en?: string | null
          description_fr?: string | null
          hours_verified_at?: string | null
          id?: string | null
          lat?: number | null
          lng?: number | null
          name?: string | null
          opening_mode?: Database["public"]["Enums"]["opening_mode"] | null
          phone?: string | null
          photo_alt_en?: string | null
          photo_alt_fr?: string | null
          photo_path?: string | null
          postal_code?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          archived_at?: string | null
          booking_url?: string | null
          category?: Database["public"]["Enums"]["place_category"] | null
          city?: string | null
          created_at?: string | null
          description_en?: string | null
          description_fr?: string | null
          hours_verified_at?: string | null
          id?: string | null
          lat?: number | null
          lng?: number | null
          name?: string | null
          opening_mode?: Database["public"]["Enums"]["opening_mode"] | null
          phone?: string | null
          photo_alt_en?: string | null
          photo_alt_fr?: string | null
          photo_path?: string | null
          postal_code?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_guide: { Args: { p_slug: string }; Returns: Json }
      is_admin: { Args: never; Returns: boolean }
      module_is_active: {
        Args: { p_key: string; p_property_id: string }
        Returns: boolean
      }
    }
    Enums: {
      hike_difficulty: "easy" | "medium" | "hard"
      opening_mode: "schedule" | "always" | "appointment" | "unknown"
      place_category:
        | "restaurant"
        | "producer"
        | "market"
        | "shop"
        | "activity"
        | "heritage"
        | "family"
        | "health"
        | "hiking"
        | "horse_riding"
        | "bike_rental"
        | "kids_leisure"
        | "groceries"
        | "pharmacy"
        | "transport"
      property_status: "draft" | "published"
      section_type:
        | "arrival"
        | "wifi"
        | "house"
        | "equipment"
        | "departure"
        | "contacts"
        | "practical"
        | "prepare"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      hike_difficulty: ["easy", "medium", "hard"],
      opening_mode: ["schedule", "always", "appointment", "unknown"],
      place_category: [
        "restaurant",
        "producer",
        "market",
        "shop",
        "activity",
        "heritage",
        "family",
        "health",
        "hiking",
        "horse_riding",
        "bike_rental",
        "kids_leisure",
        "groceries",
        "pharmacy",
        "transport",
      ],
      property_status: ["draft", "published"],
      section_type: [
        "arrival",
        "wifi",
        "house",
        "equipment",
        "departure",
        "contacts",
        "practical",
        "prepare",
      ],
    },
  },
} as const
