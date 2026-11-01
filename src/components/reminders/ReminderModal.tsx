"use client";

import { AlarmClock, BellRing, CheckCircle2, HelpCircle } from "lucide-react";
import type { Dose, DoseStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import { formatTime } from "@/utils/date-utils";

export function ReminderModal({
  dose,
  remaining,
  snoozeMinutes,
  onRespond,
}: {
  dose?: Dose;
  remaining: number;
  snoozeMinutes: number;
  onRespond: (key: string, status: DoseStatus, snoozeMinutes?: number) => void;
}) {
  if (!dose) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-4 sm:items-center">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="reminder-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-3 flex items-center gap-2 text-primary">
          <BellRing className="h-6 w-6" aria-hidden="true" />
          <span className="font-semibold">Medicine reminder · {formatTime(dose.time)}</span>
        </div>
        <h2 id="reminder-title" className="text-3xl font-bold text-slate-900">
          {dose.medicineName}
        </h2>
        <p className="mt-1 text-xl text-slate-700">{dose.dosage}</p>
        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-lg text-slate-800">
          {dose.instructions || "Follow the prescribed instructions."}
        </p>
        <div className="mt-5 grid gap-3">
          <Button onClick={() => onRespond(dose.key, "taken")} className="min-h-14 text-lg">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" /> Taken
          </Button>
          <Button
            variant="outline"
            onClick={() => onRespond(dose.key, "snoozed", snoozeMinutes)}
            className="min-h-14 text-lg"
          >
            <AlarmClock className="h-6 w-6" aria-hidden="true" /> Snooze {snoozeMinutes} min
          </Button>
          <Button
            variant="outline"
            onClick={() => onRespond(dose.key, "not_confirmed")}
            className="min-h-14 text-lg"
          >
            <HelpCircle className="h-6 w-6" aria-hidden="true" /> Not yet taken
          </Button>
        </div>
        {remaining > 1 && (
          <p className="mt-3 text-center text-sm text-slate-600">{remaining - 1} more reminder(s) waiting</p>
        )}
        <p className="mt-3 text-center text-xs text-slate-500">
          Unsure about a missed dose? Check your prescription or ask your doctor or pharmacist.
        </p>
      </div>
    </div>
  );
}
