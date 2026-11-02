"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartPulse, Home, Pill, UserRound, Users, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const items: { href: string; label: string; Icon: LucideIcon; also: string[] }[] = [
  { href: "/dashboard", label: "Home", Icon: Home, also: [] },
  { href: "/medicines", label: "Medicines", Icon: Pill, also: ["/schedule"] },
  { href: "/health", label: "Health", Icon: HeartPulse, also: ["/history"] },
  { href: "/family", label: "Family", Icon: Users, also: [] },
  { href: "/settings", label: "Profile", Icon: UserRound, also: [] },
];

export function Navbar() {
  const path = usePathname();
  const isActive = (item: (typeof items)[number]) =>
    path === item.href || item.also.includes(path);

  return (
    <>
      <aside
        aria-label="Main"
        className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-black/5 bg-[#faf6ee] p-5 md:flex"
      >
        <Link href="/dashboard" className="mb-8 flex items-center gap-3 font-display text-2xl font-bold text-forest">
          <Image src="/logo.svg" alt="" width={40} height={40} />
          MediTrack
        </Link>
        <nav className="space-y-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item) ? "page" : undefined}
              className={cn(
                "flex min-h-14 items-center gap-4 rounded-2xl px-4 text-lg font-extrabold transition-colors",
                isActive(item) ? "bg-forest text-white shadow-soft" : "text-ink hover:bg-mint",
              )}
            >
              <item.Icon className="h-6 w-6" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <nav
        aria-label="Main mobile"
        className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 md:hidden"
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(item) ? "page" : undefined}
            className={cn(
              "mobile-bottom-nav-item flex min-h-[4.25rem] flex-col items-center justify-center gap-1 text-[0.8rem] font-extrabold",
              isActive(item) ? "is-active" : "",
            )}
          >
            <span className="mobile-bottom-nav-icon grid h-9 w-14 place-items-center rounded-full">
              <item.Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
