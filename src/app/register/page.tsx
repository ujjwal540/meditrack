"use client";

import Link from "next/link";
import {
  Briefcase,
  CheckCircle2,
  Eye,
  EyeOff,
  HeartHandshake,
  Languages,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { type AccountType, signUp } from "@/lib/auth";
import { useTranslation } from "@/i18n/LanguageContext";
import type { SupportedLanguage } from "@/types";

const field =
  "mt-1.5 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] shadow-sm transition focus:border-[#20D6C2] focus:outline-none focus:ring-2 focus:ring-[#20D6C2]/20";

export default function RegisterPage() {
  const router = useRouter();
  const { t, language, setLanguage, isNepali } = useTranslation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("patient");
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);

  // Professional Caregiver specific fields
  const [phone, setPhone] = useState("");
  const [serviceLocation, setServiceLocation] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [yearsExperience, setYearsExperience] = useState<number>(3);
  const [hourlyRate, setHourlyRate] = useState<number>(35);
  const [bio, setBio] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) return setError(t.auth.passwordsDoNotMatch);
    if (password.length < 8) return setError(t.auth.passwordTooShort);
    if (!terms) return setError(t.auth.acceptTermsRequired);

    if (accountType === "professional_caregiver") {
      if (!serviceLocation.trim()) return setError("Please enter your primary service location / सेवाको स्थान लेख्नुहोस्।");
      if (!qualifications.trim()) return setError("Please enter your qualifications / योग्यता उल्लेख गर्नुहोस्।");
    }

    setError(null);
    setDemo(false);
    setLoading(true);

    const proData = accountType === "professional_caregiver" ? {
      phone: phone.trim() || undefined,
      serviceLocation: serviceLocation.trim(),
      qualifications: qualifications.trim(),
      yearsExperience,
      hourlyRate,
      bio: bio.trim() || undefined,
    } : undefined;

    const res = await signUp(name.trim(), email.trim(), password, accountType, proData, language);
    setLoading(false);

    if (res.ok) {
      if (accountType === "professional_caregiver") {
        return router.push("/marketplace?role=professional");
      } else if (accountType === "family_caregiver") {
        return router.push("/family");
      }
      return router.push("/dashboard");
    }

    setError(res.error ?? "We could not create your account. Please try again.");
    setDemo(Boolean(res.demo));
  }

  return (
    <AuthShell
      eyebrow={t.auth.joinMediTrack}
      title={t.auth.registerTitle}
      subtitle={t.auth.registerSubtitle}
    >
      <form onSubmit={submit} className="space-y-4">
        {/* Preferred Language Selection During Onboarding */}
        <fieldset className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)]/40 p-3.5">
          <legend className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] px-1">
            <span className="inline-flex items-center gap-1.5">
              <Languages className="h-3.5 w-3.5 text-[#16A36A] dark:text-[#20C982]" />
              <span>{t.auth.selectLanguageLabel}</span>
            </span>
          </legend>
          <div className="grid grid-cols-2 gap-2.5 mt-1.5">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-bold transition-all ${
                language === "en"
                  ? "border-[#16A36A] bg-[#16A36A]/15 text-[#16A36A] dark:text-[#A3EAC1] shadow-[0_0_14px_rgba(22,163,106,0.2)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[#16A36A]/40"
              }`}
            >
              <span>English</span>
              {language === "en" && <CheckCircle2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setLanguage("ne")}
              className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-bold transition-all ${
                language === "ne"
                  ? "border-[#16A36A] bg-[#16A36A]/15 text-[#16A36A] dark:text-[#A3EAC1] shadow-[0_0_14px_rgba(22,163,106,0.2)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[#16A36A]/40"
              }`}
            >
              <span>नेपाली (Nepali)</span>
              {language === "ne" && <CheckCircle2 className="h-4 w-4" />}
            </button>
          </div>
        </fieldset>

        {/* Role Selection Tabs */}
        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
            {t.auth.registeringAs}
          </legend>
          <div className="grid grid-cols-3 gap-1.5 xs:gap-2">
            {[
              { id: "patient", label: t.auth.patientRole, Icon: User, desc: isNepali ? "व्यक्तिगत" : "Personal" },
              { id: "family_caregiver", label: t.auth.familyRole, Icon: HeartHandshake, desc: isNepali ? "परिवार" : "Family" },
              { id: "professional_caregiver", label: t.auth.careProRole, Icon: Briefcase, desc: isNepali ? "विज्ञ सेवा" : "Licensed" },
            ].map(({ id, label, Icon, desc }) => (
              <label
                key={id}
                className={`cursor-pointer rounded-xl border p-1.5 xs:p-2.5 text-center transition-all ${
                  accountType === id
                    ? "border-[#20D6C2] bg-[#16A36A]/15 text-[#16A36A] dark:text-[#A3EAC1] shadow-[0_0_15px_rgba(32,214,194,0.22)]"
                    : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:border-[#20D6C2]/40"
                }`}
              >
                <input
                  type="radio"
                  name="accountType"
                  value={id}
                  checked={accountType === id}
                  onChange={() => setAccountType(id as AccountType)}
                  className="sr-only"
                />
                <Icon className="h-4 w-4 mx-auto mb-1" />
                <span className="block text-[10px] xs:text-xs font-bold truncate">{label}</span>
                <span className="block text-[9px] xs:text-[10px] opacity-75 truncate">{desc}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          {t.auth.fullNameLabel}
          <span className="relative block">
            <UserRound
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden="true"
            />
            <input
              required
              autoComplete="name"
              placeholder={t.auth.fullNamePlaceholder}
              className={`${field} pl-10`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </span>
        </label>

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

        {/* Professional Caregiver Fields */}
        {accountType === "professional_caregiver" && (
          <div className="rounded-2xl border border-[#20D6C2]/30 bg-[#20D6C2]/5 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#16A36A] dark:text-[#20D6C2]">
              <Briefcase className="h-4 w-4" />
              <span>{isNepali ? "व्यावसायिक योग्यता र प्रमाणिकरण" : "Professional Credentials & Verification"}</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)]">
                {isNepali ? "सम्पर्क फोन" : "Contact Phone"}
                <input
                  type="tel"
                  placeholder="(555) 012-3456"
                  className={field}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>

              <label className="block text-[11px] font-semibold text-[var(--text-secondary)]">
                {isNepali ? "सेवा स्थान" : "Service Location"}
                <input
                  type="text"
                  required
                  placeholder="e.g. Kathmandu, NY"
                  className={field}
                  value={serviceLocation}
                  onChange={(e) => setServiceLocation(e.target.value)}
                />
              </label>
            </div>

            <label className="block text-[11px] font-semibold text-[var(--text-secondary)]">
              {isNepali ? "योग्यता र लाइसेन्स" : "Qualifications & Licenses"}
              <input
                type="text"
                required
                placeholder="e.g. RN (Registered Nurse), CNA, Geriatric Specialist"
                className={field}
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
              />
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)]">
                {isNepali ? "अनुभवका वर्ष" : "Years of Experience"}
                <select
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(Number(e.target.value))}
                  className={field}
                >
                  <option value={1}>{isNepali ? "१ वर्ष" : "1 year"}</option>
                  <option value={2}>{isNepali ? "२ वर्ष" : "2 years"}</option>
                  <option value={3}>{isNepali ? "३–५ वर्ष" : "3–5 years"}</option>
                  <option value={6}>{isNepali ? "६–१० वर्ष" : "6–10 years"}</option>
                  <option value={10}>{isNepali ? "१०+ वर्ष" : "10+ years"}</option>
                </select>
              </label>

              <label className="block text-[11px] font-semibold text-[var(--text-secondary)]">
                {isNepali ? "प्रति घण्टा शुल्क ($/hr)" : "Hourly Rate ($/hr)"}
                <input
                  type="number"
                  min={15}
                  max={250}
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className={field}
                />
              </label>
            </div>

            <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1.5 pt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-[#20D6C2] shrink-0" />
              <span>{isNepali ? "कागजात प्रमाणीकरण नभएसम्म विवरण परीक्षणमा रहनेछ।" : "Professional credentials remain in pending status until verification documents are reviewed."}</span>
            </p>
          </div>
        )}

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
              minLength={8}
              autoComplete="new-password"
              placeholder={t.auth.passwordPlaceholder}
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

        <label className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] leading-relaxed cursor-pointer">
          <input
            type="checkbox"
            required
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-[var(--border)] text-[#16A36A] focus:ring-[#16A36A]"
          />
          <span>{t.auth.termsAgreement}</span>
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
          {loading ? t.auth.creatingAccount : t.auth.createAccountButton}
        </Button>
      </form>

      {demo && (
        <Link
          href="/dashboard"
          className="mt-4 block rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-center text-xs font-bold text-amber-500 dark:text-[#FBBF24] hover:bg-amber-500/20 transition-colors"
        >
          {t.auth.continueDemo}
        </Link>
      )}

      <p className="mt-6 text-center text-xs text-[var(--text-secondary)]">
        {t.auth.alreadyHaveAccount}{" "}
        <Link
          href="/login"
          className="font-bold text-[#16A36A] dark:text-[#20C982] hover:underline underline-offset-4"
        >
          {t.nav.signIn}
        </Link>
      </p>
    </AuthShell>
  );
}
