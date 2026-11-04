"use client";

import React from "react";
import { Languages, Check } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  variant?: "toggle" | "cards" | "minimal";
  className?: string;
  showIcon?: boolean;
}

export function LanguageSwitcher({
  variant = "toggle",
  className,
  showIcon = true,
}: LanguageSwitcherProps) {
  const { language, setLanguage, isNepali, t } = useLanguage();

  if (variant === "cards") {
    return (
      <div
        role="radiogroup"
        aria-label={t.settings.languageSectionTitle}
        className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3.5", className)}
      >
        {/* English Option Card */}
        <button
          type="button"
          role="radio"
          aria-checked={language === "en"}
          onClick={() => setLanguage("en")}
          className={cn(
            "relative flex flex-col items-start p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer",
            language === "en"
              ? "border-[#16A36A] bg-[#16A36A]/15 text-[var(--text)] shadow-[0_0_20px_rgba(22,163,106,0.22)] ring-1 ring-[#16A36A]"
              : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:border-[#20D6C2]/50 hover:bg-[var(--surface-hover)] hover:text-[var(--text)]",
          )}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className="inline-flex items-center gap-2 font-display text-base font-bold text-[var(--text)]">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--surface)] text-xs font-mono font-bold text-[#16A36A] dark:text-[#20C982] border border-[var(--border)]">
                EN
              </span>
              <span>{t.settings.englishLanguageCardTitle}</span>
            </span>
            {language === "en" && (
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#16A36A] text-white">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {t.settings.englishLanguageCardDesc}
          </p>
        </button>

        {/* Nepali Option Card */}
        <button
          type="button"
          role="radio"
          aria-checked={language === "ne"}
          onClick={() => setLanguage("ne")}
          className={cn(
            "relative flex flex-col items-start p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer",
            language === "ne"
              ? "border-[#16A36A] bg-[#16A36A]/15 text-[var(--text)] shadow-[0_0_20px_rgba(22,163,106,0.22)] ring-1 ring-[#16A36A]"
              : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:border-[#20D6C2]/50 hover:bg-[var(--surface-hover)] hover:text-[var(--text)]",
          )}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <span className="inline-flex items-center gap-2 font-display text-base font-bold text-[var(--text)]">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--surface)] text-xs font-mono font-bold text-[#16A36A] dark:text-[#20C982] border border-[var(--border)]">
                ने
              </span>
              <span>{t.settings.nepaliLanguageCardTitle}</span>
            </span>
            {language === "ne" && (
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#16A36A] text-white">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {t.settings.nepaliLanguageCardDesc}
          </p>
        </button>
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <button
        type="button"
        onClick={() => setLanguage(isNepali ? "en" : "ne")}
        aria-label={t.common.switchLanguage}
        title={t.common.switchLanguage}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text)] transition-all hover:border-[#20D6C2] hover:bg-[var(--surface-hover)] active:scale-95 shadow-sm",
          className,
        )}
      >
        <Languages className="h-3.5 w-3.5 text-[#16A36A] dark:text-[#20C982]" />
        <span>{isNepali ? "English" : "नेपाली"}</span>
      </button>
    );
  }

  // Default "toggle" pill variant
  return (
    <div
      role="group"
      aria-label={t.common.switchLanguage}
      className={cn(
        "inline-flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-sm backdrop-blur-md transition-colors",
        className,
      )}
    >
      {showIcon && (
        <span className="px-2 text-[var(--text-muted)]" aria-hidden="true">
          <Languages className="h-3.5 w-3.5 text-[#16A36A] dark:text-[#20C982]" />
        </span>
      )}
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        className={cn(
          "rounded-lg px-2.5 py-1 text-xs font-bold transition-all duration-180",
          language === "en"
            ? "bg-[#16A36A] text-white shadow-sm"
            : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]",
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage("ne")}
        aria-pressed={language === "ne"}
        className={cn(
          "rounded-lg px-2.5 py-1 text-xs font-bold transition-all duration-180",
          language === "ne"
            ? "bg-[#16A36A] text-white shadow-sm"
            : "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]",
        )}
      >
        नेपाली
      </button>
    </div>
  );
}
