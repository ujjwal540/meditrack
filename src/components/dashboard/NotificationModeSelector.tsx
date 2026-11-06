"use client";

import { useState } from "react";
import {
  BellRing,
  Check,
  CheckCircle2,
  Sparkles,
  Vibrate,
  Volume2,
  Play,
} from "lucide-react";
import type { AppSettings, NotificationPreference } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/i18n/LanguageContext";
import { useVoice, warmUpSpeech, buildMedicineVoicePrompt } from "@/hooks/use-voice";
import { playChime, getUnlockedAudioContext } from "@/utils/sound";

export function NotificationModeSelector({
  settings,
  updateSettings,
  userName,
}: {
  settings: AppSettings;
  updateSettings: (s: AppSettings) => void;
  userName?: string;
}) {
  const { isNepali } = useTranslation();
  const { speak } = useVoice();
  const [testing, setTesting] = useState(false);
  const [testNotice, setTestNotice] = useState<string | null>(null);

  const currentMode = settings.notificationPreference || "voice";

  const handleSelectMode = async (mode: NotificationPreference) => {
    // Warm up audio context & speech synthesis on user interaction to bypass autoplay restrictions
    warmUpSpeech();
    void getUnlockedAudioContext();

    updateSettings({
      ...settings,
      notificationPreference: mode,
      // Keep individual flags synchronized
      voiceEnabled: mode === "voice",
      soundEnabled: mode === "ringtone",
      vibrationEnabled: mode === "vibration",
    });

    setTestNotice(
      isNepali
        ? `${mode === "voice" ? "आवाज" : mode === "ringtone" ? "घण्टी" : "कम्पन"} मोड सक्रिय गरियो।`
        : `Switched to ${mode.toUpperCase()} reminder mode.`,
    );
    setTimeout(() => setTestNotice(null), 3500);
  };

  const handleTestMode = async () => {
    setTesting(true);
    setTestNotice(null);

    // Ensure audio context is awake
    warmUpSpeech();
    void getUnlockedAudioContext();

    if (currentMode === "voice") {
      void playChime(0.2);
      const testMsg = buildMedicineVoicePrompt({
        medicineName: "Pentop",
        dosage: "40mg (Before Breakfast)",
        instructions: isNepali ? "बिहान खाली पेटमा एक चक्की" : "Take one tablet on empty stomach",
        userName: userName || (isNepali ? "उज्ज्वल" : "Ujjwal"),
        isNepali,
      });
      speak(testMsg, true);
      setTestNotice(
        isNepali
          ? "नमुना आवाज बजिरहेको छ: 'औषधि खाने समय भयो: Pentop 40mg'..."
          : "Playing test voice: 'Hello. It is time to take your scheduled medication, Pentop...'",
      );
    } else if (currentMode === "ringtone") {
      const ok = await playChime(settings.soundVolume ?? 0.35);
      setTestNotice(
        ok
          ? (isNepali ? "सुमधुर घण्टीको धुन बज्यो।" : "Gentle medical chime played.")
          : (isNepali ? "ब्राउजर अडियो अनुमति आवश्यक छ।" : "Tap anywhere on screen to enable audio."),
      );
    } else if (currentMode === "vibration") {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate([250, 100, 250]);
          setTestNotice(isNepali ? "यन्त्रमा कम्पन भयो।" : "Haptic vibration pulse triggered.");
        } catch {
          setTestNotice(isNepali ? "यन्त्रमा कम्पन समर्थित छैन।" : "Vibration not supported on this device.");
        }
      } else {
        setTestNotice(isNepali ? "यो यन्त्र वा ब्राउजरमा कम्पन उपलब्ध छैन।" : "Vibration API unavailable on this browser.");
      }
    }

    setTimeout(() => setTesting(false), 2000);
  };

  const modes: {
    id: NotificationPreference;
    icon: typeof Volume2;
    titleEn: string;
    titleNe: string;
    descEn: string;
    descNe: string;
    badgeEn: string;
    badgeNe: string;
  }[] = [
    {
      id: "voice",
      icon: Volume2,
      titleEn: "Voice Reminder",
      titleNe: "आवाज अनुस्मारक",
      descEn: "Auto-speaks medicine name, dosage, and meal instructions when due",
      descNe: "औषधि खाने बेला नाम, मात्रा र सल्लाह स्वचालित रूपमा बोल्छ",
      badgeEn: "Auto-Speaks",
      badgeNe: "बोल्ने",
    },
    {
      id: "ringtone",
      icon: BellRing,
      titleEn: "Ringtone Chime",
      titleNe: "घण्टी (Ringtone)",
      descEn: "Gentle acoustic medical chime repeats until confirmed or snoozed",
      descNe: "सुमधुर मेडिकल घण्टी बज्छ र पुष्टि नभएसम्म दोहोरिन्छ",
      badgeEn: "Gentle Chime",
      badgeNe: "घण्टी",
    },
    {
      id: "vibration",
      icon: Vibrate,
      titleEn: "Haptic Vibration",
      titleNe: "कम्पन (Vibration)",
      descEn: "Discreet silent vibration pattern on mobile without audio",
      descNe: "आवाज बिना यन्त्रमा शान्त कम्पन कम्पन गर्छ",
      badgeEn: "Discreet",
      badgeNe: "शान्त",
    },
  ];

  return (
    <Card className="relative overflow-hidden border border-[#16A36A]/30 bg-gradient-to-br from-[var(--surface)] via-[var(--bg-secondary)] to-[var(--surface-elevated)] p-4 xs:p-5 sm:p-6 shadow-[var(--shadow-card)]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#16A36A]/15 text-[#16A36A] dark:text-[#20C982] border border-[#16A36A]/30 shadow-xs">
            <BellRing className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-display text-sm xs:text-base font-bold text-[var(--text)] tracking-tight">
              {isNepali ? "औषधि अनुस्मारक मोड (Reminder Mode)" : "Medication Reminder Mode"}
            </h2>
            <p className="text-[11px] text-[var(--text-secondary)]">
              {isNepali
                ? "तपाईंको छनोट अनुसार सबै औषधि सूचनाहरूले यही मोड पछ्याउनेछन्"
                : "Controls how every scheduled and snoozed reminder alerts you"}
            </p>
          </div>
        </div>

        {/* Test Mode Button */}
        <Button
          size="sm"
          variant="outline"
          onClick={handleTestMode}
          disabled={testing}
          className="self-start sm:self-auto text-xs py-1.5 px-3 min-h-[34px] font-semibold"
        >
          <Play className="h-3.5 w-3.5 text-[#16A36A] dark:text-[#20C982] fill-current" />
          <span>{testing ? (isNepali ? "परीक्षण हुँदै..." : "Testing...") : (isNepali ? "मोड परीक्षण गर्नुहोस्" : "Test Active Mode")}</span>
        </Button>
      </div>

      {/* Mode Selector Options Grid */}
      <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {modes.map((m) => {
          const isSelected = currentMode === m.id;
          const Icon = m.icon;

          return (
            <button
              key={m.id}
              type="button"
              onClick={() => handleSelectMode(m.id)}
              className={`group relative flex flex-col justify-between p-3 xs:p-3.5 rounded-2xl border text-left transition-all duration-200 active:scale-[0.98] ${
                isSelected
                  ? "border-[#20D6C2] bg-[#16A36A]/15 text-[var(--text)] shadow-[0_0_20px_rgba(32,214,194,0.22)] -translate-y-0.5"
                  : "border-[var(--border)] bg-[var(--surface-elevated)]/60 text-[var(--text-secondary)] hover:border-[#16A36A]/50 hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div
                    className={`grid h-8 w-8 place-items-center rounded-xl transition-colors ${
                      isSelected
                        ? "bg-gradient-to-tr from-[#16A36A] to-[#20D6C2] text-white shadow-xs"
                        : "bg-[var(--surface)] text-[var(--text-muted)] group-hover:text-[#16A36A]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                      isSelected
                        ? "border-[#20D6C2]/40 bg-[#20D6C2]/20 text-[#20D6C2]"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]"
                    }`}
                  >
                    {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                    <span>{isNepali ? m.badgeNe : m.badgeEn}</span>
                  </span>
                </div>

                <h3 className="font-display text-xs xs:text-sm font-bold text-[var(--text)]">
                  {isNepali ? m.titleNe : m.titleEn}
                </h3>
                <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-secondary)] line-clamp-2">
                  {isNepali ? m.descNe : m.descEn}
                </p>
              </div>

              {isSelected && (
                <div className="mt-2.5 pt-2 border-t border-[var(--border-subtle)] flex items-center gap-1.5 text-[10px] font-bold text-[#16A36A] dark:text-[#A3EAC1]">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{isNepali ? "सक्रिय छ (Active)" : "Currently Selected"}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Real-time status / test feedback banner */}
      {testNotice && (
        <div className="mt-3 p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs font-semibold text-emerald-500 dark:text-[#A3EAC1] flex items-center gap-2 animate-fade-in">
          <Sparkles className="h-4 w-4 shrink-0 text-[#20D6C2]" />
          <span className="truncate">{testNotice}</span>
        </div>
      )}
    </Card>
  );
}
