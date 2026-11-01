"use client";

import Link from "next/link";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { signIn } from "@/lib/auth";

const field = "mt-2 min-h-13 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-100";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDemo(false);
    setLoading(true);
    const res = await signIn(email.trim(), password);
    setLoading(false);
    if (res.ok) return router.push("/dashboard");
    setError(res.error ?? "We could not sign you in. Please check your details.");
    setDemo(Boolean(res.demo));
  }

  return (
    <AuthShell eyebrow="Welcome back" title="Sign in to your care space" subtitle="View your schedule and stay on track with confidence.">
      <form onSubmit={submit} className="space-y-5">
        <label className="block font-semibold text-slate-800">
          Email address
          <span className="relative block">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input type="email" required autoComplete="email" placeholder="you@example.com" className={`${field} pl-12`} value={email} onChange={(e) => setEmail(e.target.value)} />
          </span>
        </label>
        <label className="block font-semibold text-slate-800">
          Password
          <span className="relative block">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input type={showPassword ? "text" : "password"} required autoComplete="current-password" placeholder="Enter your password" className={`${field} pl-12 pr-12`} value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-teal-600">
              {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
            </button>
          </span>
        </label>
        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
            Remember me
          </label>
          <span className="cursor-not-allowed text-slate-400" title="Password recovery will be available when email recovery is configured">Forgot password?</span>
        </div>
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium leading-6 text-red-700">{error}</p>}
        <Button type="submit" disabled={loading} className="min-h-13 w-full rounded-xl text-base shadow-lg shadow-teal-700/20">
          {loading ? "Signing you in…" : "Log in securely"}
        </Button>
      </form>
      {demo && <Link href="/dashboard" className="mt-4 block rounded-xl bg-amber-50 p-3 text-center text-sm font-semibold text-amber-900 underline">Continue in demo mode</Link>}
      <p className="mt-8 text-center text-sm text-slate-600">New to MediTrack? <Link href="/register" className="font-semibold text-teal-700 underline underline-offset-4">Create an account</Link></p>
    </AuthShell>
  );
}
