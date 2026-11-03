import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-2xl border border-[var(--border)]",
        "bg-[var(--surface)]/90 backdrop-blur-xl",
        "p-5 sm:p-6 shadow-[var(--shadow-card)]",
        "transition-all duration-300 hover:border-[#16A36A]/40",
        className,
      )}
    />
  );
}