"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { AccessibilityBar } from "@/components/layout/AccessibilityBar";
import { Navbar } from "@/components/layout/Navbar";
import { AIAssistantWidget } from "@/components/ai/AIAssistantWidget";
import { BackButton } from "@/components/ui/BackButton";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ProfileDropdown } from "@/components/profile/ProfileDropdown";
import { useTranslation } from "@/i18n/LanguageContext";
import { getActiveUser } from "@/lib/auth";
import type { UserRole } from "@/types";

export function PageShell({
  title,
  subtitle,
  action,
  bare = false,
  showBackButton,
  backFallbackUrl = "/dashboard",
  backLabel,
  onBack,
  children,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  bare?: boolean; /* true = page draws its own header (dashboard) */
  showBackButton?: boolean;
  backFallbackUrl?: string;
  backLabel?: string;
  onBack?: () => void;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard" || pathname === "/";
  const { isNepali } = useTranslation();
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name?: string;
    email?: string;
    role: UserRole;
  } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const shouldShowBack = showBackButton !== undefined ? showBackButton : !bare;

  useEffect(() => {
    let isMounted = true;
    void getActiveUser().then((user) => {
      if (!isMounted) return;
      if (!user) {
        router.push("/login");
      } else {
        setCurrentUser(user);
        setCheckingAuth(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="relative min-h-dvh flex items-center justify-center bg-[var(--bg-app)] text-[var(--text)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 rounded-full border-2 border-[#16A36A] border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-[var(--text-secondary)]">
            Verifying care session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh bg-[var(--bg-app)] text-[var(--text)] transition-colors duration-250">
      {/* Ambient Medical Emerald Glows */}
      <div className="pointer-events-none fixed -top-40 -right-40 h-96 w-96 rounded-full bg-[#16A36A]/12 blur-[130px]" />
      <div className="pointer-events-none fixed top-1/2 -left-40 h-96 w-96 rounded-full bg-[#A78BFA]/8 blur-[140px]" />

      <Navbar user={currentUser} onUserUpdated={setCurrentUser} />

      <div className="md:pl-64">
        {/* Sticky Global Application Header (Linear / Stripe / Apple SaaS standard) */}
        <header className="sticky top-0 z-40 flex min-h-14 sm:min-h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/95 px-3 xs:px-4 sm:px-6 md:px-8 py-2 backdrop-blur-xl transition-colors shadow-xs">
          {/* Left Zone: [Back Button] + [Title & Subtitle Stack] + [Status Badge] */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 mr-2 sm:mr-4">
            {shouldShowBack ? (
              <BackButton
                fallbackUrl={backFallbackUrl}
                label={backLabel}
                onClick={onBack}
                size="md"
              />
            ) : (
              !bare && (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 md:hidden transition-transform hover:scale-105 shrink-0"
                  aria-label="MediTrack Dashboard"
                >
                  <Logo variant="icon" size="sm" glow={true} />
                </Link>
              )
            )}

            {/* Title & Subtitle + Status Badge Block - Full Width on Non-Dashboard Pages */}
            <div className="flex flex-col justify-center min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="font-display text-base sm:text-lg md:text-xl font-bold tracking-tight text-[var(--text)] break-words">
                  {title || (isNepali ? "ड्यासबोर्ड" : "Dashboard")}
                </h1>

                {/* Status Badge: Displayed directly beside page title */}
                {action && (
                  <div className="inline-flex items-center shrink-0">
                    {action}
                  </div>
                )}
              </div>

              {subtitle && (
                <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] font-normal tracking-normal leading-tight mt-0.5 max-w-2xl">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right Zone: Controls (Language Selector + Theme Toggle + Profile Avatar) */}
          {/* CRITICAL REQUIREMENT: Rendered ONLY on Dashboard page (/dashboard). On all other pages (Medicines, Health, Family, Care Pros, Settings, etc.), completely hidden. */}
          {isDashboard && (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <LanguageSwitcher variant="toggle" showIcon={false} />
              <ThemeToggle showLabel={false} />
              <ProfileDropdown
                user={currentUser}
                compact={true}
                direction="down"
                onUserUpdated={setCurrentUser}
              />
            </div>
          )}
        </header>

        <main className="animate-rise mx-auto max-w-5xl px-3 xs:px-4 sm:px-6 md:px-8 pb-28 pt-3 sm:pt-5 md:pb-16">
          {/* Accessibility Controls Ribbon (Easy Mode, High Contrast, Voice Assistance) */}
          <AccessibilityBar
            user={currentUser}
            onUserUpdated={setCurrentUser}
            hideUtilityControls={true}
          />

          {children}
        </main>
      </div>

      {/* Floating AI Assistant Widget */}
      <AIAssistantWidget />
    </div>
  );
}