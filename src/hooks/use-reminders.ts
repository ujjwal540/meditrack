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

  const refresh = useCallback(async () => {
    const [loadedMedicines] = await Promise.all([getMedicines()]);
    setMedicines(loadedMedicines);
    setLogs(getLogs());
    setSettings(getSettings());
  }, []);

  useEffect(() => {
    void refresh();
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

  const respond = useCallback(
    (key: string, status: DoseStatus, snoozeMinutes?: number) => {
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
        snoozedUntil:
          status === "snoozed" && snoozeMinutes
            ? new Date(Date.now() + snoozeMinutes * 60000).toISOString()
            : undefined,
      });
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
    async (input: Omit<Medicine, "id" | "createdAt">) => {
      await addMedicine(input);
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteMedicine(id);
      await refresh();
    },
    [refresh],
  );

  const update = useCallback(
    async (id: string, input: Omit<Medicine, "id" | "createdAt">) => {
      await updateMedicine(id, input);
      await refresh();
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
