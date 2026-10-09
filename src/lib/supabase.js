import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback logic for initial setup when env vars might be missing
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.warn("Supabase credentials are not set! The application will run in local-mock mode or display errors for backend tasks. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}
