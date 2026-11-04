"use client";

import { AlarmClock, BellRing, CheckCircle2, Clock, HelpCircle } from "lucide-react";
import type { Dose } from "@/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageContext";

/** Icon + words + subtle status dot, never colour alone. Fully localized. */
export function StatusBadge({ dose }: { dose: Pick<Dose, "status" | "isDue"> }) {
  const { t } = useTranslation();

  const map = {
    taken: {
      label: t.schedule.takenStatus,
      Icon: CheckCircle2,
      cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25",
    },
    pending: dose.isDue
      ? {
          label: t.schedule.dueNow,
          Icon: BellRing,
          cls: "bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 animate-pulse",
        }
      : {
          label: t.schedule.pendingStatus,
          Icon: Clock,
          cls: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20",
        },
    snoozed: {
      label: t.schedule.snoozedStatus,
      Icon: AlarmClock,
      cls: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30",
    },
    not_confirmed: {
      label: t.schedule.notConfirmedStatus,
      Icon: HelpCircle,
      cls: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30",
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