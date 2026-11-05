"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAccessibility } from "@/components/layout/AccessibilityProvider";
import { useLanguage } from "@/i18n/LanguageContext";

/**
 * MediTrack Voice Assistance System
 * Reliable speech synthesis supporting both English and Nepali with elder-friendly
 * cadence (rate 0.88), Devanagari voice auto-fallback, and speech queue recovery.
 */
export function useVoice() {
  const { voice } = useAccessibility();
  const { isNepali } = useLanguage();
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // Pre-cache available system voices and re-check on dynamic load (Chrome/Safari)
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const loadVoices = () => {
      try {
        const available = window.speechSynthesis.getVoices();
        if (available.length > 0) {
          voicesRef.current = available;
        }
      } catch {}
    };

    loadVoices();
    if ("onvoiceschanged" in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const speak = useCallback(
    (text: string, force = false, overrideLang?: "en" | "ne") => {
      if ((!voice && !force) || typeof window === "undefined" || !("speechSynthesis" in window)) {
        return false;
      }

      try {
        // Clear any previous interrupted or stuck utterances
        window.speechSynthesis.cancel();

        const targetLang = overrideLang ? overrideLang === "ne" : isNepali;
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.88; // Comfortable pace for older listeners
        u.pitch = 1.0;
        u.lang = targetLang ? "ne-NP" : "en-US";

        // Intelligent voice matching
        const available = voicesRef.current.length > 0
          ? voicesRef.current
          : window.speechSynthesis.getVoices();

        if (targetLang) {
          const nepaliVoice =
            available.find((v) => v.lang.toLowerCase().startsWith("ne")) ||
            available.find((v) => v.lang.toLowerCase().startsWith("hi"));
          if (nepaliVoice) {
            u.voice = nepaliVoice;
          }
        } else {
          const naturalEnglish =
            available.find((v) => v.lang.startsWith("en") && v.name.includes("Natural")) ||
            available.find((v) => v.lang === "en-US") ||
            available.find((v) => v.lang.startsWith("en"));
          if (naturalEnglish) {
            u.voice = naturalEnglish;
          }
        }

        // Error boundary handler
        u.onerror = (e) => {
          console.warn("Speech synthesis notice:", e.error);
        };

        window.speechSynthesis.speak(u);
        return true;
      } catch (err) {
        console.warn("Speech synthesis unavailable:", err);
        return false;
      }
    },
    [voice, isNepali],
  );

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }, []);

  return { speak, stop, voiceOn: voice };
}

/**
 * Builds the canonical MediTrack voice announcement text
 */
export function buildMedicineVoicePrompt({
  medicineName,
  dosage,
  userName,
  isNepali,
}: {
  medicineName: string;
  dosage?: string;
  userName?: string;
  isNepali: boolean;
}): string {
  const doseText = dosage ? ` ${dosage}` : "";

  if (isNepali) {
    const greeting = userName ? `नमस्ते ${userName} ज्यू!` : "नमस्ते!";
    return `${greeting} तपाईंको औषधि खाने समय भयो: ${medicineName}${doseText}। कृपया आफ्नो तालिका अनुसार औषधि खानुहोस्।`;
  }

  const greeting = userName ? `Namaste ${userName}!` : "Namaste!";
  return `${greeting} It is time to take your medicine, ${medicineName}${doseText}. Please take your scheduled medicine.`;
}