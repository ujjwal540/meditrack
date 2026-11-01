"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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

  const field = "mt-1 w-full min-h-12 rounded-xl border-2 border-slate-300 px-3";
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-4 text-3xl font-bold">Log in</h1>
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <label className="block font-medium">Email
            <input type="email" required className={field} value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="block font-medium">Password
            <input type="password" required className={field} value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <p role="alert" className="font-medium text-red-700">{error}</p>}
          <Button type="submit" className="w-full">Log in</Button>
        </form>
        {demo && (
          <Link href="/dashboard" className="mt-4 block text-center font-semibold text-secondary underline">
            Continue in demo mode
          </Link>
        )}
        <p className="mt-4 text-center">No account? <Link href="/register" className="font-semibold text-secondary underline">Register</Link></p>
      </Card>
    </main>
  );
}
