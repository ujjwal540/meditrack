"use client";

import { CheckCircle2, Clock, Pill } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useTranslation } from "@/i18n/LanguageContext";

export function StatCards({
  total,
  taken,
  pending,
}: {
  total: number;
  taken: number;
  pending: number;
}) {
  const { t, formatNumber } = useTranslation();

  const items = [
    {
      label: t.dashboard.totalScheduled,
      value: formatNumber(total),
      Icon: Pill,
      color: "text-[#16A36A] dark:text-[#20C982]",
      bg: "bg-[#16A36A]/10 border-[#16A36A]/20",
    },
    {
      label: t.dashboard.dosesTaken,
      value: formatNumber(taken),
      Icon: CheckCircle2,
      color: "text-emerald-500 dark:text-[#36D399]",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: t.dashboard.dosesPending,
      value: formatNumber(pending),
      Icon: Clock,
      color: "text-amber-500 dark:text-[#FBBF24]",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map(({ label, value, Icon, color, bg }) => (
        <Card
          key={label}
          interactive={true}
          className="relative overflow-hidden p-5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              {label}
            </span>
            <div className={`grid h-8 w-8 place-items-center rounded-lg border ${bg} ${color}`}>
              <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <p className="mt-3 font-mono text-3xl font-extrabold tracking-tight tabular-nums text-[var(--text)]">
            {value}
          </p>
        </Card>
      ))}
    </div>
  );
}
