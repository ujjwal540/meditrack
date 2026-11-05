"use client";

import { useState } from "react";
import { BellRing, Check, Clock3 } from "lucide-react";
import type { Dose } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PillIcon } from "@/components/ui/PillIcon";
import { useTranslation } from "@/i18n/LanguageContext";

export function NextMedicineCard({
  dose,
  snoozeMinutes,
  onTaken,
  onLater,
}: {
  dose?: Dose;
  snoozeMinutes: number;
  onTaken: (key: string) => void;
  onLater: (key: string) => void;
}) {
  const [done, setDone] = useState(false);
  const { t, isNepali, formatTimeDisplay, formatNumber } = useTranslation();

  if (!dose) {
    return (
      <Card className="border border-[#16A36A]/25 bg-gradient-to-br from-[#16A36A]/10 via-[#20C982]/5 to-transparent text-center p-8">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#16A36A]/20 text-[#16A36A] dark:text-[#A3EAC1]">
          <Check className="h-7 w-7" aria-hidden="true" />
        </div>
        <h3 className="mt-4 font-display text-2xl font-bold text-[var(--text)]">
          {isNepali ? "अहिलेका लागि सबै खाइसकियो" : "All caught up for now"}
        </h3>
        <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
          {isNepali
            ? "अहिले कुनै औषधि खान बाँकी छैन। समयमै औषधि खानुभएकोमा धेरै राम्रो!"
            : "No pending medicines right now. Great job keeping your health on track!"}
        </p>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border border-[#16A36A]/30 bg-gradient-to-br from-[var(--surface)] via-[var(--bg-secondary)] to-[var(--surface-elevated)] p-6 sm:p-7 shadow-[var(--shadow-card)]">
      {/* Subtle Ambient Radial Highlight */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#16A36A]/15 blur-3xl" />

      {done && (
        <div
          className="absolute inset-0 z-20 grid place-items-center bg-[var(--bg-app)]/95 backdrop-blur-md text-[var(--text)]"
          role="status"
        >
          <div className="animate-pop text-center">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-r from-[#16A36A] to-[#20C982] text-white shadow-[0_0_30px_rgba(32,201,130,0.5)]">
              <Check className="h-10 w-10 stroke-[2.5]" aria-hidden="true" />
            </span>
            <p className="mt-4 font-display text-2xl font-bold text-[var(--text)]">
              {isNepali ? "औषधि खाइसकियो" : "Dose Confirmed"}
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              {isNepali ? "औषधि खाएको विवरण सुरक्षित गरियो।" : "Your medication record has been logged."}
            </p>
          </div>
        </div>
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 text-xs font-semibold tracking-wider uppercase text-[var(--text-secondary)]">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-[#16A36A]/15 text-[#16A36A] dark:text-[#A3EAC1]">
            <BellRing className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span>{t.dashboard.priorityDose}</span>
        </div>
        {dose.isDue && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-500 dark:text-[#FBBF24] border border-amber-500/30 animate-pulse">
            {t.schedule.dueNow}
          </span>
        )}
      </div>

      {/* Dose Main Info */}
      <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          <div className="grid h-16 w-16 sm:h-20 sm:w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-tr from-[#16A36A]/20 to-[#20C982]/10 border border-[#16A36A]/30 shadow-inner">
            <PillIcon type={dose.type} size={44} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--text)] break-words leading-tight">
                {dose.medicineName}
              </h2>
              <span className="font-mono text-xs sm:text-sm font-bold text-[#16A36A] dark:text-[#A3EAC1] bg-[#16A36A]/15 px-2.5 py-0.5 rounded-lg border border-[#16A36A]/30 shrink-0">
                {dose.dosage}
              </span>
            </div>
            {dose.instructions && (
              <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)] break-words leading-relaxed font-medium">
                {dose.instructions}
              </p>
            )}
          </div>
        </div>

        {/* Scheduled Time Badge */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)]/60 px-4 py-2.5 sm:px-5 sm:py-3 text-left sm:text-right shrink-0">
          <span className="block text-[10px] sm:text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
            {t.dashboard.scheduledFor}
          </span>
          <span className="font-mono text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#16A36A] dark:text-[#A3EAC1] tabular-nums">
            {formatTimeDisplay(dose.time)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          size="md"
          variant="primary"
          onClick={() => {
            onTaken(dose.key);
            setDone(true);
            setTimeout(() => setDone(false), 2200);
          }}
          className="flex-1 sm:flex-initial"
        >
          <Check className="h-4 w-4 stroke-[2.5]" aria-hidden="true" />
          <span>{t.dashboard.markTakenBtn}</span>
        </Button>

        <Button
          size="md"
          variant="outline"
          onClick={() => onLater(dose.key)}
          className="flex-1 sm:flex-initial"
        >
          <Clock3 className="h-4 w-4" aria-hidden="true" />
          <span>
            {isNepali
              ? `${formatNumber(snoozeMinutes)} मिनेट पछि`
              : `${t.dashboard.snoozeBtn}`}
          </span>
        </Button>
      </div>
    </Card>
  );
}
