"use client";

import { useEffect } from "react";
import { BellRing, Check, Clock3, HelpCircle } from "lucide-react";
import type { Dose, DoseStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import { PillIcon } from "@/components/ui/PillIcon";
import { useVoice } from "@/hooks/use-voice";
import { formatTime } from "@/utils/date-utils";
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
  const id = dose ? `${dose.key}|${dose.snoozedUntil ?? ""}` : "";
  const name = dose?.medicineName;

  /* chime + optional spoken reminder once per reminder */
  useEffect(() => {
    if (!id || !name) return;
    playChime();
    const spokenMessage = userName
      ? `${userName}, it is time for your scheduled medication: ${name}.`
      : `It is time to take your ${name}.`;
    speak(spokenMessage);
  }, [id, name, userName, speak]);

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
            <span>{userName ? `${userName}, it's time for your medication` : "Medication Due"}</span>
          </div>
          <span className="font-mono text-sm bg-[#16A36A]/15 border border-[#16A36A]/30 px-3 py-1 rounded-full text-[#16A36A] dark:text-[#A3EAC1]">
            {formatTime(dose.time)}
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
            Doctor Instructions
          </span>
          {dose.instructions || "Follow your standard prescribed regimen."}
        </div>

        <div className="mt-6 grid gap-2.5">
          <Button
            size="xl"
            variant="primary"
            onClick={() => {
              onRespond(dose.key, "taken");
              speak(
                userName
                  ? `Thank you, ${userName}. I have marked this dose as taken.`
                  : "Thank you. I have marked this dose as taken.",
              );
            }}
          >
            <Check className="h-6 w-6 stroke-[2.5]" aria-hidden="true" />
            <span>I took it</span>
          </Button>

          <div className="grid grid-cols-2 gap-2.5">
            <Button
              size="md"
              variant="outline"
              onClick={() => {
                onRespond(dose.key, "snoozed", snoozeMinutes);
                speak(`Reminding you again in ${snoozeMinutes} minutes.`);
              }}
            >
              <Clock3 className="h-5 w-5" aria-hidden="true" />
              <span>Snooze {snoozeMinutes}m</span>
            </Button>

            <Button
              size="md"
              variant="outline"
              onClick={() => {
                onRespond(dose.key, "not_confirmed");
                speak("I noted that you are not taking this dose right now.");
              }}
            >
              <HelpCircle className="h-5 w-5" aria-hidden="true" />
              <span>Skip / Not now</span>
            </Button>
          </div>
        </div>

        {remaining > 1 && (
          <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
            {remaining - 1} more {remaining - 1 === 1 ? "dose" : "doses"} scheduled for today
          </p>
        )}
      </div>
    </div>
  );
}