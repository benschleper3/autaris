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
      campaigns: {
        Row: {
          brand_name: string | null
          budget_cents: number | null
          campaign_name: string | null
          created_at: string | null
          end_date: string | null
          id: string
          start_date: string | null
          title: string
          user_id: string
        }
        Insert: {
          brand_name?: string | null
          budget_cents?: number | null
          campaign_name?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          title: string
          user_id: string
        }
        Update: {
          brand_name?: string | null
          budget_cents?: number | null
          campaign_name?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      creator_revenue: {
        Row: {
          amount_cents: number
          brand_name: string | null
          created_at: string | null
          id: string
          notes: string | null
          paid_at: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          brand_name?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          brand_name?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      crm_bookings: {
        Row: {
          created_at: string | null
          ends_at: string
          id: string
          location: string | null
          starts_at: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          ends_at: string
          id?: string
          location?: string | null
          starts_at: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          ends_at?: string
          id?: string
          location?: string | null
          starts_at?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      crm_leads: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          source: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          source?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          source?: string | null
          user_id?: string
        }
        Relationships: []
      }
      crm_opportunities: {
        Row: {
          close_date: string | null
          created_at: string | null
          id: string
          stage: string | null
          title: string
          user_id: string
          value_cents: number | null
          won: boolean | null
        }
        Insert: {
          close_date?: string | null
          created_at?: string | null
          id?: string
          stage?: string | null
          title: string
          user_id: string
          value_cents?: number | null
          won?: boolean | null
        }
        Update: {
          close_date?: string | null
          created_at?: string | null
          id?: string
          stage?: string | null
          title?: string
          user_id?: string
          value_cents?: number | null
          won?: boolean | null
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
      deliverables: {
        Row: {
          approved: boolean | null
          campaign_id: string | null
          created_at: string | null
          due_date: string | null
          id: string
          stage: string | null
          title: string
          user_id: string
        }
        Insert: {
          approved?: boolean | null
          campaign_id?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          stage?: string | null
          title: string
          user_id: string
        }
        Update: {
          approved?: boolean | null
          campaign_id?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          stage?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      foundation_fund: {
        Row: {
          contributors: number
          created_at: string
          goal_cents: number
          id: string
          total_raised_cents: number
          updated_at: string
        }
        Insert: {
          contributors?: number
          created_at?: string
          goal_cents?: number
          id?: string
          total_raised_cents?: number
          updated_at?: string
        }
        Update: {
          contributors?: number
          created_at?: string
          goal_cents?: number
          id?: string
          total_raised_cents?: number
          updated_at?: string
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
      link_clicks: {
        Row: {
          clicked_at: string | null
          id: string
          link_id: string | null
          user_id: string
        }
        Insert: {
          clicked_at?: string | null
          id?: string
          link_id?: string | null
          user_id: string
        }
        Update: {
          clicked_at?: string | null
          id?: string
          link_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "link_clicks_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "link_hub_links"
            referencedColumns: ["id"]
          },
        ]
      }
      link_hub_links: {
        Row: {
          created_at: string | null
          id: string
          slug: string
          title: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          slug: string
          title: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          slug?: string
          title?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          created_at: string | null
          description: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          post_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          post_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          post_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      post_ai_insights: {
        Row: {
          angle: string | null
          created_at: string | null
          id: string
          next_test: string | null
          post_id: string
          user_id: string
          what_to_replicate: string | null
        }
        Insert: {
          angle?: string | null
          created_at?: string | null
          id?: string
          next_test?: string | null
          post_id: string
          user_id: string
          what_to_replicate?: string | null
        }
        Update: {
          angle?: string | null
          created_at?: string | null
          id?: string
          next_test?: string | null
          post_id?: string
          user_id?: string
          what_to_replicate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_ai_insights_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_ai_insights_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "v_posts_with_latest"
            referencedColumns: ["post_id"]
          },
        ]
      }
      post_metrics: {
        Row: {
          captured_at: string | null
          comments: number | null
          id: string
          likes: number | null
          post_id: string
          saves: number | null
          shares: number | null
          views: number | null
        }
        Insert: {
          captured_at?: string | null
          comments?: number | null
          id?: string
          likes?: number | null
          post_id: string
          saves?: number | null
          shares?: number | null
          views?: number | null
        }
        Update: {
          captured_at?: string | null
          comments?: number | null
          id?: string
          likes?: number | null
          post_id?: string
          saves?: number | null
          shares?: number | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "post_metrics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_metrics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "v_posts_with_latest"
            referencedColumns: ["post_id"]
          },
        ]
      }
      posts: {
        Row: {
          asset_url: string | null
          campaign_id: string | null
          caption: string | null
          created_at: string | null
          external_id: string | null
          id: string
          published_at: string | null
          scheduled_at: string | null
          social_account_id: string | null
          status: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          asset_url?: string | null
          campaign_id?: string | null
          caption?: string | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          published_at?: string | null
          scheduled_at?: string | null
          social_account_id?: string | null
          status?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          asset_url?: string | null
          campaign_id?: string | null
          caption?: string | null
          created_at?: string | null
          external_id?: string | null
          id?: string
          published_at?: string | null
          scheduled_at?: string | null
          social_account_id?: string | null
          status?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_social_account_id_fkey"
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
          id: string
          last_login_at: string | null
          metadata: Json | null
          onboarded_at: string | null
          phone: string | null
          plan: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          metadata?: Json | null
          onboarded_at?: string | null
          phone?: string | null
          plan?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          metadata?: Json | null
          onboarded_at?: string | null
          phone?: string | null
          plan?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      report_links: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          from_date: string | null
          id: string
          report_type: string | null
          title: string
          to_date: string | null
          url: string
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          from_date?: string | null
          id?: string
          report_type?: string | null
          title: string
          to_date?: string | null
          url: string
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          from_date?: string | null
          id?: string
          report_type?: string | null
          title?: string
          to_date?: string | null
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_links_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      social_accounts: {
        Row: {
          created_at: string | null
          external_id: string | null
          handle: string | null
          id: string
          last_synced_at: string | null
          platform: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          external_id?: string | null
          handle?: string | null
          id?: string
          last_synced_at?: string | null
          platform: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          external_id?: string | null
          handle?: string | null
          id?: string
          last_synced_at?: string | null
          platform?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_meta: {
        Row: {
          created_at: string | null
          id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          notes: string | null
          referral_source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          notes?: string | null
          referral_source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          notes?: string | null
          referral_source?: string | null
        }
        Relationships: []
      }
      weekly_insights: {
        Row: {
          confidence: number | null
          created_at: string | null
          id: string
          insight: string | null
          narrative: string | null
          recommendations: string | null
          user_id: string
          week_start: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          insight?: string | null
          narrative?: string | null
          recommendations?: string | null
          user_id: string
          week_start: string
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          insight?: string | null
          narrative?: string | null
          recommendations?: string | null
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_post_latest: {
        Row: {
          captured_at: string | null
          comments: number | null
          likes: number | null
          post_id: string | null
          saves: number | null
          shares: number | null
          views: number | null
        }
        Relationships: [
          {
            foreignKeyName: "post_metrics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_metrics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "v_posts_with_latest"
            referencedColumns: ["post_id"]
          },
        ]
      }
      v_posts_with_latest: {
        Row: {
          asset_url: string | null
          caption: string | null
          comments: number | null
          created_at: string | null
          engagement_rate: number | null
          likes: number | null
          platform: string | null
          post_id: string | null
          published_at: string | null
          saves: number | null
          scheduled_at: string | null
          shares: number | null
          status: string | null
          title: string | null
          url: string | null
          user_id: string | null
          views: number | null
        }
        Relationships: []
      }
      v_time_heatmap: {
        Row: {
          avg_engagement_percent: number | null
          dow: number | null
          hour: number | null
          platform: string | null
          posts_count: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_creator_kpis: {
        Args: Record<PropertyKey, never>
        Returns: {
          calls_7d: number
          clients_30d: number
          leads_7d: number
          revenue_30d: number
        }[]
      }
      get_daily_perf: {
        Args:
          | { p_from: string; p_platform: string; p_to: string }
          | {
              p_from: string
              p_platform: string
              p_to: string
              p_user_id: string
            }
        Returns: {
          avg_er_percent: number
          day: string
          day_views: number
        }[]
      }
      get_ugc_kpis: {
        Args:
          | Record<PropertyKey, never>
          | { p_from: string; p_platform: string; p_to: string }
          | {
              p_from: string
              p_platform: string
              p_to: string
              p_user_id: string
            }
        Returns: {
          active_campaigns: number
          avg_er_30d: number
          posts_30d: number
          views_30d: number
        }[]
      }
      run_user_kpis: {
        Args: { p_user_id: string }
        Returns: Json
      }
      set_user_role: {
        Args: { p_role: string }
        Returns: undefined
      }
      upsert_metrics: {
        Args: {
          p_captured_at: string
          p_handle: string
          p_metrics: Json
          p_platform: string
          p_post: Json
          p_user_id: string
        }
        Returns: Json
      }
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
