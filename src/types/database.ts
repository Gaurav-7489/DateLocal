/**
 * Supabase database types — manually maintained.
 *
 * These types reflect the final schema after both migrations:
 *   - supabase/migrations/0001_initial_schema.sql (intended schema)
 *   - supabase/migrations/0002_reconcile_schema.sql (reconciliation)
 *
 * If you add/change columns in a migration, update these types to match.
 *
 * In a production workflow you would generate these with:
 *   npx supabase gen types typescript --local > src/types/database.ts
 */

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
          id: string;
          display_name: string;
          date_of_birth: string;
          gender: string;
          department: string;
          academic_year: string;
          bio: string | null;
          profile_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          date_of_birth: string;
          gender: string;
          department: string;
          academic_year: string;
          bio?: string | null;
          profile_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          date_of_birth?: string;
          gender?: string;
          department?: string;
          academic_year?: string;
          bio?: string | null;
          profile_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
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
          id?: string;
          liker_id?: string;
          liked_id?: string;
          created_at?: string;
        };
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
          id?: string;
          user_a?: string;
          user_b?: string;
          created_at?: string;
        };
      };
    };
  };
}
