"use client";

import { cn } from "@/lib/utils";

export interface LogoProps {
  variant?: "icon" | "full";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  glow?: boolean;
}

export function Logo({
  variant = "full",
  size = "md",
  className,
  glow = true,
}: LogoProps) {
  // Dimension mapping
  const sizeMap = {
    sm: { icon: 24, text: "text-lg", sub: "text-[9px]" },
    md: { icon: 34, text: "text-xl", sub: "text-[10px]" },
    lg: { icon: 44, text: "text-2xl", sub: "text-[11px]" },
    xl: { icon: 64, text: "text-3xl", sub: "text-xs" },
  };

  const dim = sizeMap[size];

  // Standalone Medical Emerald Icon SVG
  const IconElement = (
    <svg
      viewBox="0 0 256 256"
      width={dim.icon}
      height={dim.icon}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "shrink-0 transition-transform duration-200",
        glow && "drop-shadow-[0_0_12px_rgba(22,163,106,0.45)]",
      )}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="meditrackCrossGrad" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#20C982" />
          <stop offset="60%" stopColor="#16A36A" />
          <stop offset="100%" stopColor="#11794E" />
        </linearGradient>
        <filter id="ecgGlowFilter" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#07130E" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Geometric Medical Cross (+) */}
      <rect x="36" y="96" width="184" height="64" rx="20" fill="url(#meditrackCrossGrad)" />
      <rect x="96" y="36" width="64" height="184" rx="20" fill="url(#meditrackCrossGrad)" />

      {/* Centered White ECG Heartbeat Waveform */}
      <path
        d="M 44 128 L 92 128 L 105 137 L 125 72 L 145 178 L 161 118 Q 172 113 182 128 L 212 128"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#ecgGlowFilter)"
      />
      <circle cx="44" cy="128" r="3.5" fill="#FFFFFF" opacity="0.9" />
      <circle cx="212" cy="128" r="3.5" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );

  if (variant === "icon") {
    return (
      <span className={cn("inline-flex items-center justify-center", className)}>
        {IconElement}
      </span>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-3 select-none", className)}>
      {IconElement}
      <div className="flex flex-col text-left">
        <span
          className={cn(
            "font-display font-extrabold tracking-tight text-[var(--text)] leading-none",
            dim.text,
          )}
        >
          Medi<span className="text-[#16A36A] dark:text-[#20C982]">Track</span>
        </span>
        <span
          className={cn(
            "font-semibold uppercase tracking-wider text-[var(--text-secondary)] leading-none mt-1",
            dim.sub,
          )}
        >
          Smart Care Platform
        </span>
      </div>
    </div>
  );
}
