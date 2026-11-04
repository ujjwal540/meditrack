import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function createClient(): SupabaseClient | null {
  const env = typeof process !== "undefined" && process?.env ? process.env : (import.meta as any)?.env || {};
  const url = env.NEXT_PUBLIC_SUPABASE_URL || (import.meta as any)?.env?.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    (import.meta as any)?.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    (import.meta as any)?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;
  client ??= createBrowserClient(url, key);
  return client;
}
