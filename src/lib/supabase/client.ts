import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    'Supabase env missing: set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env'
  );
}

/**
 * Browser Supabase client for this Vite SPA.
 * Auth sessions are stored in localStorage (default).
 */
export const supabase = createClient(
  supabaseUrl ?? '',
  supabaseKey ?? ''
);

export function createClientBrowser() {
  return supabase;
}
