"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CheckCircle2, HeartHandshake, Pill, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useTranslation } from "@/i18n/LanguageContext";

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
  const { isNepali } = useTranslation();

  return (
    <main className="relative min-h-screen bg-[var(--bg-app)] text-[var(--text)] px-4 py-8 sm:px-6 sm:py-12 flex items-center justify-center font-sans overflow-hidden transition-colors duration-250">
      {/* Background Ambient Glows & Grid */}
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-50" />
      <div className="pointer-events-none fixed -top-40 left-1/4 h-[30rem] w-[30rem] rounded-full bg-[#16A36A]/12 blur-[130px]" />
      <div className="pointer-events-none fixed -bottom-40 right-1/4 h-[30rem] w-[30rem] rounded-full bg-[#A78BFA]/10 blur-[130px]" />

      <div className="relative z-10 mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] backdrop-blur-2xl lg:grid-cols-[1.05fr_1fr]">
        {/* Left Visual Panel */}
        <section className="relative flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-[var(--border)] bg-gradient-to-br from-[var(--surface-elevated)] via-[var(--bg-secondary)] to-[var(--surface)] p-5 sm:p-8 md:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#16A36A]/15 blur-3xl" />

          <div>
            <Link href="/" className="inline-block transition-transform hover:scale-[1.02]">
              <Logo variant="full" size="md" glow={true} />
            </Link>

            <div className="mt-8 sm:mt-12 md:mt-16">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#16A36A] dark:text-[#20C982]">
                {isNepali ? "स्वास्थ्य सेवा, आत्मीय भावना" : "Healthcare, Made Human"}
              </span>
              <h1 className="mt-2 font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--text)] leading-tight">
                {isNepali ? "तपाईंको स्वास्थ्य, हाम्रो प्राथमिकता।" : "Your Health, Our Priority."}
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-md">
                {isNepali
                  ? "सटीक औषधि समयतालिका र परिवार समूह समन्वय एकै शान्त र सुरक्षित प्रणालीमा।"
                  : "Precision medication scheduling and family circle coordination in one calm, secure platform."}
              </p>
            </div>
          </div>

          {/* Floating Showcase Cards */}
          <div className="my-6 space-y-2.5 sm:my-8 sm:space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 p-3.5 sm:p-4 text-xs backdrop-blur-md shadow-sm transition-all duration-250 ease-out hover:-translate-y-1 hover:border-[#20D6C2] hover:bg-[var(--surface-hover)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.6),0_0_18px_rgba(32,214,194,0.22)]">
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#16A36A]/20 text-[#16A36A] dark:text-[#A3EAC1]">
                  <Pill className="h-4 w-4" />
                </span>
                <div>
                  <strong className="block text-[var(--text)]">
                    {isNepali ? "बिहानको औषधि निर्धारित" : "Morning Dose Scheduled"}
                  </strong>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {isNepali ? "मेटफर्मिन ५०० मिग्रा • बिहान ०८:००" : "Metformin 500mg • 08:00 AM"}
                  </span>
                </div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-[#36D399]" />
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 p-3.5 sm:p-4 text-xs backdrop-blur-md shadow-sm transition-all duration-250 ease-out hover:-translate-y-1 hover:border-[#20D6C2] hover:bg-[var(--surface-hover)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.6),0_0_18px_rgba(32,214,194,0.22)]">
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#A78BFA]/20 text-[#A78BFA]">
                  <HeartHandshake className="h-4 w-4" />
                </span>
                <div>
                  <strong className="block text-[var(--text)]">
                    {isNepali ? "पारिवारिक समूह सक्रिय" : "Family Circle Active"}
                  </strong>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {isNepali ? "सहमतिमा आधारित हेरचाह" : "Consent-based monitoring"}
                  </span>
                </div>
              </div>
              <span className="font-mono text-[10px] text-[#16A36A] dark:text-[#A3EAC1] bg-[#16A36A]/10 px-2 py-0.5 rounded border border-[#16A36A]/20">
                {isNepali ? "जोडिएको" : "Connected"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-4">
            <ShieldCheck className="h-4 w-4 text-[#16A36A] dark:text-[#20C982] shrink-0" />
            <span>
              {isNepali
                ? "सुरक्षित इन्क्रिप्सन र गोपनीयता-पहिलो स्वास्थ्य प्रणाली।"
                : "End-to-end encrypted session and privacy-first data handling."}
            </span>
          </div>
        </section>

        {/* Right Form Container */}
        <section className="relative p-5 sm:p-8 md:p-12 flex flex-col justify-center bg-[var(--surface)]">
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2">
            <LanguageSwitcher variant="minimal" />
            <ThemeToggle showLabel={false} />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#16A36A] dark:text-[#20C982] pr-20">{eyebrow}</p>
          <h2 className="mt-1 font-display text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--text)] pr-20">{title}</h2>
          <p className="mt-1.5 text-xs sm:text-sm text-[var(--text-secondary)]">{subtitle}</p>
          <div className="mt-5 sm:mt-6">{children}</div>
        </section>
      </div>
    </main>
  );
}

