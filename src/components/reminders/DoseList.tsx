"use client";

import { Check, Moon, Sun, Sunrise, Sunset, type LucideIcon } from "lucide-react";
import type { Dose, DoseStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PillIcon } from "@/components/ui/PillIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import { formatTime } from "@/utils/date-utils";

type Period = {
  id: string;
  label: string;
  Icon: LucideIcon;
  colorClass: string;
};

const PERIODS: Period[] = [
  { id: "morning", label: "Morning", Icon: Sunrise, colorClass: "text-[#FBBF24]" },
  { id: "afternoon", label: "Afternoon", Icon: Sun, colorClass: "text-[#16A36A] dark:text-[#20C982]" },
  { id: "evening", label: "Evening", Icon: Sunset, colorClass: "text-[#60A5FA]" },
  { id: "night", label: "Bedtime", Icon: Moon, colorClass: "text-[#A78BFA]" },
];

function periodOf(time: string): string {
  const h = Number(time.split(":")[0]);
  return h < 12 ? "morning" : h < 17 ? "afternoon" : h < 21 ? "evening" : "night";
}

export function DoseList({
  doses,
  onRespond,
}: {
  doses: Dose[];
  onRespond?: (key: string, status: DoseStatus) => void;
}) {
  if (doses.length === 0) {
    return (
      <Card className="text-center p-8 border border-dashed border-[var(--border)]">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#16A36A]/10 text-[#16A36A] dark:text-[#20C982]">
          <PillIcon type="capsule" size={44} />
        </div>
        <h4 className="mt-4 font-display text-xl font-bold text-[var(--text)]">
          No medicines scheduled for today
        </h4>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Add your prescriptions under Medicines to generate your personalized timetable.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {PERIODS.map((p) => {
        const items = doses.filter((d) => periodOf(d.time) === p.id);
        if (items.length === 0) return null;

        return (
          <section key={p.id} aria-label={p.label}>
            <div className="mb-3 flex items-center gap-2">
              <span className={cn("grid h-6 w-6 place-items-center rounded-md bg-[var(--surface-elevated)]", p.colorClass)}>
                <p.Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <h3 className="font-display text-base font-bold tracking-tight text-[var(--text)]">
                {p.label}
              </h3>
              <span className="text-xs text-[var(--text-muted)] font-mono">({items.length})</span>
            </div>

            <ul className="space-y-2.5">
              {items.map((d) => (
                <li
                  key={d.key}
                  className="group relative flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 backdrop-blur-xl transition-all duration-200 hover:border-[#16A36A]/40 hover:bg-[var(--surface-elevated)] shadow-sm"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)]">
                      <PillIcon type={d.type} size={32} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-base font-bold text-[var(--text)] truncate">
                        {d.medicineName}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] truncate">
                        {d.dosage}
                        {d.instructions ? ` · ${d.instructions}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-sm font-bold tabular-nums text-[var(--text)] bg-[var(--surface-elevated)] px-3 py-1.5 rounded-lg border border-[var(--border)]">
                      {formatTime(d.time)}
                    </span>
                    <StatusBadge dose={d} />
                    {onRespond && d.status !== "taken" && (
                      <Button
                        size="sm"
                        variant="soft"
                        onClick={() => onRespond(d.key, "taken")}
                        className="py-1 px-3 text-xs"
                      >
                        <Check className="h-4 w-4" aria-hidden="true" /> Mark Taken
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}