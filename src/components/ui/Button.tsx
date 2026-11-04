import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "soft" | "outline" | "accent" | "danger";

const styles: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-[#16A36A] to-[#20C982] text-white font-bold shadow-[0_4px_18px_rgba(22,163,106,0.35)] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(32,214,194,0.45)] hover:border-[#20D6C2] hover:brightness-105 border border-[#20C982]/40 active:translate-y-0 active:scale-[0.98]",
  soft:
    "bg-[#16A36A]/12 text-[#16A36A] dark:text-[#A3EAC1] border border-[#16A36A]/25 hover:-translate-y-0.5 hover:bg-[#16A36A]/20 hover:border-[#20D6C2] hover:shadow-[0_0_16px_rgba(32,214,194,0.25)] active:translate-y-0 active:scale-[0.98]",
  outline:
    "border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:-translate-y-0.5 hover:border-[#20D6C2] hover:bg-[var(--surface-hover)] hover:text-[#16A36A] dark:hover:text-[#20D6C2] hover:shadow-[0_6px_20px_-4px_rgba(0,0,0,0.5),0_0_14px_rgba(32,214,194,0.22)] backdrop-blur-sm shadow-sm active:translate-y-0 active:scale-[0.98]",
  accent:
    "bg-[#FBBF24] text-[#07130E] font-bold shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(251,191,36,0.5)] hover:brightness-105 border border-amber-300/40 active:translate-y-0 active:scale-[0.98]",
  danger:
    "border border-rose-500/30 bg-rose-500/10 text-rose-500 dark:text-[#FB7185] hover:-translate-y-0.5 hover:bg-rose-500/20 hover:border-rose-500/60 hover:shadow-[0_0_16px_rgba(244,63,94,0.25)] active:translate-y-0 active:scale-[0.98]",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md" | "xl";
}) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2.5 rounded-xl font-semibold tracking-wide transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20D6C2] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-app)]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none",
        size === "sm" && "min-h-10 px-4 text-sm",
        size === "md" && "min-h-12 px-5 text-base",
        size === "xl" && "min-h-14 w-full px-6 text-lg font-bold",
        styles[variant],
        className,
      )}
    />
  );
}