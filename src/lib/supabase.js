import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nvonwgztqmpvxwkicajo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52b253Z3p0cW1wdnh3a2ljYWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NDMxMTMsImV4cCI6MjEwNzExOTExM30.X_8FyqK3a3N16RQmEUw3O4AX1jbFkozElSYnHor7Xno';

// Always initialized to connect to Ovenly database
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.warn("Supabase credentials are not set! The application will run in local-mock mode or display errors for backend tasks. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

