// Supabase client configuration

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not set. Some features may not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
        };
      };
      games: {
        Row: {
          id: string;
          user_id: string | null;
          pgn: string;
          white_player: string | null;
          black_player: string | null;
          result: string | null;
          event_name: string | null;
          date_played: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          pgn: string;
          white_player?: string | null;
          black_player?: string | null;
          result?: string | null;
          event_name?: string | null;
          date_played?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          pgn?: string;
          white_player?: string | null;
          black_player?: string | null;
          result?: string | null;
          event_name?: string | null;
          date_played?: string | null;
          created_at?: string;
        };
      };
      handwriting_profiles: {
        Row: {
          id: string;
          user_id: string;
          char_mappings: Record<string, string>;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          char_mappings?: Record<string, string>;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          char_mappings?: Record<string, string>;
          updated_at?: string;
        };
      };
      oauth_tokens: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          access_token: string;
          refresh_token: string | null;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: string;
          access_token: string;
          refresh_token?: string | null;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: string;
          access_token?: string;
          refresh_token?: string | null;
          expires_at?: string | null;
        };
      };
    };
  };
}
