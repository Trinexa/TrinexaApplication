import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase configuration is incomplete. Please ensure you have clicked "Connect to Supabase" and the connection was successful.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);