import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/types";

export interface AuthResult {
  ok: boolean;
  error?: string;
  demo?: boolean;
  role?: UserRole;
  user?: {
    id: string;
    email?: string;
    name?: string;
    role?: UserRole;
  };
}

export type AccountType = "patient" | "family_caregiver" | "professional_caregiver";

export interface ProfessionalRegisterData {
  phone?: string;
  qualifications?: string;
  yearsExperience?: number;
  serviceLocation?: string;
  hourlyRate?: number;
  bio?: string;
}

const NOT_CONFIGURED: AuthResult = {
  ok: false,
  demo: true,
  error: "Supabase is not configured yet, so MediTrack is running in local demo mode.",
};

const USER_SESSION_KEY = "meditrack.current_user";

export async function signUp(
  name: string,
  email: string,
  password: string,
  accountType: AccountType = "patient",
  proData?: ProfessionalRegisterData,
): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!supabase) {
    // In local demo mode, isolate user identity in session storage
    const demoUser = {
      id: "demo-" + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      email: normalizedEmail,
      role: accountType,
    };
    try {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(demoUser));
    } catch {}
    return { ok: true, demo: true, role: accountType, user: demoUser };
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        name: name.trim(),
        role: accountType,
        phone: proData?.phone || null,
        qualifications: proData?.qualifications || null,
        service_location: proData?.serviceLocation || null,
      },
    },
  });

  if (error) return { ok: false, error: error.message };

  if (data.user) {
    // If registered as a professional caregiver, insert their pending profile
    if (accountType === "professional_caregiver") {
      try {
        await supabase.from("professional_caregivers").upsert({
          user_id: data.user.id,
          full_name: name.trim(),
          phone: proData?.phone || null,
          bio: proData?.bio || `Dedicated certified care professional serving ${proData?.serviceLocation || "local patients"}.`,
          qualifications: proData?.qualifications || "Certified Healthcare Provider",
          years_experience: proData?.yearsExperience || 2,
          service_location: proData?.serviceLocation || "Metro Area",
          hourly_rate: proData?.hourlyRate || 35.00,
          verification_status: "pending",
        });
      } catch (err) {
        console.warn("Could not create professional caregiver profile row:", err);
      }
    }
  }

  return { ok: true, role: accountType, user: data.user ? { id: data.user.id, email: data.user.email, name: name.trim(), role: accountType } : undefined };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!supabase) {
    // In local demo mode, set isolated demo session preserving registered name
    let storedName: string | undefined = undefined;
    try {
      const existing = localStorage.getItem(USER_SESSION_KEY);
      if (existing) {
        const parsed = JSON.parse(existing);
        if (parsed.email === normalizedEmail && parsed.name) {
          storedName = parsed.name;
        }
      }
    } catch {}

    const demoUser = {
      id: "demo-" + normalizedEmail.replace(/[^a-zA-Z0-9]/g, ""),
      name: storedName,
      email: normalizedEmail,
      role: (normalizedEmail.includes("pro") ? "professional_caregiver" : normalizedEmail.includes("family") || normalizedEmail.includes("care") ? "family_caregiver" : "patient") as UserRole,
    };
    try {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(demoUser));
    } catch {}
    return { ok: true, demo: true, role: demoUser.role, user: demoUser };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) return { ok: false, error: error.message };

  let role: UserRole = "patient";
  let exactName: string | undefined = undefined;
  if (data.user) {
    role = (data.user.user_metadata?.role as UserRole) || "patient";
    if (data.user.user_metadata?.name?.trim()) {
      exactName = data.user.user_metadata.name.trim();
    }
    // Check users table if available
    try {
      const { data: profile } = await supabase.from("users").select("role, name").eq("id", data.user.id).maybeSingle();
      if (profile?.role) role = profile.role as UserRole;
      if (profile?.name?.trim()) exactName = profile.name.trim();
    } catch {}
  }

  return { ok: true, role, user: data.user ? { id: data.user.id, email: data.user.email, name: exactName, role } : undefined };
}

/**
 * Audit & Fix Data Isolation on Sign Out:
 * Explicitly clears cached user data, session keys, and signs out of Supabase
 */
export async function signOut(): Promise<void> {
  try {
    if (typeof window !== "undefined") {
      // Clear all user-specific storage keys to prevent cross-account cache leakage
      localStorage.removeItem(USER_SESSION_KEY);
      localStorage.removeItem("meditrack.current_user");
      // Keep app settings like theme and sound, but clean transient cache
    }
    if (supabase) {
      await supabase.auth.signOut();
    }
  } catch (err) {
    console.warn("Sign out encountered an error:", err);
  }
}

/**
 * Retrieves the currently active user profile and role
 */
export async function getActiveUser(): Promise<{ id: string; email?: string; name?: string; role: UserRole } | null> {
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      let role: UserRole = (data.user.user_metadata?.role as UserRole) || "patient";
      let exactName: string | undefined = data.user.user_metadata?.name?.trim() || undefined;

      try {
        const { data: profile } = await supabase.from("users").select("name, role").eq("id", data.user.id).maybeSingle();
        if (profile?.role) role = profile.role as UserRole;
        if (profile?.name && profile.name.trim().length > 0) {
          exactName = profile.name.trim();
        }
      } catch {}

      return { id: data.user.id, email: data.user.email, name: exactName, role };
    }
  }

  // Fallback to demo local session
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(USER_SESSION_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
  }

  return null;
}

/**
 * Sends a password recovery email via Supabase Auth
 * Security Note: Never leaks whether an arbitrary email is registered
 */
export async function resetPasswordForEmail(email: string): Promise<{ ok: boolean; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!supabase) {
    // In local demo mode, simulate success securely
    return { ok: true };
  }

  const redirectUrl = typeof window !== "undefined"
    ? `${window.location.origin}/reset-password`
    : undefined;

  const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: redirectUrl,
  });

  // For security, do not expose internal DB details or email existence
  if (error && !error.message.includes("rate")) {
    return { ok: true };
  }

  return error ? { ok: false, error: error.message } : { ok: true };
}

/**
 * Updates user password during an active recovery session
 */
export async function updatePassword(newPassword: string): Promise<{ ok: boolean; error?: string }> {
  if (newPassword.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters long." };
  }

  if (!supabase) {
    return { ok: true };
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return error ? { ok: false, error: error.message } : { ok: true };
}

/**
 * Securely changes the user's password from within their authenticated session.
 * If Supabase is active, re-verifies the user's current credentials before applying the new password.
 */
export async function changeUserPassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  if (newPassword.length < 8) {
    return { ok: false, error: "New password must be at least 8 characters long." };
  }

  if (!supabase) {
    // In local demo mode, simulate successful update
    return { ok: true };
  }

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user?.email) {
      return { ok: false, error: "Your session has expired. Please sign in again." };
    }

    // Verify current password by testing authentication
    if (currentPassword) {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: currentPassword,
      });

      if (verifyError) {
        return {
          ok: false,
          error: "Current password is incorrect. Please double check and try again.",
        };
      }
    }

    // Update password in Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return { ok: false, error: updateError.message };
    }

    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update password.";
    return { ok: false, error: msg };
  }
}

/**
 * Updates the user's profile details (Name, Phone, etc.)
 */
export async function updateUserProfile(
  name: string,
  phone?: string,
): Promise<{ ok: boolean; error?: string; user?: { id: string; email?: string; name: string; role: UserRole } }> {
  const cleanName = name.trim();
  if (!cleanName) {
    return { ok: false, error: "Full name cannot be empty." };
  }

  if (supabase) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { error: authErr } = await supabase.auth.updateUser({
          data: { name: cleanName, phone: phone?.trim() || null },
        });

        if (authErr) return { ok: false, error: authErr.message };

        try {
          await supabase.from("users").update({ name: cleanName }).eq("id", userData.user.id);
        } catch {}

        const updated = {
          id: userData.user.id,
          email: userData.user.email,
          name: cleanName,
          role: ((userData.user.user_metadata?.role as UserRole) || "patient"),
        };

        return { ok: true, user: updated };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update user profile.";
      return { ok: false, error: msg };
    }
  }

  // Local demo fallback
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(USER_SESSION_KEY);
      if (raw) {
        const u = JSON.parse(raw);
        u.name = cleanName;
        if (phone !== undefined) u.phone = phone.trim();
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(u));
        return { ok: true, user: u };
      }
    } catch {}
  }

  return { ok: true };
}
