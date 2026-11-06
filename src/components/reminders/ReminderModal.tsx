"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  BellRing,
  Check,
  ChevronDown,
  Clock3,
  HelpCircle,
  Volume2,
  Vibrate,
  X,
} from "lucide-react";
import type { AppSettings, Dose, DoseStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import { PillIcon } from "@/components/ui/PillIcon";
import { buildMedicineVoicePrompt, useVoice, warmUpSpeech } from "@/hooks/use-voice";
import { useTranslation } from "@/i18n/LanguageContext";
import { playChime, startGentleAlarmLoop, stopAlarmLoop } from "@/utils/sound";

export function ReminderModal({
  dose,
  remaining,
  snoozeMinutes,
  userName,
  settings,
  onRespond,
}: {
  dose?: Dose;
  remaining: number;
  snoozeMinutes: number;
  userName?: string;
  settings?: AppSettings;
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
  const [showSnoozeTray, setShowSnoozeTray] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const id = dose ? `${dose.key}|${dose.snoozedUntil ?? ""}` : "";
  const name = dose?.medicineName;
  const pref = settings?.notificationPreference || "voice";
  const speechTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Manual replay announcement function (for the Listen button)
  const replayAnnouncement = useCallback(() => {
    warmUpSpeech();
    void playChime(settings?.soundVolume ?? 0.35);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([250, 100, 250]);
      } catch {}
    }
    if (name) {
      const spokenMessage = buildMedicineVoicePrompt({
        medicineName: name,
        dosage: dose?.dosage,
        instructions: dose?.instructions,
        userName,
        isNepali,
      });
      setIsSpeaking(true);
      speak(spokenMessage, true);
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
      speechTimerRef.current = setTimeout(() => setIsSpeaking(false), 7000);
    }
  }, [dose?.dosage, dose?.instructions, isNepali, name, settings?.soundVolume, speak, userName]);

  // Main automatic notification trigger respecting Dashboard Preference
  useEffect(() => {
    if (!id || !name) return;

    let cleanupAlarm: (() => void) | undefined;

    // A. VOICE MODE: Automatically speak the reminder immediately
    if (pref === "voice") {
      warmUpSpeech();
      void playChime(Math.min(0.25, settings?.soundVolume ?? 0.35));
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate([150, 80, 150]);
        } catch {}
      }
      const spokenMessage = buildMedicineVoicePrompt({
        medicineName: name,
        dosage: dose?.dosage,
        instructions: dose?.instructions,
        userName,
        isNepali,
      });
      setIsSpeaking(true);
      speak(spokenMessage, true); // force=true ensures automatic voice playback
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
      speechTimerRef.current = setTimeout(() => setIsSpeaking(false), 7500);
    }

    // B. RINGTONE MODE: Automatically play gentle repeating chime alarm
    else if (pref === "ringtone") {
      cleanupAlarm = startGentleAlarmLoop(
        settings?.repeatReminderInterval || 35,
        settings?.soundVolume ?? 0.35,
        8,
      );
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate([200, 100, 200]);
        } catch {}
      }
    }

    // C. VIBRATION MODE: Discreet haptic vibration without automatic sound or speech
    else if (pref === "vibration") {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate([300, 150, 300, 150, 300]);
        } catch {}
      }
    }

    return () => {
      if (cleanupAlarm) cleanupAlarm();
      stopAlarmLoop();
      stopVoice();
      setIsSpeaking(false);
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
    };
  }, [id, name, pref, dose?.dosage, dose?.instructions, isNepali, settings?.repeatReminderInterval, settings?.soundVolume, speak, stopVoice, userName]);

  if (!dose) return null;

  const handleTaken = () => {
    stopAlarmLoop();
    stopVoice();
    setIsSpeaking(false);
    onRespond(dose.key, "taken");
    const msg = isNepali
      ? userName
        ? `धन्यवाद ${userName} ज्यू! तपाईंले औषधि खाएको रेकर्ड भयो।`
        : "धन्यवाद! तपाईंले औषधि खाएको चिन्ह लगाइयो।"
      : userName
        ? `Thank you, ${userName}. Marked as taken.`
        : "Thank you. Marked as taken.";
    if (pref === "voice") {
      speak(msg, true);
    }
  };

  const handleSnooze = (mins: number) => {
    stopAlarmLoop();
    stopVoice();
    setIsSpeaking(false);
    setShowSnoozeTray(false);
    onRespond(dose.key, "snoozed", mins);
    const msg = isNepali
      ? `हुन्छ, म तपाईंलाई ${formatNumber(mins)} मिनेट पछि फेरि सम्झाउनेछु।`
      : `Reminding you again in ${mins} minutes.`;
    if (pref === "voice") {
      speak(msg, true);
    }
  };

  const handleSkip = (reason?: string) => {
    stopAlarmLoop();
    stopVoice();
    setIsSpeaking(false);
    setShowSkipReasons(false);
    onRespond(dose.key, "skipped", undefined, reason);
    const msg = isNepali
      ? "हुन्छ, तपाईंले अहिले यो औषधि नखाने जानकारी टिपियो।"
      : "Noted. You skipped this dose.";
    if (pref === "voice") {
      speak(msg, true);
    }
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 p-2 xs:p-3 sm:p-4 backdrop-blur-xl">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="reminder-title"
        className="animate-rise w-full max-w-lg rounded-3xl border-2 border-[#16A36A]/50 bg-[var(--surface)] p-4 xs:p-5 sm:p-7 text-[var(--text)] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative overflow-visible max-h-[92vh] overflow-y-auto"
      >
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-72 rounded-full bg-[#16A36A]/20 blur-3xl" />

        {/* Header Bar: Fully responsive, zero horizontal overflow */}
        <div className="space-y-2">
          {/* Row 1: Reminder Indicator + Scheduled Time Badge */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A36A] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#16A36A]" />
              </span>
              <BellRing className="h-4 w-4 text-[#16A36A] dark:text-[#20C982] shrink-0 animate-bounce" aria-hidden="true" />
              <span className="font-display text-xs xs:text-sm font-bold uppercase tracking-wider text-[#16A36A] dark:text-[#20C982] truncate">
                {userName
                  ? `${userName} ${t.reminders.modalDueWithName}`
                  : t.reminders.modalDueHeader}
              </span>
            </div>

            <span className="font-mono text-xs sm:text-sm font-bold bg-[#16A36A]/15 border border-[#16A36A]/30 px-2.5 py-1 rounded-full text-[#16A36A] dark:text-[#A3EAC1] shrink-0 tabular-nums">
              {formatTimeDisplay(dose.time)}
            </span>
          </div>

          {/* Row 2: Active Notification Mode Badge + Replay/Listen Control */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[var(--border-subtle)] text-[11px]">
            {/* Mode Indicator Pill */}
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] px-2 py-0.5 text-[var(--text-secondary)] font-medium">
              {pref === "voice" ? (
                <>
                  <Volume2 className="h-3 w-3 text-[#16A36A] dark:text-[#20C982] shrink-0" />
                  <span>{isNepali ? "आवाज अनुस्मारक सक्रिय" : "Voice Reminder Active"}</span>
                  {isSpeaking && (
                    <span className="flex items-center gap-0.5 ml-1">
                      <span className="h-1.5 w-0.5 bg-[#20D6C2] animate-pulse" />
                      <span className="h-2.5 w-0.5 bg-[#20D6C2] animate-pulse [animation-delay:0.2s]" />
                      <span className="h-1.5 w-0.5 bg-[#20D6C2] animate-pulse [animation-delay:0.4s]" />
                    </span>
                  )}
                </>
              ) : pref === "ringtone" ? (
                <>
                  <BellRing className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span>{isNepali ? "घण्टी अनुस्मारक सक्रिय" : "Ringtone Alarm Active"}</span>
                </>
              ) : (
                <>
                  <Vibrate className="h-3 w-3 text-amber-500 shrink-0" />
                  <span>{isNepali ? "कम्पन अनुस्मारक सक्रिय" : "Vibration Alert Active"}</span>
                </>
              )}
            </div>

            {/* Optional Listen / Replay Audio Button */}
            <button
              type="button"
              onClick={replayAnnouncement}
              title={isNepali ? "आवाज र घण्टी पुन: सुन्नुहोस्" : "Replay reminder chime & voice"}
              className="inline-flex min-h-[30px] items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text)] hover:border-[#16A36A] hover:text-[#16A36A] dark:hover:text-[#20C982] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16A36A]"
            >
              <Volume2 className="h-3.5 w-3.5 text-[#16A36A] shrink-0" aria-hidden="true" />
              <span>{isNepali ? "पुन: सुन्नुहोस्" : "Listen Again"}</span>
            </button>
          </div>
        </div>

        {/* Medicine Details Card */}
        <div className="mt-4 flex items-center gap-3 xs:gap-3.5 sm:gap-4 p-3 rounded-2xl bg-[var(--surface-elevated)]/60 border border-[var(--border)]">
          <div className="grid h-14 w-14 xs:h-16 xs:w-16 sm:h-18 sm:w-18 shrink-0 place-items-center rounded-2xl bg-[#16A36A]/15 border border-[#16A36A]/30 shadow-inner">
            <PillIcon type={dose.type} size={42} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="inline-block rounded-md bg-[#16A36A]/10 border border-[#16A36A]/25 px-2 py-0.5 text-[10px] font-bold text-[#16A36A] dark:text-[#A3EAC1] uppercase tracking-wider mb-0.5">
              {isNepali ? "औषधि खाने बेला" : "Scheduled Dose"}
            </div>
            <h2
              id="reminder-title"
              className="font-display text-lg xs:text-xl sm:text-2xl font-extrabold leading-tight text-[var(--text)] break-words"
            >
              {dose.medicineName}
            </h2>
            <p className="text-xs xs:text-sm font-semibold text-[var(--text-secondary)] mt-0.5">
              {dose.dosage}
            </p>
          </div>
        </div>

        {/* Doctor Instructions Callout */}
        <div className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)]/40 p-3 sm:p-3.5 text-xs text-[var(--text)]">
          <span className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">
            {t.reminders.doctorInstructions}
          </span>
          <p className="font-medium leading-relaxed break-words text-xs sm:text-sm">
            {dose.instructions || t.reminders.standardRegimen}
          </p>
        </div>

        {/* Primary Action Buttons & Dedicated Inline Snooze Tray */}
        {!showSkipReasons ? (
          <div className="mt-5 space-y-2.5">
            {/* Primary 'I Took It' Confirmation Button */}
            <Button
              size="xl"
              variant="primary"
              onClick={handleTaken}
              className="w-full text-base sm:text-lg font-extrabold shadow-lg shadow-[#16A36A]/25 min-h-[48px] xs:min-h-[52px]"
            >
              <Check className="h-6 w-6 stroke-[3]" aria-hidden="true" />
              <span>{t.reminders.iTookIt}</span>
            </Button>

            {/* Inline Snooze Options Tray: Fully contained, never covers medication text */}
            {showSnoozeTray ? (
              <div className="rounded-2xl border border-[#16A36A]/30 bg-[var(--surface-elevated)] p-3 animate-fade-in shadow-lg">
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#16A36A] dark:text-[#A3EAC1]">
                    <Clock3 className="h-3.5 w-3.5" />
                    <span>{isNepali ? "कति समय पछि सम्झाउने? (Snooze)" : "Choose Snooze Duration"}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSnoozeTray(false)}
                    className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                    aria-label="Close snooze tray"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-1.5 xs:gap-2">
                  {[5, 10, 15, 30].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        setSelectedSnooze(mins);
                        handleSnooze(mins);
                      }}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center border active:scale-95 flex flex-col items-center justify-center gap-0.5 ${
                        selectedSnooze === mins
                          ? "border-[#16A36A] bg-[#16A36A]/20 text-[#16A36A] dark:text-[#A3EAC1] shadow-xs"
                          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[#16A36A]/50 hover:bg-[var(--surface-hover)]"
                      }`}
                    >
                      <span className="font-mono text-sm leading-none">{formatNumber(mins)}</span>
                      <span className="text-[10px] text-[var(--text-muted)] leading-none">{t.common.minutes}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Secondary Actions (Snooze trigger + Skip trigger) */
              <div className="grid grid-cols-2 gap-2 xs:gap-2.5">
                {/* Snooze Trigger Button */}
                <Button
                  size="md"
                  variant="outline"
                  onClick={() => setShowSnoozeTray(true)}
                  className="w-full min-h-[44px] justify-between text-xs font-bold px-2.5 xs:px-3"
                >
                  <span className="inline-flex items-center gap-1.5 truncate">
                    <Clock3 className="h-4 w-4 shrink-0 text-[#16A36A]" aria-hidden="true" />
                    <span>
                      {isNepali
                        ? `${formatNumber(selectedSnooze)} मिनेट सार्नुहोस्`
                        : `Snooze (${selectedSnooze}m)`}
                    </span>
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
                </Button>

                {/* Skip / Reason Prompt Trigger Button */}
                <Button
                  size="md"
                  variant="outline"
                  onClick={() => setShowSkipReasons(true)}
                  className="w-full min-h-[44px] text-xs font-semibold px-2.5 xs:px-3"
                >
                  <HelpCircle className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
                  <span className="truncate">{t.reminders.skipOrNotNow}</span>
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Skip Reason Selection View */
          <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 xs:p-4 animate-fade-in">
            <div className="flex items-center justify-between mb-2.5 pb-1.5 border-b border-amber-500/20">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-300">
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
                  <span className="break-words">{isNepali ? r.ne : r.en}</span>
                  <Check className="h-3.5 w-3.5 opacity-0 hover:opacity-100 shrink-0 ml-2" />
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
          <p className="mt-3.5 text-center text-xs text-[var(--text-muted)] font-medium">
            {isNepali
              ? `आज अरू ${formatNumber(remaining - 1)} खुराक औषधि खान बाँकी छ`
              : `${remaining - 1} more ${remaining - 1 === 1 ? "dose" : "doses"} scheduled for today`}
          </p>
        )}
      </div>
    </div>
  );
}