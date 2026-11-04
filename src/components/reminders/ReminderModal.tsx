"use client";

import { useEffect } from "react";
import { BellRing, Check, Clock3, HelpCircle } from "lucide-react";
import type { Dose, DoseStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import { PillIcon } from "@/components/ui/PillIcon";
import { useVoice } from "@/hooks/use-voice";
import { useTranslation } from "@/i18n/LanguageContext";
import { playChime } from "@/utils/sound";

export function ReminderModal({
  dose,
  remaining,
  snoozeMinutes,
  userName,
  onRespond,
}: {
  dose?: Dose;
  remaining: number;
  snoozeMinutes: number;
  userName?: string;
  onRespond: (key: string, status: DoseStatus, snoozeMinutes?: number) => void;
}) {
  const { speak } = useVoice();
  const { t, isNepali, formatTimeDisplay, formatNumber } = useTranslation();
  const id = dose ? `${dose.key}|${dose.snoozedUntil ?? ""}` : "";
  const name = dose?.medicineName;

  /* chime + optional spoken reminder once per reminder */
  useEffect(() => {
    if (!id || !name) return;
    playChime();
    const spokenMessage = isNepali
      ? userName
        ? `${userName} ज्यू, तपाईंको औषधि खाने बेला भयो: ${name}।`
        : `औषधि खाने बेला भयो: ${name}।`
      : userName
        ? `${userName}, it is time for your scheduled medication: ${name}.`
        : `It is time to take your ${name}.`;
    speak(spokenMessage);
  }, [id, name, userName, speak, isNepali]);

  if (!dose) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-4 backdrop-blur-xl sm:items-center">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="reminder-title"
        className="animate-rise w-full max-w-lg rounded-3xl border border-[#16A36A]/30 bg-[var(--surface)] p-6 sm:p-8 text-[var(--text)] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-72 rounded-full bg-[#16A36A]/20 blur-3xl" />

        <div className="flex items-center justify-between text-xs font-bold tracking-wider uppercase text-[#16A36A] dark:text-[#20C982]">
          <div className="flex items-center gap-2">
            <BellRing className="h-4 w-4 animate-bounce" aria-hidden="true" />
            <span>
              {userName
                ? `${userName} ${t.reminders.modalDueWithName}`
                : t.reminders.modalDueHeader}
            </span>
          </div>
          <span className="font-mono text-sm bg-[#16A36A]/15 border border-[#16A36A]/30 px-3 py-1 rounded-full text-[#16A36A] dark:text-[#A3EAC1]">
            {formatTimeDisplay(dose.time)}
          </span>
        </div>

        <div className="mt-5 flex items-center gap-4">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-[#16A36A]/15 border border-[#16A36A]/25">
            <PillIcon type={dose.type} size={54} />
          </div>
          <div>
            <h2
              id="reminder-title"
              className="font-display text-2xl sm:text-3xl font-extrabold leading-tight text-[var(--text)]"
            >
              {dose.medicineName}
            </h2>
            <p className="text-base text-[var(--text-secondary)]">{dose.dosage}</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 text-sm text-[var(--text)]">
          <span className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
            {t.reminders.doctorInstructions}
          </span>
          {dose.instructions || t.reminders.standardRegimen}
        </div>

        <div className="mt-6 grid gap-2.5">
          <Button
            size="xl"
            variant="primary"
            onClick={() => {
              onRespond(dose.key, "taken");
              const msg = isNepali
                ? userName
                  ? `धन्यवाद ${userName} ज्यू! तपाईंले औषधि खाएको रेकर्ड भयो।`
                  : "धन्यवाद! तपाईंले औषधि खाएको चिन्ह लगाइयो।"
                : userName
                  ? `Thank you, ${userName}. I have marked this dose as taken.`
                  : "Thank you. I have marked this dose as taken.";
              speak(msg);
            }}
          >
            <Check className="h-6 w-6 stroke-[2.5]" aria-hidden="true" />
            <span>{t.reminders.iTookIt}</span>
          </Button>

          <div className="grid grid-cols-2 gap-2.5">
            <Button
              size="md"
              variant="outline"
              onClick={() => {
                onRespond(dose.key, "snoozed", snoozeMinutes);
                const msg = isNepali
                  ? `हुन्छ, म तपाईंलाई ${formatNumber(snoozeMinutes)} मिनेट पछि फेरि सम्झाउनेछु।`
                  : `Reminding you again in ${snoozeMinutes} minutes.`;
                speak(msg);
              }}
            >
              <Clock3 className="h-5 w-5" aria-hidden="true" />
              <span>
                {isNepali
                  ? `${formatNumber(snoozeMinutes)} मिनेट पछि`
                  : `Snooze ${snoozeMinutes}m`}
              </span>
            </Button>

            <Button
              size="md"
              variant="outline"
              onClick={() => {
                onRespond(dose.key, "not_confirmed");
                const msg = isNepali
                  ? "हुन्छ, तपाईंले अहिले यो औषधि नखाने जानकारी टिपियो।"
                  : "I noted that you are not taking this dose right now.";
                speak(msg);
              }}
            >
              <HelpCircle className="h-5 w-5" aria-hidden="true" />
              <span>{t.reminders.skipOrNotNow}</span>
            </Button>
          </div>
        </div>

        {remaining > 1 && (
          <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
            {isNepali
              ? `आज अरू ${formatNumber(remaining - 1)} खुराक औषधि खान बाँकी छ`
              : `${remaining - 1} more ${remaining - 1 === 1 ? "dose" : "doses"} scheduled for today`}
          </p>
        )}
      </div>
    </div>
  );
}