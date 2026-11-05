"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  BellRing,
  Check,
  ChevronDown,
  Clock3,
  HelpCircle,
  Volume2,
  X,
} from "lucide-react";
import type { Dose, DoseStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import { PillIcon } from "@/components/ui/PillIcon";
import { buildMedicineVoicePrompt, useVoice } from "@/hooks/use-voice";
import { useTranslation } from "@/i18n/LanguageContext";
import { playChime, startGentleAlarmLoop, stopAlarmLoop } from "@/utils/sound";

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
  onRespond: (
    key: string,
    status: DoseStatus,
    snoozeMinutes?: number,
    reason?: string,
  ) => void;
}) {
  const { speak, stop: stopVoice } = useVoice();
  const { t, isNepali, formatTimeDisplay, formatNumber } = useTranslation();
  const [showSkipReasons, setShowSkipReasons] = useState(false);
  const [selectedSnooze, setSelectedSnooze] = useState(snoozeMinutes || 10);
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);

  const id = dose ? `${dose.key}|${dose.snoozedUntil ?? ""}` : "";
  const name = dose?.medicineName;

  const playAnnouncement = useCallback(() => {
    void playChime();
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([300, 150, 300]);
      } catch {}
    }
    if (name) {
      const spokenMessage = buildMedicineVoicePrompt({
        medicineName: name,
        dosage: dose?.dosage,
        userName,
        isNepali,
      });
      speak(spokenMessage);
    }
  }, [dose?.dosage, isNepali, name, speak, userName]);

  // Gentle repeating alarm loop + initial announcement
  useEffect(() => {
    if (!id || !name) return;

    // Initial chime, vibration, and voice announcement
    playAnnouncement();

    // Start gentle recurring chime loop every 35s until user responds
    const cleanupAlarm = startGentleAlarmLoop(35, 0.35, 8);

    return () => {
      cleanupAlarm();
      stopVoice();
    };
  }, [id, name, playAnnouncement, stopVoice]);

  if (!dose) return null;

  const handleTaken = () => {
    stopAlarmLoop();
    stopVoice();
    onRespond(dose.key, "taken");
    const msg = isNepali
      ? userName
        ? `धन्यवाद ${userName} ज्यू! तपाईंले औषधि खाएको रेकर्ड भयो।`
        : "धन्यवाद! तपाईंले औषधि खाएको चिन्ह लगाइयो।"
      : userName
        ? `Thank you, ${userName}. I have marked this dose as taken.`
        : "Thank you. I have marked this dose as taken.";
    speak(msg);
  };

  const handleSnooze = (mins: number) => {
    stopAlarmLoop();
    stopVoice();
    onRespond(dose.key, "snoozed", mins);
    const msg = isNepali
      ? `हुन्छ, म तपाईंलाई ${formatNumber(mins)} मिनेट पछि फेरि सम्झाउनेछु।`
      : `Reminding you again in ${mins} minutes.`;
    speak(msg);
  };

  const handleSkip = (reason?: string) => {
    stopAlarmLoop();
    stopVoice();
    setShowSkipReasons(false);
    onRespond(dose.key, "skipped", undefined, reason);
    const msg = isNepali
      ? "हुन्छ, तपाईंले अहिले यो औषधि नखाने जानकारी टिपियो।"
      : "I noted that you are skipping this dose right now.";
    speak(msg);
  };

  const skipReasons = [
    {
      id: "fasting",
      en: "Fasting / Empty stomach required",
      ne: "खाली पेट बस्नुपर्ने (उपवास वा परीक्षण)",
    },
    {
      id: "nausea",
      en: "Feeling unwell or nauseous",
      ne: "वाकवाकी वा शरीर असहज भएको",
    },
    {
      id: "doctor_advised",
      en: "Doctor advised to pause",
      ne: "डाक्टरको सल्लाहमा रोकिएको",
    },
    {
      id: "out_of_meds",
      en: "Out of medicine / Refill needed",
      ne: "औषधि सकिएको / पुन: किन्न बाँकी",
    },
    {
      id: "other",
      en: "Other personal reason",
      ne: "अन्य व्यक्तिगत कारण",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-xl sm:items-center">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="reminder-title"
        className="animate-rise w-full max-w-lg rounded-3xl border-2 border-[#16A36A]/40 bg-[var(--surface)] p-6 sm:p-8 text-[var(--text)] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] relative overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-72 rounded-full bg-[#16A36A]/25 blur-3xl" />

        {/* Header Bar */}
        <div className="flex items-center justify-between text-xs font-bold tracking-wider uppercase text-[#16A36A] dark:text-[#20C982]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A36A] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#16A36A]" />
            </span>
            <BellRing className="h-4 w-4 animate-bounce" aria-hidden="true" />
            <span className="truncate max-w-[200px] sm:max-w-none">
              {userName
                ? `${userName} ${t.reminders.modalDueWithName}`
                : t.reminders.modalDueHeader}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={playAnnouncement}
              title={isNepali ? "आवाज र घण्टी पुन: सुन्नुहोस्" : "Replay reminder chime & voice"}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] hover:border-[#16A36A] hover:text-[#16A36A] dark:hover:text-[#20C982] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16A36A]"
            >
              <Volume2 className="h-4 w-4 text-[#16A36A]" aria-hidden="true" />
              <span>{isNepali ? "पुन: सुन्नुहोस्" : "Listen"}</span>
            </button>
            <span className="font-mono text-sm font-bold bg-[#16A36A]/15 border border-[#16A36A]/30 px-3 py-1.5 rounded-full text-[#16A36A] dark:text-[#A3EAC1]">
              {formatTimeDisplay(dose.time)}
            </span>
          </div>
        </div>

        {/* Medicine Details */}
        <div className="mt-5 flex items-center gap-4">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-[#16A36A]/15 border border-[#16A36A]/30 shadow-inner">
            <PillIcon type={dose.type} size={54} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="inline-block rounded-md bg-[#16A36A]/10 border border-[#16A36A]/25 px-2 py-0.5 text-[10px] font-bold text-[#16A36A] dark:text-[#A3EAC1] uppercase tracking-wider mb-1">
              {isNepali ? "औषधि खाने बेला" : "Scheduled Dose"}
            </div>
            <h2
              id="reminder-title"
              className="font-display text-2xl sm:text-3xl font-extrabold leading-tight text-[var(--text)] truncate"
            >
              {dose.medicineName}
            </h2>
            <p className="text-base font-semibold text-[var(--text-secondary)]">{dose.dosage}</p>
          </div>
        </div>

        {/* Doctor Instructions */}
        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 text-xs sm:text-sm text-[var(--text)]">
          <span className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
            {t.reminders.doctorInstructions}
          </span>
          <p className="font-medium leading-relaxed">
            {dose.instructions || t.reminders.standardRegimen}
          </p>
        </div>

        {/* Primary Action Buttons */}
        {!showSkipReasons ? (
          <div className="mt-6 grid gap-2.5">
            <Button
              size="xl"
              variant="primary"
              onClick={handleTaken}
              className="w-full text-base sm:text-lg font-extrabold shadow-lg shadow-[#16A36A]/25 min-h-[52px]"
            >
              <Check className="h-6 w-6 stroke-[3]" aria-hidden="true" />
              <span>{t.reminders.iTookIt}</span>
            </Button>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Snooze Dropdown / Action */}
              <div className="relative">
                <Button
                  size="md"
                  variant="outline"
                  onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
                  className="w-full min-h-[46px] justify-between text-xs sm:text-sm font-bold"
                >
                  <span className="inline-flex items-center gap-1.5 truncate">
                    <Clock3 className="h-4 w-4 shrink-0 text-[#16A36A]" aria-hidden="true" />
                    <span>
                      {isNepali
                        ? `${formatNumber(selectedSnooze)} मिनेट पछि`
                        : `Snooze ${selectedSnooze}m`}
                    </span>
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
                </Button>

                {showSnoozeOptions && (
                  <div className="absolute bottom-full mb-1 left-0 right-0 z-20 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-1.5 shadow-xl">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase text-[var(--text-muted)]">
                      {isNepali ? "अवधि छान्नुहोस्" : "Select Snooze Duration"}
                    </div>
                    {[5, 10, 15, 30].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => {
                          setSelectedSnooze(mins);
                          setShowSnoozeOptions(false);
                          handleSnooze(mins);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                          selectedSnooze === mins
                            ? "bg-[#16A36A]/15 text-[#16A36A] dark:text-[#A3EAC1]"
                            : "text-[var(--text)] hover:bg-[var(--surface)]"
                        }`}
                      >
                        <span>
                          {formatNumber(mins)} {t.common.minutes}
                        </span>
                        {selectedSnooze === mins && <Check className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Skip / Reason Prompt */}
              <Button
                size="md"
                variant="outline"
                onClick={() => setShowSkipReasons(true)}
                className="w-full min-h-[46px] text-xs sm:text-sm font-semibold"
              >
                <HelpCircle className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
                <span>{t.reminders.skipOrNotNow}</span>
              </Button>
            </div>
          </div>
        ) : (
          /* Skip Reason Selection View */
          <div className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-300">
                <AlertCircle className="h-4 w-4" />
                <span>{isNepali ? "औषधि नखानुको कारण (ऐच्छिक):" : "Reason for Skipping (Optional):"}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSkipReasons(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text)] p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              {skipReasons.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSkip(isNepali ? r.ne : r.en)}
                  className="w-full text-left px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] hover:border-[#16A36A] text-xs font-medium text-[var(--text)] transition-colors flex items-center justify-between"
                >
                  <span>{isNepali ? r.ne : r.en}</span>
                  <Check className="h-3 w-3 opacity-0 hover:opacity-100" />
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setShowSkipReasons(false)}
                className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text)] px-2 py-1"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={() => handleSkip(undefined)}
                className="text-xs font-bold text-rose-500 hover:underline px-2 py-1"
              >
                {isNepali ? "कुनै कारण बिना छाड्नुहोस्" : "Skip without reason"}
              </button>
            </div>
          </div>
        )}

        {/* Remaining Doses Indicator */}
        {remaining > 1 && (
          <p className="mt-4 text-center text-xs text-[var(--text-muted)] font-medium">
            {isNepali
              ? `आज अरू ${formatNumber(remaining - 1)} खुराक औषधि खान बाँकी छ`
              : `${remaining - 1} more ${remaining - 1 === 1 ? "dose" : "doses"} scheduled for today`}
          </p>
        )}
      </div>
    </div>
  );
}