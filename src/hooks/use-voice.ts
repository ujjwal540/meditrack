"use client";

import { useCallback } from "react";
import { useAccessibility } from "@/components/layout/AccessibilityProvider";
import { useLanguage } from "@/i18n/LanguageContext";

/**
 * Browser speech synthesis supporting both English and Nepali.
 * Rate is set slightly slower (0.88 - 0.9) for elder listeners.
 */
export function useVoice() {
  const { voice } = useAccessibility();
  const { isNepali } = useLanguage();

  const speak = useCallback(
    (text: string, force = false) => {
      if ((!voice && !force) || typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.88; // Comfortable pace for older listeners
      u.pitch = 1;
      u.lang = isNepali ? "ne-NP" : navigator.language || "en-US";

      // If in Nepali mode, try finding a Nepali or Hindi/Devanagari voice
      if (isNepali && "getVoices" in window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        const nepaliVoice =
          voices.find((v) => v.lang.startsWith("ne")) ||
          voices.find((v) => v.lang.startsWith("hi"));
        if (nepaliVoice) {
          u.voice = nepaliVoice;
        }
      }

      window.speechSynthesis.speak(u);
    },
    [voice, isNepali],
  );

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speak, stop, voiceOn: voice };
}