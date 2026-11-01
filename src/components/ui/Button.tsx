import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "danger";

const styles: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-teal-700",
  secondary: "bg-secondary text-white hover:bg-blue-700",
  outline: "border-2 border-slate-300 bg-white text-slate-800 hover:bg-slate-100",
  danger: "border-2 border-red-300 bg-white text-red-700 hover:bg-red-50",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-base font-semibold",
        "transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-secondary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        styles[variant],
        className,
      )}
    />
  );
}
