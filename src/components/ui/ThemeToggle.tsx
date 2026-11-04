"use client";

import { Moon, Sun } from "lucide-react";
import { useAccessibility } from "@/components/layout/AccessibilityProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  className,
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const { theme, toggleTheme } = useAccessibility();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Current theme is ${theme}. Click to switch to ${isDark ? "light" : "dark"} mode`}
      onClick={toggleTheme}
      className={cn(
        "group relative inline-flex items-center gap-2 rounded-xl p-1.5 transition-all duration-200 ease-out",
        "border border-[var(--border)] bg-[var(--surface-elevated)]/80 backdrop-blur-md",
        "hover:border-[#20D6C2] hover:bg-[var(--surface-hover)] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(32,214,194,0.3)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20D6C2] active:translate-y-0",
        className,
      )}
    >
      <div className="relative flex items-center gap-1">
        {/* Light Option Icon */}
        <span
          className={cn(
            "grid h-7 w-7 place-items-center rounded-lg transition-all duration-300",
            !isDark
              ? "bg-[#16A36A] text-white shadow-[0_0_10px_rgba(22,163,106,0.4)]"
              : "text-slate-400 group-hover:text-slate-300",
          )}
        >
          <Sun className="h-4 w-4 transition-transform group-hover:rotate-45 duration-300" />
        </span>

        {/* Dark Option Icon */}
        <span
          className={cn(
            "grid h-7 w-7 place-items-center rounded-lg transition-all duration-300",
            isDark
              ? "bg-[#183326] text-[#20C982] shadow-[0_0_12px_rgba(32,201,130,0.3)] border border-[#20C982]/30"
              : "text-slate-500 group-hover:text-slate-600",
          )}
        >
          <Moon className="h-4 w-4 transition-transform group-hover:-rotate-12 duration-300" />
        </span>
      </div>

      {showLabel && (
        <span className="hidden sm:inline-block pr-2 text-xs font-semibold tracking-wide text-[var(--text-secondary)]">
          {isDark ? "Dark" : "Light"}
        </span>
      )}
    </button>
  );
}
