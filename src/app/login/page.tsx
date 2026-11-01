"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

  const field = "mt-2 w-full min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-100";
  return (
    <main className="min-h-[calc(100vh-1rem)] bg-slate-50 px-4 py-8 sm:flex sm:items-center sm:justify-center sm:py-12">
      <section className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <div className="text-center">
          <Image src="/logo.svg" alt="" width={56} height={56} className="mx-auto" />
          <p className="mt-3 text-xl font-bold text-teal-800">MediTrack</p>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
          <p className="mt-2 text-base text-slate-600">Sign in to manage your medicine routine.</p>
        </div>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block font-semibold text-slate-800">Email address
            <input type="email" required className={field} value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="block font-semibold text-slate-800">Password
            <input type="password" required className={field} value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
          <Button type="submit" className="min-h-12 w-full rounded-xl text-base">Log in</Button>
        </form>
        {demo && (
          <Link href="/dashboard" className="mt-4 block rounded-xl bg-amber-50 p-3 text-center text-sm font-semibold text-amber-900 underline">
            Continue in demo mode
          </Link>
        )}
        <p className="mt-7 text-center text-sm text-slate-600">New to MediTrack? <Link href="/register" className="font-semibold text-teal-700 underline underline-offset-4">Create an account</Link></p>
      </section>
    </main>
  );
}
