import { createClient } from "@supabase/supabase-js";

/**
 * The single Supabase browser client for the whole app.
 *
 * Auth-only usage: sign-in via signInWithPassword, and reading the current
 * session (getSession) before every backend call. `persistSession` +
 * `autoRefreshToken` mean the current session always holds a valid (auto-
 * refreshed) access token — so callers read it fresh and never cache it.
 * (Constitution Principle I.)
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see .env.example).",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
