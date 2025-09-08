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
    PostgrestVersion: "13.0.4"
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
      dashboard_items: {
        Row: {
          created_at: string
          dashboard_id: number
          data: Json
          id: number
          kind: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dashboard_id: number
          data?: Json
          id?: never
          kind: string
          user_id: string
        }
        Update: {
          created_at?: string
          dashboard_id?: number
          data?: Json
          id?: never
          kind?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_items_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "dashboards"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboards: {
        Row: {
          created_at: string
          id: number
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          title?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: never
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      healthchecks: {
        Row: {
          created_at: string
          id: number
          note: string
        }
        Insert: {
          created_at?: string
          id?: never
          note: string
        }
        Update: {
          created_at?: string
          id?: never
          note?: string
        }
        Relationships: []
      }
    }
    Views: {
      post_metrics: {
        Row: {
          comments: number | null
          created_at: string | null
          engagement_rate: number | null
          id: number | null
          likes: number | null
          post_id: string | null
          published_at: string | null
          shares: number | null
          social_account_id: number | null
          title: string | null
          updated_at: string | null
          url: string | null
          user_id: string | null
          views: number | null
        }
        Insert: {
          comments?: number | null
          created_at?: string | null
          engagement_rate?: number | null
          id?: number | null
          likes?: number | null
          post_id?: string | null
          published_at?: string | null
          shares?: number | null
          social_account_id?: number | null
          title?: string | null
          updated_at?: string | null
          url?: string | null
          user_id?: string | null
          views?: number | null
        }
        Update: {
          comments?: number | null
          created_at?: string | null
          engagement_rate?: number | null
          id?: number | null
          likes?: number | null
          post_id?: string | null
          published_at?: string | null
          shares?: number | null
          social_account_id?: number | null
          title?: string | null
          updated_at?: string | null
          url?: string | null
          user_id?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "post_metrics_social_account_id_fkey"
            columns: ["social_account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          last_login_at: string | null
          metadata: Json | null
          onboarded: boolean | null
          onboarded_at: string | null
          phone: string | null
          plan: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          timezone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          last_login_at?: string | null
          metadata?: Json | null
          onboarded?: boolean | null
          onboarded_at?: string | null
          phone?: string | null
          plan?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          last_login_at?: string | null
          metadata?: Json | null
          onboarded?: boolean | null
          onboarded_at?: string | null
          phone?: string | null
          plan?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      social_accounts: {
        Row: {
          created_at: string | null
          external_id: string | null
          handle: string | null
          id: number | null
          last_synced_at: string | null
          platform:
            | "tiktok"
            | "instagram"
            | "facebook"
            | "twitter"
            | "linkedin"
            | "youtube"
            | null
          status: "active" | "paused" | "disconnected" | "error" | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          external_id?: string | null
          handle?: string | null
          id?: number | null
          last_synced_at?: string | null
          platform?:
            | "tiktok"
            | "instagram"
            | "facebook"
            | "twitter"
            | "linkedin"
            | "youtube"
            | null
          status?: "active" | "paused" | "disconnected" | "error" | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          external_id?: string | null
          handle?: string | null
          id?: number | null
          last_synced_at?: string | null
          platform?:
            | "tiktok"
            | "instagram"
            | "facebook"
            | "twitter"
            | "linkedin"
            | "youtube"
            | null
          status?: "active" | "paused" | "disconnected" | "error" | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      weekly_insights: {
        Row: {
          best_times: Json | null
          created_at: string | null
          id: number | null
          narrative: string | null
          platform:
            | "tiktok"
            | "instagram"
            | "facebook"
            | "twitter"
            | "linkedin"
            | "youtube"
            | null
          recommendations: string | null
          top_posts: Json | null
          updated_at: string | null
          user_id: string | null
          week_start: string | null
        }
        Insert: {
          best_times?: Json | null
          created_at?: string | null
          id?: number | null
          narrative?: string | null
          platform?:
            | "tiktok"
            | "instagram"
            | "facebook"
            | "twitter"
            | "linkedin"
            | "youtube"
            | null
          recommendations?: string | null
          top_posts?: Json | null
          updated_at?: string | null
          user_id?: string | null
          week_start?: string | null
        }
        Update: {
          best_times?: Json | null
          created_at?: string | null
          id?: number | null
          narrative?: string | null
          platform?:
            | "tiktok"
            | "instagram"
            | "facebook"
            | "twitter"
            | "linkedin"
            | "youtube"
            | null
          recommendations?: string | null
          top_posts?: Json | null
          updated_at?: string | null
          user_id?: string | null
          week_start?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "coach" | "ugc_creator"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      user_role: ["coach", "ugc_creator"],
    },
  },
} as const
