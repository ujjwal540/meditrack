"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { resetPasswordForEmail } from "@/lib/auth";
import { useTranslation } from "@/i18n/LanguageContext";

const field =
  "mt-1.5 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] shadow-sm transition focus:border-[#20D6C2] focus:outline-none focus:ring-2 focus:ring-[#20D6C2]/20";

export default function ForgotPasswordPage() {
  const { t, isNepali } = useTranslation();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) return;

    setLoading(true);
    const res = await resetPasswordForEmail(email);
    setLoading(false);

    if (res.ok) {
      setSubmitted(true);
    } else {
      setError(
        res.error || (isNepali ? "पुनर्प्राप्ति इमेल पठाउन सकिएन। कृपया पछि पुनः प्रयास गर्नुहोस्।" : "Unable to send recovery email. Please try again later.")
      );
    }
  }

  return (
    <AuthShell
      eyebrow={isNepali ? "खाता सुरक्षा" : "Account Security"}
      title={t.auth.resetPasswordTitle}
      subtitle={t.auth.resetPasswordSubtitle}
      backHref="/login"
    >
      {submitted ? (
        <div className="space-y-5 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#16A36A]/20 text-[#16A36A] dark:text-[#20D6C2] border border-[#20D6C2]/30">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-display text-xl font-bold text-[var(--text)]">
              {t.auth.checkInboxTitle}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-sm mx-auto">
              {t.auth.checkInboxDesc} <strong className="text-[var(--text)]">{email}</strong>
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3 text-[11px] text-[var(--text-muted)]">
            {isNepali
              ? "इमेल प्राप्त भएन? स्पाम फोल्डर जाँच्नुहोस् वा केही मिनेट पर्खेर पुनः प्रयास गर्नुहोस्।"
              : "Didn't receive an email? Check your spam folder or wait a few minutes before trying again."}
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 text-xs font-bold text-[#16A36A] dark:text-[#20D6C2] hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {t.auth.backToLogin}
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
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
            {loading ? t.auth.sendingLink : t.auth.sendResetLink}
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

