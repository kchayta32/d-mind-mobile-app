export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      alert_deliveries: {
        Row: {
          alert_id: string | null
          created_at: string | null
          delivered_at: string | null
          delivery_method: string
          delivery_status: string
          id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          alert_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_method: string
          delivery_status?: string
          id?: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          alert_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_method?: string
          delivery_status?: string
          id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_deliveries_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "realtime_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      disaster_statistics: {
        Row: {
          affected_area: number | null
          count: number
          created_at: string
          date: string
          disaster_type: string
          id: string
          metadata: Json | null
          province: string
          severity_level: number
        }
        Insert: {
          affected_area?: number | null
          count?: number
          created_at?: string
          date: string
          disaster_type: string
          id?: string
          metadata?: Json | null
          province: string
          severity_level?: number
        }
        Update: {
          affected_area?: number | null
          count?: number
          created_at?: string
          date?: string
          disaster_type?: string
          id?: string
          metadata?: Json | null
          province?: string
          severity_level?: number
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      from_rain_sensor: {
        Row: {
          created_at: string | null
          humidity: number | null
          id: number
          inserted_at: string | null
          is_raining: boolean | null
          latitude: number | null
          longitude: number | null
        }
        Insert: {
          created_at?: string | null
          humidity?: number | null
          id?: number
          inserted_at?: string | null
          is_raining?: boolean | null
          latitude?: number | null
          longitude?: number | null
        }
        Update: {
          created_at?: string | null
          humidity?: number | null
          id?: number
          inserted_at?: string | null
          is_raining?: boolean | null
          latitude?: number | null
          longitude?: number | null
        }
        Relationships: []
      }
      incident_reports: {
        Row: {
          contact_info: string | null
          coordinates: Json | null
          created_at: string
          description: string
          id: string
          image_urls: string[] | null
          is_verified: boolean
          location: string | null
          severity_level: number
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          contact_info?: string | null
          coordinates?: Json | null
          created_at?: string
          description: string
          id?: string
          image_urls?: string[] | null
          is_verified?: boolean
          location?: string | null
          severity_level?: number
          status?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          contact_info?: string | null
          coordinates?: Json | null
          created_at?: string
          description?: string
          id?: string
          image_urls?: string[] | null
          is_verified?: boolean
          location?: string | null
          severity_level?: number
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      realtime_alerts: {
        Row: {
          affected_provinces: string[] | null
          alert_type: string
          coordinates: Json
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          message: string
          metadata: Json | null
          radius_km: number
          severity_level: number
          title: string
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          affected_provinces?: string[] | null
          alert_type: string
          coordinates: Json
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          metadata?: Json | null
          radius_km?: number
          severity_level: number
          title: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          affected_provinces?: string[] | null
          alert_type?: string
          coordinates?: Json
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          metadata?: Json | null
          radius_km?: number
          severity_level?: number
          title?: string
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      satisfaction_surveys: {
        Row: {
          ai_assistant_rating: number | null
          alert_system_rating: number | null
          created_at: string
          emergency_info_rating: number | null
          id: string
          map_visualization_rating: number | null
          most_useful_feature: string | null
          overall_rating: number
          suggestions: string | null
          updated_at: string
          user_interface_rating: number | null
          would_recommend: number | null
        }
        Insert: {
          ai_assistant_rating?: number | null
          alert_system_rating?: number | null
          created_at?: string
          emergency_info_rating?: number | null
          id?: string
          map_visualization_rating?: number | null
          most_useful_feature?: string | null
          overall_rating: number
          suggestions?: string | null
          updated_at?: string
          user_interface_rating?: number | null
          would_recommend?: number | null
        }
        Update: {
          ai_assistant_rating?: number | null
          alert_system_rating?: number | null
          created_at?: string
          emergency_info_rating?: number | null
          id?: string
          map_visualization_rating?: number | null
          most_useful_feature?: string | null
          overall_rating?: number
          suggestions?: string | null
          updated_at?: string
          user_interface_rating?: number | null
          would_recommend?: number | null
        }
        Relationships: []
      }
      shared_disaster_data: {
        Row: {
          created_at: string
          data: Json
          disaster_type: string
          expires_at: string | null
          id: string
          is_public: boolean | null
          location: Json
          shared_with: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data: Json
          disaster_type: string
          expires_at?: string | null
          id?: string
          is_public?: boolean | null
          location: Json
          shared_with?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          disaster_type?: string
          expires_at?: string | null
          id?: string
          is_public?: boolean | null
          location?: Json
          shared_with?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_alert_subscriptions: {
        Row: {
          alert_types: string[]
          created_at: string | null
          id: string
          is_active: boolean | null
          location_preferences: Json
          min_severity_level: number
          notification_methods: Json
          radius_km: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alert_types: string[]
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location_preferences: Json
          min_severity_level?: number
          notification_methods?: Json
          radius_km?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alert_types?: string[]
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location_preferences?: Json
          min_severity_level?: number
          notification_methods?: Json
          radius_km?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          notification_settings: Json
          preferred_areas: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notification_settings?: Json
          preferred_areas?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notification_settings?: Json
          preferred_areas?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      victim_reports: {
        Row: {
          contact: string | null
          coordinates: Json
          created_at: string
          description: string | null
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          contact?: string | null
          coordinates: Json
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status: string
          updated_at?: string
        }
        Update: {
          contact?: string | null
          coordinates?: Json
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      calculate_distance: {
        Args: { lat1: number; lon1: number; lat2: number; lon2: number }
        Returns: number
      }
      get_users_in_alert_radius: {
        Args: { alert_coordinates: Json; alert_radius: number }
        Returns: {
          user_id: string
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      match_documents: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
