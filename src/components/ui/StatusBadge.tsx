import { CheckCircle2, Clock, AlarmClock, HelpCircle, BellRing } from "lucide-react";
import type { Dose } from "@/types";
import { cn } from "@/lib/utils";

/** Status is shown with an icon AND a text label – never colour alone. */
export function StatusBadge({ dose }: { dose: Pick<Dose, "status" | "isDue"> }) {
  const map = {
    taken: { label: "Taken", Icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-800 border-emerald-300" },
    pending: dose.isDue
      ? { label: "Due now", Icon: BellRing, cls: "bg-amber-50 text-amber-900 border-amber-400" }
      : { label: "Upcoming", Icon: Clock, cls: "bg-blue-50 text-blue-800 border-blue-300" },
    snoozed: { label: "Snoozed", Icon: AlarmClock, cls: "bg-violet-50 text-violet-800 border-violet-300" },
    not_confirmed: { label: "Not yet confirmed", Icon: HelpCircle, cls: "bg-slate-100 text-slate-800 border-slate-400" },
  } as const;
  const { label, Icon, cls } = map[dose.status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold", cls)}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </span>
  );
}
