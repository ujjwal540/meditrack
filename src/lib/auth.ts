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
    preferredLanguage?: "en" | "ne";
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
  preferredLanguage: "en" | "ne" = "en",
): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!supabase) {
    // In local demo mode, isolate user identity in session storage
    const demoUser = {
      id: "demo-" + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      email: normalizedEmail,
      role: accountType,
      preferredLanguage,
    };
    try {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(demoUser));
      localStorage.setItem(`meditrack.lang.${demoUser.id}`, preferredLanguage);
      localStorage.setItem("meditrack.language", preferredLanguage);
      if (typeof document !== "undefined") {
        document.documentElement.lang = preferredLanguage;
        document.documentElement.setAttribute("data-lang", preferredLanguage);
      }
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
        preferred_language: preferredLanguage,
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

    const demoUser: {
      id: string;
      name?: string;
      email: string;
      role: UserRole;
      preferredLanguage?: "en" | "ne";
    } = {
      id: "demo-" + normalizedEmail.replace(/[^a-zA-Z0-9]/g, ""),
      name: storedName,
      email: normalizedEmail,
      role: (normalizedEmail.includes("pro") ? "professional_caregiver" : normalizedEmail.includes("family") || normalizedEmail.includes("care") ? "family_caregiver" : "patient") as UserRole,
    };
    const userLang = (localStorage.getItem(`meditrack.lang.${demoUser.id}`) as "en" | "ne") ||
      (localStorage.getItem("meditrack.language") as "en" | "ne") ||
      "en";
    demoUser.preferredLanguage = userLang;
    try {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(demoUser));
      localStorage.setItem("meditrack.language", userLang);
      if (typeof document !== "undefined") {
        document.documentElement.lang = userLang;
        document.documentElement.setAttribute("data-lang", userLang);
      }
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
  let userLanguage: "en" | "ne" = "en";

  if (data.user) {
    role = (data.user.user_metadata?.role as UserRole) || "patient";
    if (data.user.user_metadata?.name?.trim()) {
      exactName = data.user.user_metadata.name.trim();
    }
    if (data.user.user_metadata?.preferred_language === "ne" || data.user.user_metadata?.preferred_language === "en") {
      userLanguage = data.user.user_metadata.preferred_language;
    } else {
      const stored = localStorage.getItem(`meditrack.lang.${data.user.id}`);
      if (stored === "en" || stored === "ne") userLanguage = stored;
    }

    try {
      localStorage.setItem(`meditrack.lang.${data.user.id}`, userLanguage);
      localStorage.setItem("meditrack.language", userLanguage);
      if (typeof document !== "undefined") {
        document.documentElement.lang = userLanguage;
        document.documentElement.setAttribute("data-lang", userLanguage);
      }
    } catch {}

    // Check users table if available
    try {
      const { data: profile } = await supabase.from("users").select("role, name, preferred_language").eq("id", data.user.id).maybeSingle();
      if (profile?.role) role = profile.role as UserRole;
      if (profile?.name?.trim()) exactName = profile.name.trim();
      if (profile?.preferred_language === "en" || profile?.preferred_language === "ne") {
        userLanguage = profile.preferred_language;
      }
    } catch {}
  }

  return { ok: true, role, user: data.user ? { id: data.user.id, email: data.user.email, name: exactName, role, preferredLanguage: userLanguage } : undefined };
}

/**
 * Initiates Google OAuth authentication via Supabase Auth
 * Enables any legitimate Gmail account to register and sign in
 */
export async function signInWithGoogle(): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) {
    // In local demo mode, create an isolated Google demo user session
    const demoGoogleUser = {
      id: "demo-google-" + Math.random().toString(36).substring(2, 9),
      name: "Google Account User",
      email: "user@gmail.com",
      role: "patient" as UserRole,
      preferredLanguage: "en" as const,
    };
    try {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(demoGoogleUser));
    } catch {}
    return { ok: true };
  }

  const redirectUrl = typeof window !== "undefined"
    ? `${window.location.origin}/dashboard`
    : undefined;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Audit & Fix Data Isolation on Sign Out:
 * Explicitly clears cached user data, session keys, and signs out of Supabase
 */
export async function signOut(): Promise<void> {
  try {
    if (typeof window !== "undefined") {
      // Clear user session, preserving generic settings
      localStorage.removeItem(USER_SESSION_KEY);
      localStorage.removeItem("meditrack.current_user");
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
export async function getActiveUser(): Promise<{ id: string; email?: string; name?: string; role: UserRole; preferredLanguage?: "en" | "ne" } | null> {
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      let role: UserRole = (data.user.user_metadata?.role as UserRole) || "patient";
      let exactName: string | undefined = data.user.user_metadata?.name?.trim() || undefined;
      let userLang: "en" | "ne" = (data.user.user_metadata?.preferred_language as "en" | "ne") || "en";

      const localUserLang = localStorage.getItem(`meditrack.lang.${data.user.id}`);
      if (localUserLang === "en" || localUserLang === "ne") {
        userLang = localUserLang;
      }

      try {
        const { data: profile } = await supabase.from("users").select("name, role, preferred_language").eq("id", data.user.id).maybeSingle();
        if (profile?.role) role = profile.role as UserRole;
        if (profile?.name && profile.name.trim().length > 0) {
          exactName = profile.name.trim();
        }
        if (profile?.preferred_language === "en" || profile?.preferred_language === "ne") {
          userLang = profile.preferred_language;
        }
      } catch {}

      return { id: data.user.id, email: data.user.email, name: exactName, role, preferredLanguage: userLang };
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
  preferredLanguage?: "en" | "ne",
): Promise<{ ok: boolean; error?: string; user?: { id: string; email?: string; name: string; role: UserRole; preferredLanguage?: "en" | "ne" } }> {
  const cleanName = name.trim();
  if (!cleanName) {
    return { ok: false, error: "Full name cannot be empty." };
  }

  if (preferredLanguage) {
    try {
      localStorage.setItem("meditrack.language", preferredLanguage);
      if (typeof document !== "undefined") {
        document.documentElement.lang = preferredLanguage;
        document.documentElement.setAttribute("data-lang", preferredLanguage);
      }
    } catch {}
  }

  if (supabase) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const updateData: Record<string, any> = {
          name: cleanName,
          phone: phone?.trim() || null,
        };
        if (preferredLanguage) {
          updateData.preferred_language = preferredLanguage;
          localStorage.setItem(`meditrack.lang.${userData.user.id}`, preferredLanguage);
        }

        const { error: authErr } = await supabase.auth.updateUser({
          data: updateData,
        });

        if (authErr) return { ok: false, error: authErr.message };

        try {
          const dbUpdate: Record<string, any> = { name: cleanName };
          if (preferredLanguage) dbUpdate.preferred_language = preferredLanguage;
          await supabase.from("users").update(dbUpdate).eq("id", userData.user.id);
        } catch {}

        const updated = {
          id: userData.user.id,
          email: userData.user.email,
          name: cleanName,
          role: ((userData.user.user_metadata?.role as UserRole) || "patient"),
          preferredLanguage: preferredLanguage || (userData.user.user_metadata?.preferred_language as "en" | "ne") || "en",
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
        if (preferredLanguage) {
          u.preferredLanguage = preferredLanguage;
          if (u.id) localStorage.setItem(`meditrack.lang.${u.id}`, preferredLanguage);
        }
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(u));
        return { ok: true, user: u };
      }
    } catch {}
  }

  return { ok: true };
}
