"use client";

import {
  Contrast,
  Type,
  Volume2,
  VolumeX,
  type LucideIcon,
} from "lucide-react";
import { useAccessibility } from "@/components/layout/AccessibilityProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useVoice } from "@/hooks/use-voice";
import { cn } from "@/lib/utils";

function Toggle({
  on,
  onClick,
  Icon,
  label,
}: {
  on: boolean;
  onClick: () => void;
  Icon: LucideIcon;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "inline-flex min-h-10 items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200",
        on
          ? "border-[#20C982]/40 bg-[#16A36A]/15 text-[#16A36A] dark:text-[#A3EAC1] shadow-[0_0_12px_rgba(22,163,106,0.25)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[#16A36A]/30 hover:text-[var(--text)]",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

export function AccessibilityBar() {
  const { easy, contrast, voice, toggle } = useAccessibility();
  const { speak } = useVoice();

  return (
    <div
      role="group"
      aria-label="Display, theme and voice preferences"
      className="mb-6 flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 p-2 backdrop-blur-md shadow-sm transition-colors duration-200"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Toggle
          on={easy}
          onClick={() => toggle("easy")}
          Icon={Type}
          label={easy ? "Easy Mode: On" : "Easy Mode"}
        />
        <Toggle
          on={contrast}
          onClick={() => toggle("contrast")}
          Icon={Contrast}
          label="High contrast"
        />
        <Toggle
          on={voice}
          onClick={() => {
            toggle("voice");
            if (!voice) speak("Voice assistance enabled.", true);
          }}
          Icon={voice ? Volume2 : VolumeX}
          label={voice ? "Voice: Active" : "Voice: Off"}
        />
      </div>

      <ThemeToggle showLabel={true} />
    </div>
  );
}