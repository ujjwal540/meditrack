import type { ReactNode } from "react";
import { AccessibilityBar } from "@/components/layout/AccessibilityBar";
import { Navbar } from "@/components/layout/Navbar";
import { AIAssistantWidget } from "@/components/ai/AIAssistantWidget";

export function PageShell({
  title,
  subtitle,
  action,
  bare = false,
  children,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  bare?: boolean; /* true = page draws its own header (dashboard) */
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-dvh bg-[var(--bg-app)] text-[var(--text)] transition-colors duration-250">
      {/* Ambient Medical Emerald Glows */}
      <div className="pointer-events-none fixed -top-40 -right-40 h-96 w-96 rounded-full bg-[#16A36A]/12 blur-[130px]" />
      <div className="pointer-events-none fixed top-1/2 -left-40 h-96 w-96 rounded-full bg-[#A78BFA]/8 blur-[140px]" />

      <Navbar />

      <div className="md:pl-64">
        <main className="animate-rise mx-auto max-w-5xl px-4 pb-32 pt-5 md:px-8 md:pb-16 md:pt-8">
          <AccessibilityBar />

          {!bare && title && (
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border)] pb-5">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)]">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-1.5 text-base sm:text-lg text-[var(--text-secondary)]">
                    {subtitle}
                  </p>
                )}
              </div>
              {action && <div className="shrink-0">{action}</div>}
            </div>
          )}

          {children}
        </main>
      </div>

      {/* Floating AI Assistant Widget */}
      <AIAssistantWidget />
    </div>
  );
}