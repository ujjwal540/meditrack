"use client";

import { useState } from "react";
import {
  Contrast,
  Type,
  Volume2,
  VolumeX,
  type LucideIcon,
} from "lucide-react";
import { useAccessibility } from "@/components/layout/AccessibilityProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ProfileDropdown } from "@/components/profile/ProfileDropdown";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useVoice } from "@/hooks/use-voice";
import { useTranslation } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

function Toggle({
  on,
  onClick,
  Icon,
  label,
  shortLabel,
}: {
  on: boolean;
  onClick: () => void;
  Icon: LucideIcon;
  label: string;
  shortLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      title={label}
      className={cn(
        "inline-flex min-h-9 sm:min-h-10 items-center gap-1.5 sm:gap-2 rounded-xl border px-2.5 sm:px-3 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20D6C2] focus-visible:ring-offset-1",
        on
          ? "border-[#20D6C2] bg-[#16A36A]/15 text-[#16A36A] dark:text-[#A3EAC1] shadow-[0_0_14px_rgba(32,214,194,0.3)] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(32,214,194,0.4)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[#20D6C2] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(32,214,194,0.18)] active:translate-y-0",
      )}
    >
      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" aria-hidden="true" />
      <span className={cn(shortLabel ? "hidden sm:inline" : "inline")}>{label}</span>
      {shortLabel && <span className="sm:hidden text-[11px]">{shortLabel}</span>}
    </button>
  );
}

export function AccessibilityBar({
  user,
  onUserUpdated,
}: {
  user?: { id: string; name?: string; email?: string; role: UserRole } | null;
  onUserUpdated?: (u: { id: string; name?: string; email?: string; role: UserRole }) => void;
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { easy, contrast, voice, toggle } = useAccessibility();
  const { speak } = useVoice();
  const { t, isNepali } = useTranslation();

  return (
    <div
      role="group"
      aria-label="Display, theme, language, voice and account preferences"
      className={cn(
        "relative mb-6 flex flex-wrap items-center justify-between gap-2 sm:gap-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/85 p-2 sm:p-2.5 backdrop-blur-md shadow-sm transition-all duration-200",
        isProfileOpen ? "z-50" : "z-30",
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <Toggle
          on={easy}
          onClick={() => toggle("easy")}
          Icon={Type}
          label={easy ? t.accessibility.easyModeOn : t.accessibility.easyModeOff}
          shortLabel={isNepali ? "सजिलो" : "Easy"}
        />
        <Toggle
          on={contrast}
          onClick={() => toggle("contrast")}
          Icon={Contrast}
          label={contrast ? t.accessibility.highContrastOn : t.accessibility.highContrastOff}
          shortLabel={isNepali ? "कन्ट्रास्ट" : "Contrast"}
        />
        <Toggle
          on={voice}
          onClick={() => {
            toggle("voice");
            if (!voice) {
              speak(
                isNepali
                  ? "आवाज सहायता सक्रिय गरियो।"
                  : "Voice assistance enabled.",
                true,
              );
            }
          }}
          Icon={voice ? Volume2 : VolumeX}
          label={voice ? t.accessibility.voiceOn : t.accessibility.voiceOff}
          shortLabel={isNepali ? "आवाज" : "Voice"}
        />
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Global Instant Bilingual Language Switcher */}
        <LanguageSwitcher variant="toggle" showIcon={true} />

        <ThemeToggle showLabel={false} />

        <ProfileDropdown
          user={user ?? null}
          compact={true}
          direction="down"
          onUserUpdated={onUserUpdated}
          onOpenChange={setIsProfileOpen}
        />
      </div>
    </div>
  );
}