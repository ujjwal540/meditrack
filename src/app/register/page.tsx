"use client";

import Link from "next/link";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { type AccountType, signUp } from "@/lib/auth";

const field =
  "mt-1.5 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] shadow-sm transition focus:border-[#16A36A] focus:outline-none focus:ring-2 focus:ring-[#16A36A]/20";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("patient");
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) return setError("Passwords do not match.");
    if (password.length < 8) return setError("Use at least 8 characters for your password.");
    if (!terms) return setError("Please agree to the terms and privacy notice to continue.");
    setError(null);
    setDemo(false);
    setLoading(true);
    const res = await signUp(name.trim(), email.trim(), password, accountType);
    setLoading(false);
    if (res.ok) return router.push("/dashboard");
    setError(res.error ?? "We could not create your account. Please try again.");
    setDemo(Boolean(res.demo));
  }

  return (
    <AuthShell
      eyebrow="Get Started"
      title="Create your care space"
      subtitle="A calmer way to manage medicines and stay connected with family."
    >
      <form onSubmit={submit} className="space-y-4">
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
              placeholder="Your full legal name"
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

        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
            I am registering as
          </legend>
          <div className="grid grid-cols-2 gap-2.5">
            {([["patient", "Patient"], ["caregiver", "Family Caregiver"]] as const).map(
              ([value, label]) => (
                <label
                  key={value}
                  className={`cursor-pointer rounded-xl border p-2.5 text-center text-xs font-bold transition-all ${
                    accountType === value
                      ? "border-[#16A36A] bg-[#16A36A]/15 text-[#16A36A] dark:text-[#A3EAC1] shadow-[0_0_15px_rgba(22,163,106,0.2)]"
                      : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[#16A36A]/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="accountType"
                    value={value}
                    checked={accountType === value}
                    onChange={() => setAccountType(value)}
                    className="sr-only"
                  />
                  {label}
                </label>
              ),
            )}
          </div>
        </fieldset>

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
              onClick={() => setShowPassword((value) => !value)}
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
          {loading ? "Creating Account..." : "Create Free Account"}
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
