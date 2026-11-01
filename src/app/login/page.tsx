"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HeartPulse, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await signIn(email, password);
    if (res.ok) return router.push("/dashboard");
    setError(res.error ?? "Could not log in.");
    setDemo(Boolean(res.demo));
  }

  const field = "mt-2 w-full min-h-13 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base shadow-sm transition focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-100";
  return (
    <main className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-teal-50 via-white to-blue-50 px-4 py-10 sm:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-white/80 bg-white shadow-xl shadow-teal-900/10 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden bg-teal-800 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-white/15 p-3"><HeartPulse className="h-7 w-7" aria-hidden="true" /></span>
              <span className="text-xl font-bold">MediTrack</span>
            </div>
            <h1 className="mt-16 text-4xl font-bold leading-tight">Care that stays with you.</h1>
            <p className="mt-4 text-lg leading-8 text-teal-50">
              Keep your medicine routine simple, calm, and connected to the people you trust.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 text-sm text-teal-50">
            <ShieldCheck className="h-6 w-6 shrink-0" aria-hidden="true" />
            <span>Your care connections are consent-based and controlled by you.</span>
          </div>
        </section>
        <section className="p-6 sm:p-10">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3 text-teal-800">
              <span className="rounded-2xl bg-teal-100 p-3"><HeartPulse className="h-7 w-7" aria-hidden="true" /></span>
              <span className="text-xl font-bold">MediTrack</span>
            </div>
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Welcome back</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Log in to your care space</h2>
          <p className="mt-2 text-slate-600">View your schedule and stay on track with confidence.</p>
          <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block font-semibold text-slate-800">Email
            <input type="email" required className={field} value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="block font-semibold text-slate-800">Password
            <input type="password" required className={field} value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
            {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 font-medium text-red-700">{error}</p>}
            <Button type="submit" className="min-h-13 w-full rounded-xl text-lg shadow-lg shadow-teal-700/20">Log in securely</Button>
          </form>
          {demo && (
            <Link href="/dashboard" className="mt-4 block rounded-xl bg-amber-50 p-3 text-center font-semibold text-amber-900 underline">
              Continue in demo mode
            </Link>
          )}
          <p className="mt-8 text-center text-slate-600">No account? <Link href="/register" className="font-semibold text-teal-700 underline underline-offset-4">Create one</Link></p>
        </section>
      </div>
    </main>
  );
}
