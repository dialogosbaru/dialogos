import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://araehtauuglwrtzlfmiw.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyYWVodGF1dWdsd3J0emxmbWl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyOTQyOTIsImV4cCI6MjA4Mjg3MDI5Mn0.JmOYJ_LkFvyaIMceHBvk0goa8TmNS28pUNiypzEbXsI';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database Types
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  urban_level: number;
  voice_name: string;
  voice_region: string;
  language: string;
  color_palette: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  emotion?: string;
  created_at: string;
}

export interface UserMemory {
  id: string;
  user_id: string;
  memory_type: 'short_term' | 'long_term';
  key: string;
  value: string;
  context?: string;
  importance: number; // 1-10
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface PersonalInfo {
  id: string;
  user_id: string;
  info_type: 'name' | 'interest' | 'preference' | 'goal' | 'emotion' | 'other';
  key: string;
  value: string;
  confidence: number; // 0-1
  source_conversation_id?: string;
  created_at: string;
  updated_at: string;
}
