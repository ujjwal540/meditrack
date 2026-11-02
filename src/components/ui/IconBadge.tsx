import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function IconBadge({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <span className={cn("icon-badge", className)} aria-label={label}>
      {children}
    </span>
  );
}
