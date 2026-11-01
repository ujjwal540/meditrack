import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";

export function PageShell({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:pb-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
            {subtitle && <p className="mt-1 text-lg text-slate-600">{subtitle}</p>}
          </div>
          {action}
        </div>
        {children}
      </main>
    </>
  );
}
