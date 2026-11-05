"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

export interface BackButtonProps {
  fallbackUrl?: string;
  label?: string;
  showLabel?: boolean;
  className?: string;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

export function BackButton({
  fallbackUrl = "/dashboard",
  label,
  showLabel = false,
  className,
  onClick,
  size = "md",
}: BackButtonProps) {
  const router = useRouter();
  const { isNepali } = useTranslation();

  const handleBack = () => {
    if (onClick) {
      onClick();
      return;
    }

    if (typeof window !== "undefined") {
      const historyState = window.history.state;
      const hasHistoryStack =
        typeof historyState?.idx === "number" && historyState.idx > 0;
      const isInternalReferrer =
        typeof document !== "undefined" &&
        Boolean(document.referrer) &&
        document.referrer.includes(window.location.host);

      if (hasHistoryStack || (window.history.length > 1 && isInternalReferrer)) {
        router.back();
      } else {
        router.push(fallbackUrl);
      }
    } else {
      router.push(fallbackUrl);
    }
  };

  const defaultAriaLabel = isNepali ? "अघिल्लो पृष्ठमा फर्कनुहोस्" : "Go back";
  const defaultTextLabel = isNepali ? "फर्कनुहोस्" : "Back";

  // Compact, elegant icon button sizing (40–42px) matching Linear, Stripe, and Apple standards
  const sizeClasses =
    size === "sm"
      ? "h-9 w-9 rounded-lg"
      : size === "lg"
        ? "h-11 w-11 rounded-xl"
        : "h-10 w-10 sm:h-10 sm:w-10 rounded-xl"; // 40px touch target, perfectly balanced

  const iconSizes =
    size === "sm"
      ? "h-4 w-4 stroke-[2.2]"
      : size === "lg"
        ? "h-5 w-5 stroke-[2.2]"
        : "h-4.5 w-4.5 sm:h-5 sm:w-5 stroke-[2.2]";

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={label || defaultAriaLabel}
      title={label || defaultAriaLabel}
      className={cn(
        "group relative inline-flex items-center justify-center shrink-0 cursor-pointer select-none",
        // Subtle dark emerald background / transparent with delicate border
        "border border-emerald-500/25 dark:border-emerald-500/30",
        "bg-emerald-50/70 dark:bg-[#0C1E14]/75 text-[#16A36A] dark:text-[#20C982]",
        // Smooth hover, focus and pressed animations without oversized shadows
        "transition-all duration-150 ease-out",
        "hover:border-[#16A36A]/60 dark:hover:border-[#20D6C2]/60 hover:bg-[#16A36A]/15 dark:hover:bg-[#16A36A]/25",
        "hover:text-[#16A36A] dark:hover:text-[#20C982]",
        "active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20D6C2] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg-app)]",
        sizeClasses,
        showLabel && "w-auto px-3 gap-2",
        className,
      )}
    >
      <ArrowLeft
        className={cn(
          "shrink-0 text-[#16A36A] dark:text-[#20C982] transition-transform duration-150 group-hover:-translate-x-0.5",
          iconSizes,
        )}
        aria-hidden="true"
      />
      {showLabel && (
        <span className="text-xs font-bold tracking-tight text-[var(--text)] group-hover:text-[#16A36A] dark:group-hover:text-[#20C982] transition-colors">
          {label || defaultTextLabel}
        </span>
      )}
    </button>
  );
}
