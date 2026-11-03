"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "dark" | "light";

type Prefs = {
  easy: boolean;
  contrast: boolean;
  voice: boolean;
  theme: ThemeMode;
};

const DEFAULT: Prefs = {
  easy: false,
  contrast: false,
  voice: false,
  theme: "dark",
};

const KEY = "meditrack.a11y";

type Ctx = Prefs & {
  toggle: (k: "easy" | "contrast" | "voice") => void;
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;
};

const AccessibilityContext = createContext<Ctx | null>(null);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT);
  const loaded = useRef(false);

  useEffect(() => {
    let saved: Partial<Prefs> = {};
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) saved = JSON.parse(raw);
    } catch {}
    loaded.current = true;
    setPrefs({ ...DEFAULT, ...saved });
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    const el = document.documentElement;
    el.dataset.easy = String(prefs.easy);
    el.dataset.contrast = prefs.contrast ? "high" : "normal";
    el.dataset.theme = prefs.theme;
    if (prefs.theme === "dark") {
      el.classList.add("dark");
    } else {
      el.classList.remove("dark");
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(prefs));
    } catch {}
  }, [prefs]);

  const toggle = useCallback((k: "easy" | "contrast" | "voice") => {
    setPrefs((p) => ({ ...p, [k]: !p[k] }));
  }, []);

  const setTheme = useCallback((theme: ThemeMode) => {
    setPrefs((p) => ({ ...p, theme }));
  }, []);

  const toggleTheme = useCallback(() => {
    setPrefs((p) => ({ ...p, theme: p.theme === "dark" ? "light" : "dark" }));
  }, []);

  const value = useMemo(
    () => ({ ...prefs, toggle, setTheme, toggleTheme }),
    [prefs, toggle, setTheme, toggleTheme],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): Ctx {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used inside <AccessibilityProvider>");
  return ctx;
}