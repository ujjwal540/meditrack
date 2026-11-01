"use client";

import { Check } from "lucide-react";
import type { Dose, DoseStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatTime, periodOf } from "@/utils/date-utils";

const PERIODS = ["Morning", "Afternoon", "Evening"] as const;

export function DoseList({
  doses,
  onRespond,
}: {
  doses: Dose[];
  onRespond?: (key: string, status: DoseStatus) => void;
}) {
  if (doses.length === 0) {
    return (
      <Card className="text-center text-lg text-slate-600">
        No medicines scheduled for today. Add one from the Medicines page.
      </Card>
    );
  }
  return (
    <div className="space-y-6">
      {PERIODS.map((period) => {
        const items = doses.filter((d) => periodOf(d.time) === period);
        if (items.length === 0) return null;
        return (
          <section key={period} aria-label={period}>
            <h3 className="mb-2 text-lg font-semibold text-slate-700">{period}</h3>
            <ul className="space-y-3">
              {items.map((d) => (
                <li key={d.key}>
                  <Card className="flex flex-wrap items-center gap-4">
                    <div className="w-24 text-xl font-bold text-slate-900">{formatTime(d.time)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xl font-semibold text-slate-900">{d.medicineName}</p>
                      <p className="text-slate-600">
                        {d.dosage}
                        {d.instructions ? ` · ${d.instructions}` : ""}
                      </p>
                    </div>
                    <StatusBadge dose={d} />
                    {onRespond && d.status !== "taken" && (
                      <Button onClick={() => onRespond(d.key, "taken")}>
                        <Check className="h-5 w-5" aria-hidden="true" /> Mark taken
                      </Button>
                    )}
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      <p className="text-sm text-slate-500">Illustrative schedule, not a medical prescription.</p>
    </div>
  );
}
