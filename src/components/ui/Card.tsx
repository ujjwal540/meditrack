import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function Card({ className, interactive = false, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-2xl border border-[var(--border)]",
        "bg-[var(--surface)]/90 backdrop-blur-xl",
        "p-5 sm:p-6 shadow-[var(--shadow-card)]",
        "transition-all duration-250 ease-out",
        interactive
          ? "cursor-pointer hover:-translate-y-1 hover:border-[#20D6C2] hover:bg-[var(--surface-hover)] hover:shadow-[0_16px_36px_-10px_rgba(0,0,0,0.7),0_0_22px_-2px_rgba(32,214,194,0.28),0_0_0_1px_#20D6C2] active:translate-y-0"
          : "hover:border-[#20D6C2]/40 hover:shadow-[0_12px_28px_-10px_rgba(0,0,0,0.5),0_0_16px_-4px_rgba(32,214,194,0.18)]",
        className,
      )}
    />
  );
}