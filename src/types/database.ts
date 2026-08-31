/**
 * Supabase Database Types
 * Optimized with complete foreign key graphs, enum unions, and ergonomic query helpers.
 */

import type { UserRole } from "@/types/roles";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type GenderType = "male" | "female" | "non-binary" | "other";
export type ReportStatus = "pending" | "reviewed" | "resolved" | "dismissed";
export type SubscriptionPlan = "free" | "pro";
export type SubscriptionStatus =
  | "inactive"
  | "trialing"
  | "active"
  | "cancelled"
  | "expired";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          display_name: string;
          date_of_birth: string;
          gender: GenderType | string;
          department: string;
          academic_year: string;
          bio: string | null;
          profile_completed: boolean;
          ghost_mode: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          display_name: string;
          date_of_birth: string;
          gender: GenderType | string;
          department: string;
          academic_year: string;
          bio?: string | null;
          profile_completed?: boolean;
          ghost_mode?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          display_name?: string;
          date_of_birth?: string;
          gender?: GenderType | string;
          department?: string;
          academic_year?: string;
          bio?: string | null;
          profile_completed?: boolean;
          ghost_mode?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      interests: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };

      profile_interests: {
        Row: {
          profile_id: string;
          interest_id: string;
          created_at: string;
        };
        Insert: {
          profile_id: string;
          interest_id: string;
          created_at?: string;
        };
        Update: {
          profile_id?: string;
          interest_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profile_interests_interest_id_fkey";
            columns: ["interest_id"];
            isOneToOne: false;
            referencedRelation: "interests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profile_interests_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      profile_photos: {
        Row: {
          id: string;
          profile_id: string;
          storage_path: string;
          display_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          storage_path: string;
          display_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          storage_path?: string;
          display_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profile_photos_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      dating_preferences: {
        Row: {
          user_id: string;
          interested_in: (GenderType | string)[];
          min_age: number;
          max_age: number;
          preferred_department: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          interested_in?: (GenderType | string)[];
          min_age?: number;
          max_age?: number;
          preferred_department?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          interested_in?: (GenderType | string)[];
          min_age?: number;
          max_age?: number;
          preferred_department?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "dating_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      likes: {
        Row: {
          id: string;
          liker_id: string;
          liked_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          liker_id: string;
          liked_id: string;
          created_at?: string;
        };
        Update: {
          liker_id?: string;
          liked_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "likes_liker_id_fkey";
            columns: ["liker_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "likes_liked_id_fkey";
            columns: ["liked_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      passes: {
        Row: {
          id: string;
          passer_id: string;
          passed_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          passer_id: string;
          passed_id: string;
          created_at?: string;
        };
        Update: {
          passer_id?: string;
          passed_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "passes_passer_id_fkey";
            columns: ["passer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "passes_passed_id_fkey";
            columns: ["passed_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      matches: {
        Row: {
          id: string;
          user_a: string;
          user_b: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_a: string;
          user_b: string;
          created_at?: string;
        };
        Update: {
          user_a?: string;
          user_b?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "matches_user_a_fkey";
            columns: ["user_a"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_user_b_fkey";
            columns: ["user_b"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      messages: {
        Row: {
          id: string;
          match_id: string;
          sender_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          sender_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          match_id?: string;
          sender_id?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      blocks: {
        Row: {
          id: string;
          blocker_id: string;
          blocked_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          blocker_id: string;
          blocked_id: string;
          created_at?: string;
        };
        Update: {
          blocker_id?: string;
          blocked_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blocks_blocker_id_fkey";
            columns: ["blocker_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "blocks_blocked_id_fkey";
            columns: ["blocked_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_id: string;
          reason: string;
          details: string | null;
          status: ReportStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          reported_id: string;
          reason: string;
          details?: string | null;
          status?: ReportStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          reporter_id?: string;
          reported_id?: string;
          reason?: string;
          details?: string | null;
          status?: ReportStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey";
            columns: ["reporter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_reported_id_fkey";
            columns: ["reported_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: SubscriptionPlan;
          status: SubscriptionStatus;
          trial_started_at: string | null;
          trial_ends_at: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          razorpay_customer_id: string | null;
          razorpay_subscription_id: string | null;
          last_payment_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan?: SubscriptionPlan;
          status?: SubscriptionStatus;
          trial_started_at?: string | null;
          trial_ends_at?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          razorpay_customer_id?: string | null;
          razorpay_subscription_id?: string | null;
          last_payment_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          plan?: SubscriptionPlan;
          status?: SubscriptionStatus;
          trial_started_at?: string | null;
          trial_ends_at?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          razorpay_customer_id?: string | null;
          razorpay_subscription_id?: string | null;
          last_payment_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      razorpay_webhook_events: {
        Row: {
          id: string;
          razorpay_event_id: string;
          event_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          razorpay_event_id: string;
          event_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          razorpay_event_id?: string;
          event_type?: string;
          created_at?: string;
        };
        Relationships: [];
      };

      face_verifications: {
        Row: {
          user_id: string;
          reference_embedding: number[] | null;
          didit_session_id: string | null;
          status: "pending" | "verified" | "rejected";
          verified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          reference_embedding?: number[] | null;
          didit_session_id?: string | null;
          status?: "pending" | "verified" | "rejected";
          verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          reference_embedding?: number[] | null;
          didit_session_id?: string | null;
          status?: "pending" | "verified" | "rejected";
          verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "face_verifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      is_datebu_pro: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      get_my_subscription: {
        Args: Record<PropertyKey, never>;
        Returns: {
          plan: SubscriptionPlan;
          status: SubscriptionStatus;
          is_pro: boolean;
          trial_started_at: string | null;
          trial_ends_at: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
        }[];
      };
    };

    Enums: {
      user_role: UserRole;
      gender_type: GenderType;
      report_status: ReportStatus;
      subscription_plan: SubscriptionPlan;
      subscription_status: SubscriptionStatus;
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

/* ================= Type Utility Shorthands ================= */

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];