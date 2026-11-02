import { createBrowserClient } from "@supabase/ssr";
import type { Session, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && publishableKey);

/** null while running in demo mode (no .env.local values yet). */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createBrowserClient(url as string, publishableKey as string)
  : null;

let authInitialization: Promise<Session | null> | null = null;

export async function waitForSupabaseAuth(): Promise<Session | null> {
  if (!supabase) return null;
  if (!authInitialization) {
    authInitialization = new Promise((resolve) => {
      let settled = false;
      let unsubscribe = () => {};
      const finish = (session: Session | null) => {
        if (settled) return;
        settled = true;
        unsubscribe();
        resolve(session);
      };
      const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "INITIAL_SESSION") finish(session);
      });
      unsubscribe = () => listener.subscription.unsubscribe();
      void supabase.auth.getSession().then(({ data }) => {
        if (data.session) finish(data.session);
      });
      window.setTimeout(() => finish(null), 5000);
    });
  }
  return authInitialization;
}
