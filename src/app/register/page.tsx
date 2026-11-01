"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { signUp } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await signUp(name, email, password);
    if (res.ok) return router.push("/dashboard");
    setError(res.error ?? "Could not create the account.");
    setDemo(Boolean(res.demo));
  }

  const field = "mt-1 w-full min-h-12 rounded-xl border-2 border-slate-300 px-3";
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-4 text-3xl font-bold">Create your account</h1>
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <label className="block font-medium">Full name
            <input required className={field} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block font-medium">Email
            <input type="email" required className={field} value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="block font-medium">Password (8+ characters)
            <input type="password" required minLength={8} className={field} value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <p role="alert" className="font-medium text-red-700">{error}</p>}
          <Button type="submit" className="w-full">Register</Button>
        </form>
        {demo && (
          <Link href="/dashboard" className="mt-4 block text-center font-semibold text-secondary underline">
            Continue in demo mode
          </Link>
        )}
        <p className="mt-4 text-center">Already registered? <Link href="/login" className="font-semibold text-secondary underline">Log in</Link></p>
      </Card>
    </main>
  );
}
