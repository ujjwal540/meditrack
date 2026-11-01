"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { Activity, CheckCircle2, HeartHandshake, Pill, ShieldCheck } from "lucide-react";

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-[calc(100vh-1rem)] bg-slate-50 px-4 py-6 sm:px-6 sm:py-10 lg:py-14">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/5 lg:grid-cols-[1fr_0.95fr]">
        <section className="relative min-h-[300px] overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-blue-700 p-6 text-white sm:p-10 lg:min-h-[680px] lg:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-center gap-3">
              <Image src="/logo.svg" alt="" width={48} height={48} className="rounded-xl bg-white p-1" />
              <span className="text-xl font-bold tracking-tight">MediTrack</span>
            </div>
            <div className="mt-10 max-w-lg sm:mt-14 lg:mt-24">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-100">Healthcare, made human</p>
              <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-5xl">Your health, our priority.</h1>
              <p className="mt-4 max-w-md text-base leading-7 text-teal-50 sm:text-lg">
                Stay on top of your medications and keep your loved ones connected with smarter healthcare.
              </p>
            </div>
            <div className="relative mt-8 min-h-28 flex-1 sm:mt-12">
              <div className="absolute left-0 top-0 flex animate-auth-float items-center gap-3 rounded-2xl bg-white/95 p-3 text-sm text-slate-800 shadow-xl shadow-teal-950/20 sm:p-4">
                <span className="rounded-xl bg-teal-100 p-2 text-teal-700"><Pill className="h-5 w-5" aria-hidden="true" /></span>
                <span><strong className="block">Medicine reminder</strong><span className="text-slate-500">Time for your medication</span></span>
                <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />
              </div>
              <div className="absolute bottom-0 right-0 flex animate-auth-float-delayed items-center gap-3 rounded-2xl bg-white/95 p-3 text-sm text-slate-800 shadow-xl shadow-teal-950/20 sm:p-4">
                <span className="rounded-xl bg-blue-100 p-2 text-blue-700"><HeartHandshake className="h-5 w-5" aria-hidden="true" /></span>
                <span><strong className="block">Family care</strong><span className="text-slate-500">Your family is connected</span></span>
              </div>
            </div>
            <div className="mt-8 hidden items-center gap-3 border-t border-white/20 pt-6 text-sm text-teal-50 sm:flex">
              <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
              Your care connections stay consent-based and in your control.
            </div>
          </div>
        </section>
        <section className="p-6 sm:p-10 lg:p-14">
          <div className="mb-8 flex items-center gap-2 text-teal-700 lg:hidden">
            <Activity className="h-5 w-5" aria-hidden="true" />
            <span className="text-sm font-semibold">MediTrack care space</span>
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">{eyebrow}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
          <p className="mt-3 text-base leading-7 text-slate-600">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
