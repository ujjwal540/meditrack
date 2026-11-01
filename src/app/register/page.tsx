"use client";

import Link from "next/link";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { type AccountType, signUp } from "@/lib/auth";

const field = "mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-100";

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
    <AuthShell eyebrow="Get started" title="Create your care space" subtitle="A calmer way to manage medicines and stay connected with family.">
      <form onSubmit={submit} className="space-y-4">
        <label className="block font-semibold text-slate-800">Full name
          <span className="relative block"><UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" /><input required autoComplete="name" placeholder="Your full name" className={`${field} pl-12`} value={name} onChange={(e) => setName(e.target.value)} /></span>
        </label>
        <label className="block font-semibold text-slate-800">Email address
          <span className="relative block"><Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" /><input type="email" required autoComplete="email" placeholder="you@example.com" className={`${field} pl-12`} value={email} onChange={(e) => setEmail(e.target.value)} /></span>
        </label>
        <fieldset>
          <legend className="font-semibold text-slate-800">I am joining as</legend>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {([["patient", "Patient"], ["caregiver", "Family caregiver"]] as const).map(([value, label]) => (
              <label key={value} className={`cursor-pointer rounded-xl border p-3 text-center text-sm font-semibold transition ${accountType === value ? "border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-100" : "border-slate-300 text-slate-600 hover:bg-slate-50"}`}>
                <input type="radio" name="accountType" value={value} checked={accountType === value} onChange={() => setAccountType(value)} className="sr-only" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="block font-semibold text-slate-800">Password
          <span className="relative block"><LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" /><input type={showPassword ? "text" : "password"} required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" className={`${field} pl-12 pr-12`} value={password} onChange={(e) => setPassword(e.target.value)} /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-slate-100">{showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}</button></span>
        </label>
        <label className="block font-semibold text-slate-800">Confirm password
          <input type={showPassword ? "text" : "password"} required minLength={8} autoComplete="new-password" placeholder="Repeat your password" className={field} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </label>
        <label className="flex items-start gap-3 text-sm leading-6 text-slate-600">
          <input type="checkbox" required checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
          <span>I agree to the MediTrack terms and privacy notice.</span>
        </label>
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium leading-6 text-red-700">{error}</p>}
        <Button type="submit" disabled={loading} className="min-h-13 w-full rounded-xl text-base shadow-lg shadow-teal-700/20">{loading ? "Creating your account…" : "Create account"}</Button>
      </form>
      {demo && <Link href="/dashboard" className="mt-4 block rounded-xl bg-amber-50 p-3 text-center text-sm font-semibold text-amber-900 underline">Continue in demo mode</Link>}
      <p className="mt-7 text-center text-sm text-slate-600">Already have an account? <Link href="/login" className="font-semibold text-teal-700 underline underline-offset-4">Log in</Link></p>
    </AuthShell>
  );
}
