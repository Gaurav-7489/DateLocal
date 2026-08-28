/**
 * Supabase database types.
 */

import type { UserRole } from "@/types/roles";


export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          role: UserRole;
          id: string;
          display_name: string;
          date_of_birth: string;
          gender: string;
          department: string;
          academic_year: string;
          bio: string | null;
          profile_completed: boolean;
          ghost_mode: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          role?: UserRole;
          id: string;
          display_name: string;
          date_of_birth: string;
          gender: string;
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
          gender?: string;
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
          interested_in: string[];
          min_age: number;
          max_age: number;
          preferred_department: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          interested_in?: string[];
          min_age?: number;
          max_age?: number;
          preferred_department?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          interested_in?: string[];
          min_age?: number;
          max_age?: number;
          preferred_department?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_id: string;
          reason: string;
          details: string | null;
          status: "pending" | "reviewed" | "resolved" | "dismissed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          reported_id: string;
          reason: string;
          details?: string | null;
          status?: "pending" | "reviewed" | "resolved" | "dismissed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          reporter_id?: string;
          reported_id?: string;
          reason?: string;
          details?: string | null;
          status?: "pending" | "reviewed" | "resolved" | "dismissed";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: "free" | "pro";
          status: "inactive" | "trialing" | "active" | "cancelled" | "expired";
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
          plan?: "free" | "pro";
          status?: "inactive" | "trialing" | "active" | "cancelled" | "expired";
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
          plan?: "free" | "pro";
          status?: "inactive" | "trialing" | "active" | "cancelled" | "expired";
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
        Relationships: [];
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
          plan: string;
          status: string;
          is_pro: boolean;
          trial_started_at: string | null;
          trial_ends_at: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
