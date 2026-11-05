"use client";

import { Check, Moon, Sun, Sunrise, Sunset, type LucideIcon } from "lucide-react";
import type { Dose, DoseStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PillIcon } from "@/components/ui/PillIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useTranslation } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

type Period = {
  id: string;
  Icon: LucideIcon;
  colorClass: string;
};

const PERIOD_DEFS: Period[] = [
  { id: "morning", Icon: Sunrise, colorClass: "text-[#FBBF24]" },
  { id: "afternoon", Icon: Sun, colorClass: "text-[#16A36A] dark:text-[#20C982]" },
  { id: "evening", Icon: Sunset, colorClass: "text-[#60A5FA]" },
  { id: "night", Icon: Moon, colorClass: "text-[#A78BFA]" },
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
  const { t, formatTimeDisplay, formatNumber } = useTranslation();

  const periodLabels: Record<string, string> = {
    morning: t.schedule.morningSection,
    afternoon: t.schedule.afternoonSection,
    evening: t.schedule.eveningSection,
    night: t.schedule.bedtimeSection,
  };

  if (doses.length === 0) {
    return (
      <Card className="text-center p-8 border border-dashed border-[var(--border)]">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#16A36A]/10 text-[#16A36A] dark:text-[#20C982]">
          <PillIcon type="capsule" size={44} />
        </div>
        <h4 className="mt-4 font-display text-xl font-bold text-[var(--text)]">
          {t.schedule.noMedicinesScheduled}
        </h4>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {t.schedule.noMedicinesHint}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {PERIOD_DEFS.map((p) => {
        const items = doses.filter((d) => periodOf(d.time) === p.id);
        if (items.length === 0) return null;
        const label = periodLabels[p.id] || p.id;

        return (
          <section key={p.id} aria-label={label}>
            <div className="mb-3 flex items-center gap-2">
              <span className={cn("grid h-6 w-6 place-items-center rounded-md bg-[var(--surface-elevated)]", p.colorClass)}>
                <p.Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <h3 className="font-display text-base font-bold tracking-tight text-[var(--text)]">
                {label}
              </h3>
              <span className="text-xs text-[var(--text-muted)] font-mono">({formatNumber(items.length)})</span>
            </div>

            <ul className="space-y-2.5">
              {items.map((d) => (
                <li
                  key={d.key}
                  className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 backdrop-blur-xl transition-all duration-200 hover:border-[#20D6C2] hover:bg-[var(--surface-hover)] shadow-sm"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] shadow-xs">
                      <PillIcon type={d.type} size={32} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-base font-bold text-[var(--text)] break-words leading-tight">
                          {d.medicineName}
                        </p>
                        <span className="font-mono text-xs font-semibold text-[#16A36A] dark:text-[#A3EAC1] bg-[#16A36A]/10 px-2 py-0.5 rounded-md border border-[#16A36A]/20 shrink-0">
                          {d.dosage}
                        </span>
                      </div>
                      {d.instructions && (
                        <p className="mt-1 text-xs text-[var(--text-secondary)] break-words leading-relaxed">
                          {d.instructions}
                        </p>
                      )}
                      {d.reason && (
                        <p className="mt-1 text-[11px] font-medium text-amber-500 dark:text-amber-300">
                          {d.reason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)]">
                    <span className="font-mono text-xs sm:text-sm font-bold tabular-nums text-[var(--text)] bg-[var(--surface-elevated)] px-3 py-1.5 rounded-lg border border-[var(--border)]">
                      {formatTimeDisplay(d.time)}
                    </span>
                    <StatusBadge dose={d} />
                    {onRespond && d.status !== "taken" && (
                      <Button
                        size="sm"
                        variant="soft"
                        onClick={() => onRespond(d.key, "taken")}
                        className="py-1 px-3 text-xs font-semibold min-h-[34px]"
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden="true" /> {t.medicines.markTaken}
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