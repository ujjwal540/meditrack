"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  HeartHandshake,
  Lock,
  Menu,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { AIAssistantWidget } from "@/components/ai/AIAssistantWidget";
import { Logo } from "@/components/ui/Logo";
import { useTranslation } from "@/i18n/LanguageContext";

function ensureDemoSession() {
  if (typeof window !== "undefined" && !localStorage.getItem("meditrack.current_user")) {
    localStorage.setItem(
      "meditrack.current_user",
      JSON.stringify({
        id: "demo-patient",
        name: "Eleanor Vance",
        email: "eleanor.vance@example.com",
        role: "patient",
      }),
    );
  }
}

export default function Home() {
  const { t, isNepali } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on Escape key
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="relative min-h-screen bg-[var(--bg-app)] text-[var(--text)] selection:bg-[#16A36A] selection:text-white overflow-x-hidden font-sans transition-colors duration-300">
      {/* Background Ambient Glows & Grid */}
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-70" />
      <div className="pointer-events-none fixed -top-40 left-1/2 -translate-x-1/2 h-[34rem] w-[52rem] rounded-full bg-gradient-to-b from-[#16A36A]/20 via-[#A78BFA]/10 to-transparent blur-[140px]" />
      <div className="pointer-events-none fixed -bottom-40 -right-40 h-[30rem] w-[30rem] rounded-full bg-[#20C982]/12 blur-[150px]" />

      {/* Top Navigation Bar with Intelligent Responsive Layout */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface-glass)] backdrop-blur-xl transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 xs:gap-3 sm:gap-4 px-3 sm:px-6">
          {/* Zone 1: Adaptive Brand wordmark */}
          <Link href="/" className="shrink-0 transition-transform hover:scale-[1.02] flex items-center">
            {/* Ultra-compact logo for small screens under 640px */}
            <div className="flex items-center gap-2 sm:hidden">
              <Logo variant="icon" size="sm" glow={true} />
              <span className="font-display font-extrabold text-base tracking-tight text-[var(--text)] leading-none">
                Medi<span className="text-[#16A36A] dark:text-[#20C982]">Track</span>
              </span>
            </div>
            {/* Full logo for screens 640px and above */}
            <div className="hidden sm:block">
              <Logo variant="full" size="md" glow={true} />
            </div>
          </Link>

          {/* Zone 2: Desktop Navigation Links (>= 1024px) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            <a href="#features" className="hover:text-[#16A36A] dark:hover:text-[#20C982] transition-colors whitespace-nowrap shrink-0">
              {isNepali ? "विशेषताहरू" : "Features"}
            </a>
            <a href="#how-it-works" className="hover:text-[#16A36A] dark:hover:text-[#20C982] transition-colors whitespace-nowrap shrink-0">
              {isNepali ? "कसरी काम गर्छ" : "How It Works"}
            </a>
            <a href="#family-care" className="hover:text-[#16A36A] dark:hover:text-[#20C982] transition-colors whitespace-nowrap shrink-0">
              {isNepali ? "परिवार समूह" : "Family Circle"}
            </a>
            <Link href="/marketplace" className="hover:text-[#20D6C2] text-[#20D6C2]/90 transition-colors whitespace-nowrap shrink-0 font-bold">
              {isNepali ? "हेरचाहकर्मी" : "Care Pros"}
            </Link>
            <a href="#ai-assistant" className="hover:text-[#A78BFA] transition-colors whitespace-nowrap shrink-0">
              {isNepali ? "स्वास्थ्य साथी" : "AI Companion"}
            </a>
          </nav>

          {/* Zone 3: Desktop Controls & CTA (>= 1024px) */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <LanguageSwitcher variant="minimal" />
            <ThemeToggle showLabel={false} />

            <Link
              href="/login"
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-xs font-semibold text-[var(--text)] hover:border-[#16A36A]/50 hover:text-[#16A36A] dark:hover:text-[#20C982] transition-all whitespace-nowrap shadow-sm"
            >
              {t.nav.signIn}
            </Link>

            <Link
              href="/dashboard"
              onClick={ensureDemoSession}
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#16A36A] to-[#20C982] px-5 text-xs font-bold text-white shadow-[0_0_20px_rgba(22,163,106,0.35)] hover:shadow-[0_0_28px_rgba(32,201,130,0.5)] hover:brightness-105 active:scale-95 transition-all whitespace-nowrap"
            >
              {isNepali ? "ड्यासबोर्ड खोल्नुहोस्" : "Launch Demo"}
            </Link>
          </div>

          {/* Zone 4: Mobile & Tablet Action Cluster (< 1024px) */}
          <div className="flex lg:hidden items-center gap-1.5 xs:gap-2 shrink-0">
            {/* Tablet-only quick controls (640px to 1023px) */}
            <div className="hidden sm:flex items-center gap-2">
              <LanguageSwitcher variant="minimal" />
              <ThemeToggle showLabel={false} />
            </div>

            {/* Guaranteed-Visible Launch Demo Button */}
            <Link
              href="/dashboard"
              onClick={ensureDemoSession}
              className="inline-flex h-9 xs:h-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#16A36A] to-[#20C982] px-2.5 xs:px-3.5 sm:px-4 text-[11px] xs:text-xs font-bold text-white shadow-[0_0_15px_rgba(22,163,106,0.35)] hover:brightness-105 active:scale-95 transition-all whitespace-nowrap shrink-0"
            >
              <span>{isNepali ? "ड्यासबोर्ड" : "Launch Demo"}</span>
            </Link>

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? (isNepali ? "मेनु बन्द गर्नुहोस्" : "Close menu") : (isNepali ? "मेनु खोल्नुहोस्" : "Open menu")}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-drawer"
              className="grid h-9 w-9 xs:h-10 xs:w-10 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[#16A36A] hover:text-[#16A36A] dark:hover:text-[#20C982] active:scale-95 transition-all shrink-0 shadow-sm"
            >
              {mobileMenuOpen ? <X className="h-4 w-4 xs:h-5 xs:w-5" /> : <Menu className="h-4 w-4 xs:h-5 xs:w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Dropdown */}
        {mobileMenuOpen && (
          <div
            id="mobile-nav-drawer"
            className="lg:hidden border-t border-[var(--border)] bg-[var(--surface)]/98 backdrop-blur-2xl px-4 py-4 sm:px-6 shadow-[0_20px_40px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-top-3 duration-200"
          >
            {/* Preferences bar on mobile phones (< 640px) */}
            <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-[var(--border-subtle)] sm:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {isNepali ? "भाषा र दृश्य" : "Preferences"}
              </span>
              <div className="flex items-center gap-2">
                <LanguageSwitcher variant="minimal" />
                <ThemeToggle showLabel={false} />
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <nav className="flex flex-col space-y-1 text-sm font-semibold text-[var(--text)]">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl p-2.5 text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[#16A36A] dark:hover:text-[#20C982] transition-colors"
              >
                <span>{isNepali ? "विशेषताहरू" : "Features"}</span>
                <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl p-2.5 text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[#16A36A] dark:hover:text-[#20C982] transition-colors"
              >
                <span>{isNepali ? "कसरी काम गर्छ" : "How It Works"}</span>
                <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
              </a>
              <a
                href="#family-care"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl p-2.5 text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[#16A36A] dark:hover:text-[#20C982] transition-colors"
              >
                <span>{isNepali ? "परिवार समूह" : "Family Circle"}</span>
                <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
              </a>
              <Link
                href="/marketplace"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl p-2.5 text-[#20D6C2] hover:bg-[var(--surface-elevated)] transition-colors font-bold"
              >
                <span>{isNepali ? "हेरचाहकर्मी (Care Pros)" : "Care Professionals"}</span>
                <ChevronRight className="h-4 w-4 text-[#20D6C2]/60" />
              </Link>
              <a
                href="#ai-assistant"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-xl p-2.5 text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[#A78BFA] transition-colors"
              >
                <span>{isNepali ? "स्वास्थ्य साथी (AI Companion)" : "AI Healthcare Companion"}</span>
                <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
              </a>
            </nav>

            {/* Mobile Auth Actions */}
            <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] grid grid-cols-2 gap-2.5">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-bold text-[var(--text)] hover:border-[#16A36A] active:scale-95 transition-all shadow-sm"
              >
                {t.nav.signIn}
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#16A36A] to-[#20C982] text-xs font-bold text-white shadow-sm hover:brightness-105 active:scale-95 transition-all"
              >
                {isNepali ? "दर्ता गर्नुहोस्" : "Get Started"}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 xs:pt-16 xs:pb-20 sm:pt-24 sm:pb-28">
        <div className="mx-auto max-w-5xl px-3 xs:px-4 text-center sm:px-6">
          {/* Eyebrow Kicker */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#16A36A]/30 bg-[#16A36A]/10 px-3 xs:px-4 py-1.5 text-[11px] xs:text-xs font-semibold tracking-wide text-[#16A36A] dark:text-[#A3EAC1] mb-6 xs:mb-8 backdrop-blur-md shadow-sm max-w-full text-balance">
            <Sparkles className="h-3.5 w-3.5 text-[#20C982] shrink-0" />
            <span className="truncate">
              {isNepali
                ? "स्मार्ट औषधि स्मरण तथा पारिवारिक हेरचाह प्रणाली"
                : "Intelligent Medication & Family Care Platform"}
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[var(--text)] leading-[1.1] text-balance">
            {isNepali ? (
              <>
                औषधि कहिल्यै नछुटोस्।{" "}
                <span className="bg-gradient-to-r from-[#16A36A] via-[#20C982] to-[#A3EAC1] bg-clip-text text-transparent">
                  दैनिक स्वास्थ्यलाई मजबुत बनाउनुहोस्।
                </span>
              </>
            ) : (
              <>
                Never Miss a Dose.{" "}
                <span className="bg-gradient-to-r from-[#16A36A] via-[#20C982] to-[#A3EAC1] bg-clip-text text-transparent">
                  Empower Your Daily Health.
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-4 xs:mt-6 max-w-2xl text-sm xs:text-base sm:text-lg leading-relaxed text-[var(--text-secondary)] text-balance">
            {isNepali
              ? "सटीक औषधि अनुस्मारक, दैनिक तालिका, सहमतिमा आधारित पारिवारिक हेरचाह समन्वय र आवाज प्रणालीका साथ सहज स्वास्थ्य व्यवस्थापन।"
              : "Precision reminders, timetable scheduling, consent-based family caregiver updates, and an AI healthcare assistant crafted around medical trust and clarity."}
          </p>

          {/* Call to Actions */}
          <div className="mt-8 xs:mt-9 flex flex-col xs:flex-row items-stretch xs:items-center justify-center gap-3 sm:gap-4 max-w-md xs:max-w-none mx-auto">
            <Link
              href="/register"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#16A36A] to-[#20C982] px-6 sm:px-7 text-sm font-bold text-white shadow-[0_4px_22px_rgba(22,163,106,0.35)] hover:shadow-[0_6px_30px_rgba(32,201,130,0.5)] hover:brightness-105 active:scale-95 transition-all"
            >
              <span>{isNepali ? "निःशुल्क सुरु गर्नुहोस्" : "Get Started Free"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/dashboard"
              onClick={ensureDemoSession}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 sm:px-6 text-sm font-semibold text-[var(--text)] hover:border-[#16A36A]/40 hover:text-[#16A36A] dark:hover:text-[#20C982] active:scale-95 transition-all backdrop-blur-sm shadow-sm"
            >
              <span>{isNepali ? "अन्तर्क्रियात्मक डेमो हेर्नुहोस्" : "Explore Interactive Demo"}</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#16A36A] dark:text-[#20C982] shrink-0" />
              {isNepali ? "कुनै क्रेडिट कार्ड चाहिँदैन" : "No Credit Card Required"}
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-[#16A36A] dark:text-[#20C982] shrink-0" />
              {isNepali ? "पूर्ण सहमतिमा आधारित गोपनीयता" : "Strict Consent-Based Privacy"}
            </span>

            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#16A36A] dark:text-[#20C982]" /> Web &amp; Mobile PWA Ready
            </span>
          </div>

          {/* High-Fidelity Medical Dashboard Preview Mockup */}
          <div className="mt-14 relative mx-auto max-w-4xl">
            {/* Glowing Border Backdrop */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#16A36A]/30 via-[#20C982]/20 to-[#A78BFA]/20 blur-xl opacity-75" />

            <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] overflow-hidden text-left transition-colors duration-300">
              {/* Window Controls Header */}
              <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-[11px] text-[var(--text-secondary)]">meditrack.app/dashboard</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#16A36A] dark:text-[#20C982]">
                  <span className="h-2 w-2 rounded-full bg-[#20C982] animate-pulse" />
                  <span>Real-time Active</span>
                </div>
              </div>

              {/* Mockup Dashboard Content */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Greeting & Adherence Strip */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-5 backdrop-blur-md">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#16A36A] dark:text-[#20C982]">Today&apos;s Regimen</span>
                    <h3 className="mt-1 font-display text-2xl font-bold text-[var(--text)]">Morning Routine Synchronized</h3>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">2 of 3 daily medications confirmed on time.</p>
                    <div className="mt-4 flex items-center gap-3">
                      <span className="rounded-lg bg-[#16A36A]/15 border border-[#16A36A]/30 px-3 py-1 text-xs font-mono font-bold text-[#16A36A] dark:text-[#A3EAC1]">
                        85% Adherence Score
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">Next reminder in 45m</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#16A36A]/30 bg-[#16A36A]/10 p-5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#16A36A] dark:text-[#A3EAC1]">Priority Dose</span>
                      <p className="mt-1 font-display text-lg font-bold text-[var(--text)]">Atorvastatin 20mg</p>
                      <p className="text-xs text-[var(--text-secondary)]">With water after dinner</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#16A36A] dark:text-[#20C982] mt-3">Scheduled: 08:00 PM</span>
                  </div>
                </div>

                {/* Timeline Row Preview */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/50 p-4">
                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-3">
                    <span className="font-bold uppercase tracking-wider">Today&apos;s Doses</span>
                    <span>3 Total</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg bg-[var(--surface)] p-3 text-xs border border-[var(--border-subtle)]">
                      <div className="flex items-center gap-3">
                        <span className="grid h-7 w-7 place-items-center rounded-md bg-emerald-500/20 text-[#16A36A] dark:text-[#36D399]">
                          <CheckCircle2 className="h-4 w-4" />
                        </span>
                        <div>
                          <strong className="block text-[var(--text)]">Metformin 500mg</strong>
                          <span className="text-[10px] text-[var(--text-muted)]">With breakfast</span>
                        </div>
                      </div>
                      <span className="font-mono text-[#16A36A] dark:text-[#36D399] font-semibold">08:00 AM &bull; Taken</span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-[var(--surface)] p-3 text-xs border border-[var(--border-subtle)]">
                      <div className="flex items-center gap-3">
                        <span className="grid h-7 w-7 place-items-center rounded-md bg-amber-500/20 text-[#FBBF24]">
                          <Clock className="h-4 w-4" />
                        </span>
                        <div>
                          <strong className="block text-[var(--text)]">Vitamin D3 1000 IU</strong>
                          <span className="text-[10px] text-[var(--text-muted)]">Midday with meal</span>
                        </div>
                      </div>
                      <span className="font-mono text-[#FBBF24] font-semibold">01:00 PM &bull; Due Soon</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics & Quantitative Rigor Strip */}
      <section className="border-y border-[var(--border)] bg-[var(--bg-secondary)]/70 py-12 backdrop-blur-lg transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
            <div>
              <p className="font-mono text-3xl sm:text-4xl font-extrabold text-[#16A36A] dark:text-[#20C982] tabular-nums">99.4%</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">On-time reminder delivery</p>
            </div>
            <div>
              <p className="font-mono text-3xl sm:text-4xl font-extrabold text-[var(--text)] tabular-nums">&lt; 2 min</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">Fast prescription setup</p>
            </div>
            <div>
              <p className="font-mono text-3xl sm:text-4xl font-extrabold text-[#A78BFA] tabular-nums">100%</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">Consent-based family control</p>
            </div>
            <div>
              <p className="font-mono text-3xl sm:text-4xl font-extrabold text-[#36D399] tabular-nums">Zero</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">Data selling or trackers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section id="features" className="py-24 relative">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#16A36A] dark:text-[#20C982]">Features</span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold text-[var(--text)]">
              Built for precision, peace of mind, and modern care.
            </h2>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              Everything required to maintain healthy routines and keep family caregivers reassured without complicated setup.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Bento Card 1: Precision Timetable */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 backdrop-blur-xl transition-all duration-250 ease-out hover:-translate-y-1 hover:border-[#20D6C2] hover:bg-[var(--surface-hover)] hover:shadow-[0_16px_36px_-10px_rgba(0,0,0,0.7),0_0_22px_rgba(32,214,194,0.28)] shadow-[var(--shadow-card)]">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#16A36A]/15 text-[#16A36A] dark:text-[#A3EAC1] border border-[#16A36A]/25">
                <Bell className="h-6 w-6" />
              </div>
              <h3 className="mt-6 font-display text-xl font-bold text-[var(--text)]">Precision Smart Reminders</h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                Gentle sound chimes, spoken voice alerts, and browser notifications inform you exactly when it is time to take your dose.
              </p>
            </div>

            {/* Bento Card 2: AI Healthcare Companion */}
            <div className="rounded-2xl border border-[#A78BFA]/30 bg-[var(--surface)] p-7 backdrop-blur-xl transition-all duration-250 ease-out hover:-translate-y-1 hover:border-[#20D6C2] hover:bg-[var(--surface-hover)] hover:shadow-[0_16px_36px_-10px_rgba(0,0,0,0.7),0_0_22px_rgba(32,214,194,0.28)] shadow-[var(--shadow-card)]">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#A78BFA]/15 text-[#A78BFA] border border-[#A78BFA]/25">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="mt-6 font-display text-xl font-bold text-[var(--text)]">AI Medication Companion</h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                Ask routine questions about taking medicine with meals, managing missed doses, or building lasting habits, with strict safety guardrails.
              </p>
            </div>

            {/* Bento Card 3: Connected Family Circle */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 backdrop-blur-xl transition-all duration-250 ease-out hover:-translate-y-1 hover:border-[#20D6C2] hover:bg-[var(--surface-hover)] hover:shadow-[0_16px_36px_-10px_rgba(0,0,0,0.7),0_0_22px_rgba(32,214,194,0.28)] shadow-[var(--shadow-card)]">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-500/15 text-[#16A36A] dark:text-[#36D399] border border-emerald-500/25">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <h3 className="mt-6 font-display text-xl font-bold text-[var(--text)]">Connected Family Circle</h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                Share dose confirmations with adult children or caregivers. They receive alerts only when doses remain unconfirmed, preventing worry.
              </p>
            </div>

            {/* Bento Card 4: Accessibility & Easy Mode */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 backdrop-blur-xl transition-all duration-250 ease-out hover:-translate-y-1 hover:border-[#20D6C2] hover:bg-[var(--surface-hover)] hover:shadow-[0_16px_36px_-10px_rgba(0,0,0,0.7),0_0_22px_rgba(32,214,194,0.28)] shadow-[var(--shadow-card)]">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-amber-500/15 text-amber-500 dark:text-[#FBBF24] border border-amber-500/25">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="mt-6 font-display text-xl font-bold text-[var(--text)]">Easy Mode &amp; Senior Friendly</h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                Large high-contrast text, clear buttons, speech synthesis, and zero confusing menus make MediTrack effortless for all ages.
              </p>
            </div>

            {/* Bento Card 5: Full History & Adherence */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 backdrop-blur-xl transition-all duration-250 ease-out hover:-translate-y-1 hover:border-[#20D6C2] hover:bg-[var(--surface-hover)] hover:shadow-[0_16px_36px_-10px_rgba(0,0,0,0.7),0_0_22px_rgba(32,214,194,0.28)] shadow-[var(--shadow-card)]">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-500/15 text-blue-500 dark:text-[#60A5FA] border border-blue-500/25">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mt-6 font-display text-xl font-bold text-[var(--text)]">Comprehensive Log History</h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                Review past timestamps, doses taken vs snoozed, and weekly trends to review with your doctor during appointments.
              </p>
            </div>

            {/* Bento Card 6: Privacy by Design */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 backdrop-blur-xl transition-all duration-250 ease-out hover:-translate-y-1 hover:border-[#20D6C2] hover:bg-[var(--surface-hover)] hover:shadow-[0_16px_36px_-10px_rgba(0,0,0,0.7),0_0_22px_rgba(32,214,194,0.28)] shadow-[var(--shadow-card)]">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#16A36A]/15 text-[#16A36A] dark:text-[#20C982] border border-[#16A36A]/25">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="mt-6 font-display text-xl font-bold text-[var(--text)]">Consent-Based Sharing</h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                You retain complete authority. Nobody sees your schedule until you grant permission, and access can be revoked at any second.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="border-t border-[var(--border)] bg-[var(--bg-secondary)]/50 py-24 transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#16A36A] dark:text-[#20C982]">Simple Process</span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold text-[var(--text)]">
              How MediTrack Works
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Three simple steps to stress-free medication management.</p>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-md shadow-[var(--shadow-card)] transition-all duration-250 ease-out hover:-translate-y-1 hover:border-[#20D6C2] hover:bg-[var(--surface-hover)] hover:shadow-[0_16px_36px_-10px_rgba(0,0,0,0.7),0_0_20px_rgba(32,214,194,0.25)]">
              <span className="font-mono text-3xl font-extrabold text-[#16A36A] dark:text-[#20C982] opacity-75">01</span>
              <h3 className="mt-4 font-display text-lg font-bold text-[var(--text)]">Add Your Schedule</h3>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">
                Input your medications, dosages, doctor notes, and desired reminder times. Choose tablet, capsule, syrup, or injection.
              </p>
            </div>

            <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-md shadow-[var(--shadow-card)] transition-all duration-250 ease-out hover:-translate-y-1 hover:border-[#20D6C2] hover:bg-[var(--surface-hover)] hover:shadow-[0_16px_36px_-10px_rgba(0,0,0,0.7),0_0_20px_rgba(32,214,194,0.25)]">
              <span className="font-mono text-3xl font-extrabold text-[#16A36A] dark:text-[#20C982] opacity-75">02</span>
              <h3 className="mt-4 font-display text-lg font-bold text-[var(--text)]">Receive Gentle Alerts</h3>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">
                Get notified on time. Tap &apos;Mark as Taken&apos; with one tap, or snooze for 10–15 minutes if you are occupied.
              </p>
            </div>

            <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 backdrop-blur-md shadow-[var(--shadow-card)] transition-all duration-250 ease-out hover:-translate-y-1 hover:border-[#20D6C2] hover:bg-[var(--surface-hover)] hover:shadow-[0_16px_36px_-10px_rgba(0,0,0,0.7),0_0_20px_rgba(32,214,194,0.25)]">
              <span className="font-mono text-3xl font-extrabold text-[#A78BFA] opacity-75">03</span>
              <h3 className="mt-4 font-display text-lg font-bold text-[var(--text)]">Stay Reassured</h3>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">
                Caregivers check your updates remotely without calling to check. Your adherence statistics are safely recorded.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Family Care Spotlight */}
      <section id="family-care" className="py-24 border-t border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-3xl border border-[#16A36A]/30 bg-gradient-to-br from-[var(--surface)] via-[var(--bg-secondary)] to-[var(--surface-elevated)] p-8 sm:p-12 relative overflow-hidden shadow-[var(--shadow-card)]">
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-[#16A36A]/15 blur-3xl" />

            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#16A36A]/15 border border-[#16A36A]/30 px-3 py-1 text-xs font-semibold text-[#16A36A] dark:text-[#A3EAC1]">
                <Users className="h-3.5 w-3.5" /> Caregiver Circle
              </span>
              <h2 className="mt-4 font-display text-3xl sm:text-4xl font-extrabold text-[var(--text)]">
                Care is closer than you think.
              </h2>
              <p className="mt-3 text-sm sm:text-base leading-relaxed text-[var(--text-secondary)]">
                Caring for a parent or family member from afar should not be stressful. With MediTrack, caregivers see a calm summary of whether daily medicines were confirmed, without constant phone calls or invasion of privacy.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/family"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#16A36A] to-[#20C982] px-6 text-xs font-bold text-white shadow-md hover:brightness-105 transition-all"
                >
                  Explore Family Circle
                </Link>
                <Link
                  href="/register"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 text-xs font-semibold text-[var(--text)] hover:border-[#16A36A]/40 transition-all shadow-sm"
                >
                  Invite a Loved One
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Assistant Callout */}
      <section id="ai-assistant" className="py-20 border-t border-[var(--border)] bg-[var(--bg-secondary)]/40 transition-colors duration-300">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="inline-grid h-12 w-12 place-items-center rounded-2xl bg-[#A78BFA]/15 text-[#A78BFA] border border-[#A78BFA]/30 mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[var(--text)]">
            Meet Your MediTrack AI Companion
          </h2>
          <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
            Available 24/7 in the lower right corner of every page. Ask questions about timing your doses with meals, handling snoozed medicines, or setting up family access.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-[var(--text-secondary)]">
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 shadow-sm">
              &ldquo;How to take medicine with food?&rdquo;
            </span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 shadow-sm">
              &ldquo;What if I miss my morning dose?&rdquo;
            </span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 shadow-sm">
              &ldquo;How does family sharing work?&rdquo;
            </span>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-20 border-t border-[var(--border)]">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-[var(--text)]">
            Ready to simplify your daily medicine routine?
          </h2>
          <p className="mt-4 text-base text-[var(--text-secondary)]">
            Join thousands of patients and caregivers who trust MediTrack for daily wellness.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#16A36A] to-[#20C982] px-8 text-sm font-bold text-white shadow-[0_4px_22px_rgba(22,163,106,0.35)] hover:brightness-105 active:scale-95 transition-all"
            >
              Create Free Account
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-8 text-sm font-semibold text-[var(--text)] hover:border-[#16A36A]/40 transition-all shadow-sm"
            >
              Launch Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Professional Healthcare Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--bg-secondary)] py-12 text-xs text-[var(--text-muted)] transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <Logo variant="full" size="sm" glow={false} />
            </Link>
            <div className="flex flex-wrap gap-6 text-[var(--text-secondary)]">
              <Link href="/dashboard" className="hover:text-[#16A36A] dark:hover:text-[#20C982] transition-colors">Dashboard</Link>
              <Link href="/medicines" className="hover:text-[#16A36A] dark:hover:text-[#20C982] transition-colors">Medicines</Link>
              <Link href="/family" className="hover:text-[#16A36A] dark:hover:text-[#20C982] transition-colors">Family Care</Link>
              <Link href="/settings" className="hover:text-[#16A36A] dark:hover:text-[#20C982] transition-colors">Settings</Link>
              <Link href="/login" className="hover:text-[#16A36A] dark:hover:text-[#20C982] transition-colors">Sign In</Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4">
            <p>&copy; {new Date().getFullYear()} MediTrack Platform. All rights reserved.</p>
            <p className="text-[11px] text-[var(--text-muted)] max-w-md">
              Medical Notice: MediTrack is a clinical adherence companion and timetable tracker. It does not provide medical diagnoses or modify prescriptions. Consult your physician for medical advice.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating AI Assistant Widget */}
      <AIAssistantWidget />
    </div>
  );
}