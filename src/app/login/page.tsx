"use client";

import Link from "next/link";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { signIn, signInWithGoogle } from "@/lib/auth";
import { useTranslation } from "@/i18n/LanguageContext";

const field =
  "mt-1.5 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] shadow-sm transition-all duration-200 focus:border-[#20D6C2] focus:outline-none focus:ring-2 focus:ring-[#20D6C2]/20";

export default function LoginPage() {
  const router = useRouter();
  const { t, isNepali } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    setError(null);
    setLoading(true);
    const res = await signInWithGoogle();
    setLoading(false);
    if (res.ok) {
      router.push("/dashboard");
    } else if (res.error) {
      setError(res.error);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDemo(false);
    setLoading(true);
    const res = await signIn(email.trim(), password);
    setLoading(false);
    if (res.ok) {
      if (res.role === "professional_caregiver") {
        return router.push("/marketplace?role=professional");
      } else if (res.role === "family_caregiver") {
        return router.push("/family");
      }
      return router.push("/dashboard");
    }
    setError(
      res.error ?? (isNepali ? "लग इन हुन सकेन। कृपया आफ्नो विवरण जाँच्नुहोस्।" : "We could not sign you in. Please check your credentials.")
    );
    setDemo(Boolean(res.demo));
  }

  async function handleQuickDemo(demoEmail: string, roleRoute: string) {
    setError(null);
    setLoading(true);
    const res = await signIn(demoEmail, "DemoPassword123!");
    setLoading(false);
    if (res.ok) router.push(roleRoute);
  }

  return (
    <AuthShell
      eyebrow={isNepali ? "स्वागत छ" : "Welcome Back"}
      title={t.auth.signInTitle}
      subtitle={t.auth.signInSubtitle}
    >
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          {t.auth.emailLabel}
          <span className="relative block">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden="true"
            />
            <input
              type="email"
              required
              autoComplete="email"
              placeholder={t.auth.emailPlaceholder}
              className={`${field} pl-10`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </span>
        </label>

        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          {t.auth.passwordLabel}
          <span className="relative block">
            <LockKeyhole
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden="true"
            />
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder={t.auth.passwordPlaceholder}
              className={`${field} pl-10 pr-10 font-mono`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors focus-visible:outline-[#20D6C2]"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </span>
        </label>

        <div className="flex items-center justify-between gap-3 text-xs">
          <label className="flex items-center gap-2 text-[var(--text-secondary)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--border)] text-[#16A36A] focus:ring-[#20D6C2]"
            />
            <span>{t.auth.rememberMe}</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-[#16A36A] dark:text-[#20C982] hover:text-[#20D6C2] hover:underline"
          >
            {t.auth.forgotPassword}
          </Link>
        </div>

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
          {loading ? t.auth.signingIn : t.auth.signInButton}
        </Button>
      </form>

      <div className="relative my-4 flex items-center justify-center">
        <div className="w-full border-t border-[var(--border)]" />
        <span className="absolute bg-[var(--surface-card)] px-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          {isNepali ? "वा" : "or continue with"}
        </span>
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] p-3 text-xs font-semibold text-[var(--text)] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#20D6C2]/30"
      >
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{isNepali ? "गुगल मार्फत साइन इन गर्नुहोस्" : "Sign in with Google"}</span>
      </button>

      {demo && (
        <Link
          href="/dashboard"
          className="mt-4 block rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-center text-xs font-bold text-amber-500 dark:text-[#FBBF24] hover:bg-amber-500/20 transition-colors"
        >
          {isNepali ? "डेमो मोडमा जारी राख्नुहोस् (स्थानीय भण्डारण)" : "Continue in Demo Mode (Local Storage)"}
        </Link>
      )}

      {/* Instant Demo Accounts Selector */}
      <div className="mt-5 pt-4 border-t border-[var(--border)]">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] text-center mb-2.5">
          {isNepali ? "वा १-क्लिकमा परीक्षण खाता छान्नुहोस्:" : "Or try a 1-click test role:"}
        </p>
        <div className="grid grid-cols-1 xs:grid-cols-3 gap-1.5 xs:gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleQuickDemo("eleanor.vance@example.com", "/dashboard")}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-2 xs:p-2 text-center text-[11px] font-semibold text-[var(--text-secondary)] hover:border-[#20D6C2] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition-all"
          >
            <span className="block font-bold text-[var(--text)]">{t.auth.patientRole}</span>
            <span className="block text-[10px] text-[var(--text-muted)] truncate">Eleanor</span>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleQuickDemo("sarah.caregiver@example.com", "/family")}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-2 xs:p-2 text-center text-[11px] font-semibold text-[var(--text-secondary)] hover:border-[#20D6C2] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition-all"
          >
            <span className="block font-bold text-[var(--text)]">{t.auth.familyRole}</span>
            <span className="block text-[10px] text-[var(--text-muted)] truncate">Sarah</span>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleQuickDemo("elena.pro@meditrack.care", "/marketplace?role=professional")}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-2 xs:p-2 text-center text-[11px] font-semibold text-[var(--text-secondary)] hover:border-[#20D6C2] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition-all"
          >
            <span className="block font-bold text-[var(--text)]">{t.auth.careProRole}</span>
            <span className="block text-[10px] text-[var(--text-muted)] truncate">Elena, RN</span>
          </button>
        </div>
      </div>

      <p className="mt-5 text-center text-xs text-[var(--text-secondary)]">
        {t.auth.dontHaveAccount}{" "}
        <Link
          href="/register"
          className="font-bold text-[#16A36A] dark:text-[#20C982] hover:text-[#20D6C2] hover:underline underline-offset-4"
        >
          {t.auth.createAccount}
        </Link>
      </p>
    </AuthShell>
  );
}

