"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CheckCircle2, HeartHandshake, Pill, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

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
    <main className="relative min-h-screen bg-[var(--bg-app)] text-[var(--text)] px-4 py-8 sm:px-6 sm:py-12 flex items-center justify-center font-sans overflow-hidden transition-colors duration-250">
      {/* Background Ambient Glows & Grid */}
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-50" />
      <div className="pointer-events-none fixed -top-40 left-1/4 h-[30rem] w-[30rem] rounded-full bg-[#16A36A]/12 blur-[130px]" />
      <div className="pointer-events-none fixed -bottom-40 right-1/4 h-[30rem] w-[30rem] rounded-full bg-[#A78BFA]/10 blur-[130px]" />

      <div className="relative z-10 mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] backdrop-blur-2xl lg:grid-cols-[1.05fr_1fr]">
        {/* Left Visual Panel */}
        <section className="relative flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-[var(--border)] bg-gradient-to-br from-[var(--surface-elevated)] via-[var(--bg-secondary)] to-[var(--surface)] p-8 sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#16A36A]/15 blur-3xl" />

          <div>
            <Link href="/" className="inline-block transition-transform hover:scale-[1.02]">
              <Logo variant="full" size="md" glow={true} />
            </Link>

            <div className="mt-12 sm:mt-16">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#16A36A] dark:text-[#20C982]">
                Healthcare, Made Human
              </span>
              <h1 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold text-[var(--text)] leading-tight">
                Your Health, Our Priority.
              </h1>
              <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed max-w-md">
                Precision medication scheduling and family circle coordination in one calm, secure platform.
              </p>
            </div>
          </div>

          {/* Floating Showcase Cards */}
          <div className="my-8 space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 p-4 text-xs backdrop-blur-md shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#16A36A]/20 text-[#16A36A] dark:text-[#A3EAC1]">
                  <Pill className="h-4 w-4" />
                </span>
                <div>
                  <strong className="block text-[var(--text)]">Morning Dose Scheduled</strong>
                  <span className="text-[11px] text-[var(--text-muted)]">Metformin 500mg &bull; 08:00 AM</span>
                </div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-[#36D399]" />
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 p-4 text-xs backdrop-blur-md shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#A78BFA]/20 text-[#A78BFA]">
                  <HeartHandshake className="h-4 w-4" />
                </span>
                <div>
                  <strong className="block text-[var(--text)]">Family Circle Active</strong>
                  <span className="text-[11px] text-[var(--text-muted)]">Consent-based monitoring</span>
                </div>
              </div>
              <span className="font-mono text-[10px] text-[#16A36A] dark:text-[#A3EAC1] bg-[#16A36A]/10 px-2 py-0.5 rounded border border-[#16A36A]/20">
                Connected
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-4">
            <ShieldCheck className="h-4 w-4 text-[#16A36A] dark:text-[#20C982] shrink-0" />
            <span>End-to-end encrypted session and privacy-first data handling.</span>
          </div>
        </section>

        {/* Right Form Container */}
        <section className="p-8 sm:p-12 flex flex-col justify-center bg-[var(--surface)]">
          <p className="text-xs font-bold uppercase tracking-wider text-[#16A36A] dark:text-[#20C982]">{eyebrow}</p>
          <h2 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-[var(--text)]">{title}</h2>
          <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)]">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
