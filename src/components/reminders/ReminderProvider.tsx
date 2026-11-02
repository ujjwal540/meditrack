"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useReminders } from "@/hooks/use-reminders";
import { ReminderModal } from "@/components/reminders/ReminderModal";

type Ctx = ReturnType<typeof useReminders>;
const ReminderContext = createContext<Ctx | null>(null);

export function ReminderProvider({ children }: { children: ReactNode }) {
  const value = useReminders();
  useEffect(() => {
    document.documentElement.classList.toggle("easy-mode", value.settings.easyMode);
  }, [value.settings.easyMode]);

  return (
    <ReminderContext.Provider value={value}>
      {children}
      <ReminderModal
        dose={value.dueDoses[0]}
        remaining={value.dueDoses.length}
        snoozeMinutes={value.settings.snoozeMinutes}
        onRespond={value.respond}
      />
    </ReminderContext.Provider>
  );
}

export function useMediTrack(): Ctx {
  const ctx = useContext(ReminderContext);
  if (!ctx) throw new Error("useMediTrack must be used inside <ReminderProvider>");
  return ctx;
}
