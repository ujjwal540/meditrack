import { supabase } from "@/lib/supabase";

export interface AuthResult {
  ok: boolean;
  error?: string;
  demo?: boolean;
}

export type AccountType = "patient" | "caregiver";

const NOT_CONFIGURED: AuthResult = {
  ok: false,
  demo: true,
  error: "Supabase is not configured yet, so MediTrack is running in demo mode.",
};

export async function signUp(
  name: string,
  email: string,
  password: string,
  accountType: AccountType = "patient",
): Promise<AuthResult> {
  if (!supabase) return NOT_CONFIGURED;
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role: accountType } },
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return NOT_CONFIGURED;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function signOut(): Promise<void> {
  if (supabase) await supabase.auth.signOut();
}
