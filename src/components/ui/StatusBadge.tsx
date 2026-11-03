import { AlarmClock, BellRing, CheckCircle2, Clock, HelpCircle } from "lucide-react";
import type { Dose } from "@/types";
import { cn } from "@/lib/utils";

/** Icon + words + subtle status dot, never colour alone. */
export function StatusBadge({ dose }: { dose: Pick<Dose, "status" | "isDue"> }) {
  const map = {
    taken: {
      label: "Taken",
      Icon: CheckCircle2,
      cls: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25",
    },
    pending: dose.isDue
      ? {
          label: "Due now",
          Icon: BellRing,
          cls: "bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse",
        }
      : {
          label: "Upcoming",
          Icon: Clock,
          cls: "bg-slate-500/10 text-slate-300 dark:text-slate-300 border border-slate-500/20",
        },
    snoozed: {
      label: "Snoozed",
      Icon: AlarmClock,
      cls: "bg-purple-500/15 text-purple-300 border border-purple-500/30",
    },
    not_confirmed: {
      label: "Not confirmed",
      Icon: HelpCircle,
      cls: "bg-rose-500/15 text-rose-400 border border-rose-500/30",
    },
  } as const;

  const { label, Icon, cls } = map[dose.status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        cls,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}