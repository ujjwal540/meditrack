"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, LockKeyhole, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { updatePassword } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/i18n/LanguageContext";

const field =
  "mt-1.5 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] shadow-sm transition focus:border-[#20D6C2] focus:outline-none focus:ring-2 focus:ring-[#20D6C2]/20";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { t, isNepali } = useTranslation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if recovery access token is present in Supabase Auth session or URL hash
    async function checkSession() {
      if (!supabase) {
        setHasSession(true); // Demo mode allowed
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setHasSession(true);
      } else {
        // Look for token in URL hash
        if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
          setHasSession(true);
        } else {
          setHasSession(false);
        }
      }
    }
    void checkSession();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      return setError(t.auth.passwordsDoNotMatch);
    }
    if (password.length < 8) {
      return setError(t.auth.passwordTooShort);
    }

    setLoading(true);
    const res = await updatePassword(password);
    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } else {
      setError(
        res.error || (isNepali ? "पासवर्ड परिवर्तन गर्न असफल भयो। पुनर्प्राप्ति लिङ्कको म्याद सकिएको हुन सक्छ।" : "Failed to update password. Your recovery link may have expired.")
      );
    }
  }

  if (hasSession === false) {
    return (
      <AuthShell
        eyebrow={isNepali ? "लिङ्कको म्याद सकियो" : "Recovery Link Expired"}
        title={t.auth.invalidResetLink}
        subtitle={isNepali ? "यो पासवर्ड पुनर्प्राप्ति सत्र अब मान्य छैन।" : "This password recovery session is no longer valid."}
      >
        <div className="space-y-5 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {isNepali
              ? "तपाईंको चिकित्सा खाता सुरक्षाको लागि पासवर्ड रिसेट लिङ्कको म्याद सकिन्छ। कृपया अगाडि बढ्न नयाँ रिसेट लिङ्क अनुरोध गर्नुहोस्।"
              : "Password reset links expire for your medical account protection. Please request a fresh reset link to proceed."}
          </p>
          <div className="pt-2">
            <Link
              href="/forgot-password"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#16A36A] to-[#20C982] px-6 text-xs font-bold text-white shadow-md hover:brightness-105"
            >
              {isNepali ? "नयाँ रिसेट लिङ्क अनुरोध गर्नुहोस्" : "Request New Reset Link"}
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow={isNepali ? "सुरक्षित अद्यावधिक" : "Secure Update"}
      title={isNepali ? "नयाँ पासवर्ड सिर्जना गर्नुहोस्" : "Create new password"}
      subtitle={isNepali ? "कम्तीमा ८ अक्षरको बलियो पासवर्ड छान्नुहोस्।" : "Choose a strong password with at least 8 characters."}
      backHref="/login"
    >
      {success ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#16A36A]/20 text-[#16A36A] dark:text-[#20C982] border border-[#20D6C2]/30">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h3 className="font-display text-xl font-bold text-[var(--text)]">
            {t.auth.passwordUpdatedTitle}
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            {isNepali ? "तपाईंको पासवर्ड सफलतापूर्वक परिवर्तन भयो। लग इन पृष्ठमा पठाउँदै..." : "Your password has been securely reset. Redirecting you to sign in..."}
          </p>
          <Link
            href="/login"
            className="mt-3 inline-block text-xs font-bold text-[#16A36A] dark:text-[#20C982] hover:underline"
          >
            {isNepali ? "यदि स्वचालित रूपमा गएन भने यहाँ थिच्नुहोस्" : "Click here if not redirected automatically"}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            {t.auth.newPasswordLabel}
            <span className="relative block">
              <LockKeyhole
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
                aria-hidden="true"
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder={isNepali ? "कम्तीमा ८ अक्षर" : "At least 8 characters"}
                className={`${field} pl-10 pr-10`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </span>
          </label>

          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            {t.auth.confirmPasswordLabel}
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder={t.auth.confirmPasswordPlaceholder}
              className={field}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-500 dark:text-[#FB7185] leading-relaxed"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            size="md"
            variant="primary"
            className="w-full text-sm font-bold mt-2"
          >
            {loading ? "..." : t.auth.updatePasswordButton}
          </Button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[#16A36A] dark:hover:text-[#20D6C2] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {t.auth.backToLogin}
            </Link>
          </div>
        </form>
      )}
    </AuthShell>
  );
}

