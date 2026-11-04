"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { SupportedLanguage } from "@/types";
import type { TranslationDictionary } from "./types";
import { en } from "./translations/en";
import { ne } from "./translations/ne";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "meditrack.language";
const USER_LANG_PREFIX = "meditrack.lang.";

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  isNepali: boolean;
  t: TranslationDictionary;
  formatNumber: (n: number | string) => string;
  formatTimeDisplay: (timeString: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const nepaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

export function toNepaliDigits(input: number | string): string {
  return String(input).replace(/[0-9]/g, (digit) => nepaliDigits[Number(digit)] ?? digit);
}

export function formatTimeWithLocale(timeString: string, lang: SupportedLanguage): string {
  if (!timeString) return "";
  const parts = timeString.split(":");
  if (parts.length < 2) return timeString;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const pad = (n: number) => String(n).padStart(2, "0");

  if (lang === "ne") {
    let period = "बिहान";
    if (h >= 12 && h < 16) period = "दिउँसो";
    else if (h >= 16 && h < 20) period = "साँझ";
    else if (h >= 20 || h < 4) period = "राती";

    const displayHour = h % 12 || 12;
    return `${period} ${toNepaliDigits(displayHour)}:${toNepaliDigits(pad(m))}`;
  }

  const hour12 = h % 12 || 12;
  const ampm = h >= 12 ? "PM" : "AM";
  return `${hour12}:${pad(m)} ${ampm}`;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    if (typeof window !== "undefined") {
      // Check if user has active session
      try {
        const currentUserRaw = localStorage.getItem("meditrack.current_user");
        if (currentUserRaw) {
          const parsed = JSON.parse(currentUserRaw);
          if (parsed?.id) {
            const userLang = localStorage.getItem(`${USER_LANG_PREFIX}${parsed.id}`);
            if (userLang === "en" || userLang === "ne") return userLang;
          }
          if (parsed?.preferred_language === "en" || parsed?.preferred_language === "ne") {
            return parsed.preferred_language;
          }
          if (parsed?.preferredLanguage === "en" || parsed?.preferredLanguage === "ne") {
            return parsed.preferredLanguage;
          }
        }
      } catch {}

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "ne") return saved;
      if (navigator.language?.startsWith("ne")) return "ne";
    }
    return "en";
  });

  // Apply language attributes to HTML tag immediately
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
      document.documentElement.setAttribute("data-lang", language);
    }
  }, [language]);

  // Listen to storage events across tabs or user session switches
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === "en" || e.newValue === "ne")) {
        setLanguageState(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    if (newLang !== "en" && newLang !== "ne") return;

    setLanguageState(newLang);

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newLang);

      // Check current user to persist per-account
      try {
        const currentUserRaw = localStorage.getItem("meditrack.current_user");
        if (currentUserRaw) {
          const parsed = JSON.parse(currentUserRaw);
          parsed.preferred_language = newLang;
          parsed.preferredLanguage = newLang;
          localStorage.setItem("meditrack.current_user", JSON.stringify(parsed));
          if (parsed.id) {
            localStorage.setItem(`${USER_LANG_PREFIX}${parsed.id}`, newLang);
          }
        }
      } catch (e) {
        console.warn("Could not save language to user session:", e);
      }

      // Sync with Supabase Auth user metadata and profile table if authenticated
      if (supabase) {
        const client = supabase;
        void client.auth
          .updateUser({
            data: { preferred_language: newLang },
          })
          .catch(() => {});

        void client.auth.getUser().then(({ data }) => {
          if (data?.user?.id) {
            localStorage.setItem(`${USER_LANG_PREFIX}${data.user.id}`, newLang);
            void client
              .from("users")
              .update({ preferred_language: newLang })
              .eq("id", data.user.id)
              .then(() => {}, () => {});
          }
        });
      }
    }
  }, []);

  const isNepali = language === "ne";
  const t = useMemo(() => (language === "ne" ? ne : en), [language]);

  const formatNumber = useCallback(
    (n: number | string) => {
      return isNepali ? toNepaliDigits(n) : String(n);
    },
    [isNepali],
  );

  const formatTimeDisplay = useCallback(
    (timeString: string) => {
      return formatTimeWithLocale(timeString, language);
    },
    [language],
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        isNepali,
        t,
        formatNumber,
        formatTimeDisplay,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export function useTranslation(): {
  t: TranslationDictionary;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  isNepali: boolean;
  formatNumber: (n: number | string) => string;
  formatTimeDisplay: (time: string) => string;
} {
  return useLanguage();
}
