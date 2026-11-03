"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import {
  CalendarDays,
  HeartPulse,
  Home,
  Pill,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items: { href: string; label: string; Icon: LucideIcon; also: string[] }[] = [
  { href: "/dashboard", label: "Dashboard", Icon: Home, also: [] },
  { href: "/medicines", label: "Medicines", Icon: Pill, also: ["/schedule"] },
  { href: "/health", label: "Health", Icon: HeartPulse, also: ["/history"] },
  { href: "/family", label: "Family", Icon: Users, also: [] },
  { href: "/settings", label: "Settings", Icon: UserRound, also: [] },
];

export function Navbar() {
  const path = usePathname();
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
                  "group relative flex min-h-12 items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold tracking-wide transition-all duration-200",
                  active
                    ? "border border-[#16A36A]/30 bg-[#16A36A]/15 text-[#16A36A] dark:text-[#A3EAC1] shadow-[0_0_20px_rgba(22,163,106,0.18)]"
                    : "border border-transparent text-[var(--text-secondary)] hover:border-[var(--border)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text)]",
                )}
              >
                <item.Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    active
                      ? "text-[#16A36A] dark:text-[#20C982]"
                      : "text-[var(--text-muted)] group-hover:text-[#16A36A] dark:group-hover:text-[#20C982]",
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
                {active && (
                  <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-[#20C982] shadow-[0_0_8px_#20C982]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Schedule Shortcut */}
        <div className="mt-auto pt-4 border-t border-[var(--border)]">
          <Link
            href="/schedule"
            className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/60 p-3 text-xs text-[var(--text-secondary)] hover:border-[#16A36A]/30 hover:text-[#16A36A] dark:hover:text-[#20C982] transition-all"
          >
            <CalendarDays className="h-4 w-4 text-[#16A36A] dark:text-[#20C982] shrink-0" />
            <span className="truncate font-medium">View Daily Timetable</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Dock */}
      <nav
        aria-label="Mobile navigation"
        className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 md:hidden border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-xl"
      >
        {items.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "mobile-bottom-nav-item flex min-h-[4rem] flex-col items-center justify-center gap-1 text-[0.75rem] font-medium tracking-tight transition-colors",
                active ? "is-active text-[#16A36A] dark:text-[#20C982]" : "text-[var(--text-muted)]",
              )}
            >
              <span
                className={cn(
                  "mobile-bottom-nav-icon grid h-8 w-12 place-items-center rounded-full transition-all",
                  active
                    ? "bg-[#16A36A]/20 text-[#16A36A] dark:text-[#A3EAC1] shadow-[0_0_12px_rgba(22,163,106,0.3)]"
                    : "text-[var(--text-muted)]",
                )}
              >
                <item.Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="truncate max-w-[4rem]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
