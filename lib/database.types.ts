export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "pro";
export type Difficulty = "beginner" | "intermediate" | "advanced";
export type QuickReaction = "coming" | "on_the_way";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          skill_level: SkillLevel | null;
          bio: string | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          skill_level?: SkillLevel | null;
          bio?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          skill_level?: SkillLevel | null;
          bio?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      beaches: {
        Row: {
          id: number;
          slug: string;
          name_he: string;
          name_en: string;
          city: string;
          region: string;
          latitude: number;
          longitude: number;
          description: string | null;
          difficulty: Difficulty | null;
        };
        Insert: {
          id?: number;
          slug: string;
          name_he: string;
          name_en: string;
          city: string;
          region: string;
          latitude: number;
          longitude: number;
          description?: string | null;
          difficulty?: Difficulty | null;
        };
        Update: {
          id?: number;
          slug?: string;
          name_he?: string;
          name_en?: string;
          city?: string;
          region?: string;
          latitude?: number;
          longitude?: number;
          description?: string | null;
          difficulty?: Difficulty | null;
        };
        Relationships: [];
      };
      user_favorites: {
        Row: {
          user_id: string;
          beach_id: number;
          created_at: string | null;
        };
        Insert: {
          user_id: string;
          beach_id: number;
          created_at?: string | null;
        };
        Update: {
          user_id?: string;
          beach_id?: number;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_favorites_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_favorites_beach_id_fkey";
            columns: ["beach_id"];
            isOneToOne: false;
            referencedRelation: "beaches";
            referencedColumns: ["id"];
          },
        ];
      };
      reports: {
        Row: {
          id: string;
          user_id: string;
          beach_id: number;
          text: string;
          image_url: string | null;
          wave_rating: number | null;
          wave_height_estimate: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          beach_id: number;
          text: string;
          image_url?: string | null;
          wave_rating?: number | null;
          wave_height_estimate?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          beach_id?: number;
          text?: string;
          image_url?: string | null;
          wave_rating?: number | null;
          wave_height_estimate?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reports_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_beach_id_fkey";
            columns: ["beach_id"];
            isOneToOne: false;
            referencedRelation: "beaches";
            referencedColumns: ["id"];
          },
        ];
      };
      replies: {
        Row: {
          id: string;
          report_id: string;
          user_id: string;
          text: string | null;
          quick_reaction: QuickReaction | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          report_id: string;
          user_id: string;
          text: string | null;
          quick_reaction?: QuickReaction | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          report_id?: string;
          user_id?: string;
          text?: string | null;
          quick_reaction?: QuickReaction | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "replies_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "reports";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "replies_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
