import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export const supabase: SupabaseClient | null = createClient();
export const isSupabaseConfigured = Boolean(supabase);

let authInitialization: Promise<Session | null> | null = null;

export async function waitForSupabaseAuth(): Promise<Session | null> {
  if (!supabase) return null;
  if (authInitialization) return authInitialization;

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
    void supabase.auth.getSession().then(({ data }) => finish(data.session));
    window.setTimeout(() => finish(null), 5000);
  });

  const session = await authInitialization;
  authInitialization = null;
  return session;
}
