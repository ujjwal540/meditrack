"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, History, LayoutDashboard, Pill, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/medicines", label: "Medicines", Icon: Pill },
  { href: "/schedule", label: "Schedule", Icon: CalendarDays },
  { href: "/family", label: "Family", Icon: Users },
  { href: "/history", label: "History", Icon: History },
  { href: "/settings", label: "Settings", Icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <Image src="/logo.svg" alt="" width={32} height={32} />
          MediTrack
        </Link>
        <nav aria-label="Main" className="ml-auto hidden gap-1 md:flex">
          {links.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-base font-medium",
                pathname === href ? "bg-teal-50 text-primary" : "text-slate-700 hover:bg-slate-100",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
      {/* Mobile bottom navigation */}
      <nav
        aria-label="Main mobile"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-slate-200 bg-white md:hidden"
      >
        {links.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium",
              pathname === href ? "text-primary" : "text-slate-600",
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
