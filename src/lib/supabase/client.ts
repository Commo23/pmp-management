import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? '';
const supabaseKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim() ?? '';

/** False when Vercel/local env vars are missing — app runs in local-only mode. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase env missing: set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (e.g. in Vercel Project Settings → Environment Variables).'
  );
}

/**
 * Browser Supabase client.
 * When env is missing we still construct a client so the app can boot;
 * cloud calls must check `isSupabaseConfigured` first.
 */
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : createClient('https://placeholder.supabase.co', 'public-anon-key');

export function createClientBrowser() {
  return supabase;
}
