"use client";

import Link from "next/link";
import {
  Briefcase,
  CheckCircle2,
  Eye,
  EyeOff,
  HeartHandshake,
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

const field =
  "mt-1.5 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] shadow-sm transition focus:border-[#20D6C2] focus:outline-none focus:ring-2 focus:ring-[#20D6C2]/20";

export default function RegisterPage() {
  const router = useRouter();
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
    if (password !== confirmPassword) return setError("Passwords do not match.");
    if (password.length < 8) return setError("Use at least 8 characters for your password.");
    if (!terms) return setError("Please agree to the terms and privacy notice to continue.");

    if (accountType === "professional_caregiver") {
      if (!serviceLocation.trim()) return setError("Please enter your primary service location.");
      if (!qualifications.trim()) return setError("Please enter your qualifications or license.");
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

    const res = await signUp(name.trim(), email.trim(), password, accountType, proData);
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
      eyebrow="Join MediTrack"
      title="Create your care space"
      subtitle="A calmer, safer way to manage medicines and coordinate care."
    >
      <form onSubmit={submit} className="space-y-4">
        {/* Role Selection Tabs */}
        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
            I am registering as:
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "patient", label: "Patient", Icon: User, desc: "Personal care" },
              { id: "family_caregiver", label: "Family Caregiver", Icon: HeartHandshake, desc: "Trusted circle" },
              { id: "professional_caregiver", label: "Professional", Icon: Briefcase, desc: "Licensed care" },
            ].map(({ id, label, Icon, desc }) => (
              <label
                key={id}
                className={`cursor-pointer rounded-xl border p-2.5 text-center transition-all ${
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
                <span className="block text-xs font-bold truncate">{label}</span>
                <span className="block text-[10px] opacity-75 truncate">{desc}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Full Name
          <span className="relative block">
            <UserRound
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden="true"
            />
            <input
              required
              autoComplete="name"
              placeholder="Your full name"
              className={`${field} pl-10`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </span>
        </label>

        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Email Address
          <span className="relative block">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden="true"
            />
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
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
              <span>Professional Credentials &amp; Verification</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)]">
                Contact Phone
                <input
                  type="tel"
                  placeholder="(555) 012-3456"
                  className={field}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>

              <label className="block text-[11px] font-semibold text-[var(--text-secondary)]">
                Service Location
                <input
                  type="text"
                  required
                  placeholder="e.g. New York, NY"
                  className={field}
                  value={serviceLocation}
                  onChange={(e) => setServiceLocation(e.target.value)}
                />
              </label>
            </div>

            <label className="block text-[11px] font-semibold text-[var(--text-secondary)]">
              Qualifications &amp; Licenses
              <input
                type="text"
                required
                placeholder="e.g. RN (Registered Nurse), CNA, Geriatric Care Specialist"
                className={field}
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
              />
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)]">
                Years of Experience
                <select
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(Number(e.target.value))}
                  className={field}
                >
                  <option value={1}>1 year</option>
                  <option value={2}>2 years</option>
                  <option value={3}>3–5 years</option>
                  <option value={6}>6–10 years</option>
                  <option value={10}>10+ years</option>
                </select>
              </label>

              <label className="block text-[11px] font-semibold text-[var(--text-secondary)]">
                Hourly Rate ($/hr)
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
              <span>Professional credentials remain in pending status until verification documents are reviewed.</span>
            </p>
          </div>
        )}

        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Password
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
              placeholder="At least 8 characters"
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
          Confirm Password
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Repeat your password"
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
          <span>I agree to the MediTrack terms of service and healthcare privacy notice.</span>
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
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      {demo && (
        <Link
          href="/dashboard"
          className="mt-4 block rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-center text-xs font-bold text-amber-500 dark:text-[#FBBF24] hover:bg-amber-500/20 transition-colors"
        >
          Continue in Demo Mode (Local Storage)
        </Link>
      )}

      <p className="mt-6 text-center text-xs text-[var(--text-secondary)]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-bold text-[#16A36A] dark:text-[#20C982] hover:underline underline-offset-4"
        >
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
