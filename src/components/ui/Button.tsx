import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "soft" | "outline" | "accent" | "danger";

const styles: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-[#16A36A] to-[#20C982] text-white font-bold shadow-[0_4px_18px_rgba(22,163,106,0.35)] hover:shadow-[0_6px_24px_rgba(32,201,130,0.5)] hover:brightness-105 border border-[#20C982]/40",
  soft:
    "bg-[#16A36A]/12 text-[#16A36A] dark:text-[#A3EAC1] border border-[#16A36A]/25 hover:bg-[#16A36A]/20 hover:border-[#16A36A]/40",
  outline:
    "border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[#16A36A]/40 hover:text-[#16A36A] dark:hover:text-[#20C982] backdrop-blur-sm shadow-sm",
  accent:
    "bg-[#FBBF24] text-[#07130E] font-bold shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:brightness-105 border border-amber-300/40",
  danger:
    "border border-rose-500/30 bg-rose-500/10 text-rose-500 dark:text-[#FB7185] hover:bg-rose-500/20 hover:border-rose-500/50",
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
        "inline-flex items-center justify-center gap-2.5 rounded-xl font-semibold tracking-wide transition-all duration-200",
        "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" && "min-h-10 px-4 text-sm",
        size === "md" && "min-h-12 px-5 text-base",
        size === "xl" && "min-h-14 w-full px-6 text-lg font-bold",
        styles[variant],
        className,
      )}
    />
  );
}