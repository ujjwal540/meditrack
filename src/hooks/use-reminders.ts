"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AppSettings, DoseLog, DoseStatus, Medicine, UserRole } from "@/types";
import { addMedicine, deleteMedicine, getMedicines, updateMedicine } from "@/services/medicine-service";
import {
  DEFAULT_SETTINGS,
  getLogs,
  getSettings,
  saveLog,
  saveSettings,
} from "@/services/schedule-service";
import {
  buildDosesForDate,
  getDueDoses,
  getNextDose,
  summarize,
  toISODate,
  weeklyAdherence,
} from "@/utils/date-utils";
import { useNotifications } from "@/hooks/use-notifications";
import { getActiveUser } from "@/lib/auth";
import { checkAndTriggerEscalations, markEscalationConfirmedLate } from "@/services/escalation-service";
import { stopAlarmLoop } from "@/utils/sound";

export function useReminders() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string; name?: string; role: UserRole } | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [logs, setLogs] = useState<Record<string, DoseLog>>({});
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [now, setNow] = useState<Date>(() => new Date(0));
  const notified = useRef<Set<string>>(new Set());
  const {
    permission,
    request,
    notify,
    testNotification,
    testSound,
    testVibration,
    soundSupported,
    vibrationSupported,
    voiceSupported,
    speak,
    pushStatus,
  } = useNotifications(settings);

  const refresh = useCallback(() => {
    setMedicines(getMedicines());
    setLogs(getLogs());
    setSettings(getSettings());
  }, []);

  useEffect(() => {
    refresh();
    void getActiveUser().then(setUser);
    setNow(new Date());
    setReady(true);
  }, [refresh]);

  // Check the schedule every 15 seconds.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") setNow(new Date());
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const today = toISODate(now);
  const doses = useMemo(
    () => buildDosesForDate(medicines, logs, today, now),
    [medicines, logs, today, now],
  );
  const dueDoses = useMemo(() => getDueDoses(doses, now), [doses, now]);
  const nextDose = useMemo(() => getNextDose(doses, now), [doses, now]);
  const stats = useMemo(() => summarize(doses), [doses]);
  const weekly = useMemo(() => weeklyAdherence(medicines, logs, now), [medicines, logs, now]);

  // Browser notification – once per due dose (and once more after each snooze).
  useEffect(() => {
    for (const d of dueDoses) {
      const id = `${d.key}|${d.snoozedUntil ?? ""}`;
      if (notified.current.has(id)) continue;
      notified.current.add(id);
      const title = user?.name ? `${user.name}, Time for ${d.medicineName}` : `Time for ${d.medicineName}`;
      notify(title, `${d.dosage}. ${d.instructions || "Follow the prescribed instructions."}`);
    }
  }, [dueDoses, notify, user?.name]);

  useEffect(() => {
    const overdue = doses.filter((dose) => dose.status === "not_confirmed" && !logs[dose.key]);
    if (overdue.length === 0) return;
    for (const dose of overdue) {
      saveLog({
        key: dose.key,
        medicineId: dose.medicineId,
        date: dose.date,
        time: dose.time,
        status: "not_confirmed",
        recordedAt: new Date().toISOString(),
      });
    }
    setLogs(getLogs());
  }, [doses, logs]);

  // Family care escalation check: triggered periodically if family alerts enabled
  useEffect(() => {
    if (settings.familyAlertsEnabled === false || doses.length === 0) return;
    void checkAndTriggerEscalations(doses, settings, user?.name);
  }, [doses, settings, user?.name, now]);

  const respond = useCallback(
    (key: string, status: DoseStatus, snoozeMinutes?: number, reason?: string) => {
      // Stop repeating alarm chime immediately upon any patient response
      stopAlarmLoop();
      const dose = doses.find((d) => d.key === key);
      if (!dose) return;
      const nowIso = new Date().toISOString();
      saveLog({
        key,
        medicineId: dose.medicineId,
        date: dose.date,
        time: dose.time,
        status,
        recordedAt: nowIso,
        reason,
        snoozedUntil:
          status === "snoozed" && snoozeMinutes
            ? new Date(Date.now() + snoozeMinutes * 60000).toISOString()
            : undefined,
      });

      // If dose was previously escalated and now confirmed taken, update family alert
      if (status === "taken") {
        markEscalationConfirmedLate(key);
      }

      setLogs(getLogs());
      setNow(new Date());
      if (status === "taken") {
        speak(
          user?.name
            ? `Thank you, ${user.name}. Your medicine has been marked as taken.`
            : "Your medicine has been marked as taken.",
        );
      }
    },
    [doses, speak, user?.name],
  );

  const add = useCallback(
    (input: Omit<Medicine, "id" | "createdAt">) => {
      addMedicine(input);
      refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    (id: string) => {
      deleteMedicine(id);
      refresh();
    },
    [refresh],
  );

  const update = useCallback(
    (id: string, input: Omit<Medicine, "id" | "createdAt">) => {
      updateMedicine(id, input);
      refresh();
    },
    [refresh],
  );

  const updateSettings = useCallback((s: AppSettings) => {
    saveSettings(s);
    setSettings(s);
  }, []);

  return {
    ready,
    user,
    userName: user?.name,
    now,
    medicines,
    logs,
    doses,
    dueDoses,
    nextDose,
    stats,
    weekly,
    settings,
    updateSettings,
    respond,
    addMedicine: add,
    updateMedicine: update,
    removeMedicine: remove,
    notificationPermission: permission,
    requestNotifications: request,
    testNotification,
    testSound,
    testVibration,
    soundSupported,
    vibrationSupported,
    voiceSupported,
    speak,
    pushStatus,
  };
}
