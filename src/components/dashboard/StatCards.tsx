import { CheckCircle2, Clock, Pill } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function StatCards({
  total,
  taken,
  pending,
}: {
  total: number;
  taken: number;
  pending: number;
}) {
  const items = [
    {
      label: "Scheduled Today",
      value: total,
      Icon: Pill,
      color: "text-[#16A36A] dark:text-[#20C982]",
      bg: "bg-[#16A36A]/10 border-[#16A36A]/20",
    },
    {
      label: "Doses Taken",
      value: taken,
      Icon: CheckCircle2,
      color: "text-emerald-500 dark:text-[#36D399]",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Pending Doses",
      value: pending,
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
          className="relative overflow-hidden p-5 transition-all duration-200 hover:scale-[1.01]"
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
