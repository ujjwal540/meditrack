"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import {
  Briefcase,
  CalendarDays,
  HeartPulse,
  Home,
  Pill,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfileDropdown } from "@/components/profile/ProfileDropdown";
import { useTranslation } from "@/i18n/LanguageContext";
import type { UserRole } from "@/types";

export function Navbar({
  user,
  onUserUpdated,
}: {
  user?: { id: string; name?: string; email?: string; role: UserRole } | null;
  onUserUpdated?: (u: { id: string; name?: string; email?: string; role: UserRole }) => void;
}) {
  const path = usePathname();
  const { t } = useTranslation();

  const items: { href: string; label: string; Icon: LucideIcon; also: string[] }[] = [
    { href: "/dashboard", label: t.nav.dashboard, Icon: Home, also: [] },
    { href: "/medicines", label: t.nav.medicines, Icon: Pill, also: ["/schedule"] },
    { href: "/health", label: t.nav.healthStats, Icon: HeartPulse, also: ["/history"] },
    { href: "/family", label: t.nav.familyCare, Icon: Users, also: [] },
    { href: "/marketplace", label: t.nav.carePros, Icon: Briefcase, also: [] },
    { href: "/settings", label: t.nav.settings, Icon: UserRound, also: [] },
  ];

  const isActive = (item: (typeof items)[number]) =>
    path === item.href || item.also.includes(path);

  return (
    <>
      {/* Desktop Sidebar with Medical Emerald Identity */}
      <aside
        aria-label="Main navigation"
        className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-2xl md:flex transition-colors duration-200"
      >
        {/* Brand Lockup */}
        <Link
          href="/dashboard"
          className="group mb-8 block px-2 py-1 transition-transform hover:scale-[1.02]"
        >
          <Logo variant="full" size="md" glow={true} />
        </Link>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5" aria-label="Sidebar navigation">
          {items.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex min-h-12 items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold tracking-wide transition-all duration-200 ease-out",
                  active
                    ? "border border-[#20D6C2]/40 bg-[#16A36A]/15 text-[#16A36A] dark:text-[#A3EAC1] shadow-[0_0_20px_rgba(32,214,194,0.22)]"
                    : "border border-transparent text-[var(--text-secondary)] hover:border-[#20D6C2]/50 hover:bg-[var(--surface-hover)] hover:text-[var(--text)] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(32,214,194,0.15)]",
                )}
              >
                <item.Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors duration-200",
                    active
                      ? "text-[#16A36A] dark:text-[#20C982]"
                      : "text-[var(--text-muted)] group-hover:text-[#20D6C2]",
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
                {active && (
                  <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-[#20D6C2] shadow-[0_0_8px_#20D6C2]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Card & Quick Shortcut */}
        <div className="mt-auto space-y-2 pt-3 border-t border-[var(--border)]">
          <ProfileDropdown
            user={user ?? null}
            direction="up"
            compact={false}
            onUserUpdated={onUserUpdated}
            className="w-full"
          />
          <Link
            href="/schedule"
            className="flex items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/40 p-2.5 text-xs text-[var(--text-secondary)] transition-all duration-200 ease-out hover:border-[#20D6C2] hover:bg-[var(--surface-hover)] hover:-translate-y-0.5 hover:text-[var(--text)] hover:shadow-[0_4px_14px_rgba(32,214,194,0.15)]"
          >
            <CalendarDays className="h-4 w-4 text-[#16A36A] dark:text-[#20C982] shrink-0" />
            <span className="truncate font-medium text-[11px]">{t.nav.timetable}</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Dock */}
      <nav
        aria-label="Mobile navigation"
        className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 md:hidden border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-xl"
      >
        {items.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "mobile-bottom-nav-item flex min-h-[3.75rem] flex-col items-center justify-center gap-0.5 px-0.5 text-[0.65rem] sm:text-[0.72rem] font-medium tracking-tight transition-colors duration-200",
                active ? "is-active text-[#16A36A] dark:text-[#20C982]" : "text-[var(--text-muted)] hover:text-[#20D6C2]",
              )}
            >
              <span
                className={cn(
                  "mobile-bottom-nav-icon grid h-7 w-9 sm:h-8 sm:w-11 place-items-center rounded-full transition-all duration-200",
                  active
                    ? "bg-[#16A36A]/20 text-[#16A36A] dark:text-[#A3EAC1] shadow-[0_0_12px_rgba(32,214,194,0.35)]"
                    : "text-[var(--text-muted)] group-hover:text-[#20D6C2]",
                )}
              >
                <item.Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              </span>
              <span className="truncate w-full text-center px-0.5">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
