"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AppSettings, DoseLog, DoseStatus, Medicine } from "@/types";
import { addMedicine, deleteMedicine, getMedicines } from "@/services/medicine-service";
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

export function useReminders() {
  const [ready, setReady] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [logs, setLogs] = useState<Record<string, DoseLog>>({});
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [now, setNow] = useState<Date>(() => new Date());
  const notified = useRef<Set<string>>(new Set());
  const { permission, request, notify } = useNotifications();

  const refresh = useCallback(() => {
    setMedicines(getMedicines());
    setLogs(getLogs());
    setSettings(getSettings());
  }, []);

  useEffect(() => {
    refresh();
    setNow(new Date());
    setReady(true);
  }, [refresh]);

  // Check the schedule every 15 seconds.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
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
      notify(`Time for ${d.medicineName}`, `${d.dosage}. ${d.instructions || "Follow the prescribed instructions."}`);
    }
  }, [dueDoses, notify]);

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
    },
    [doses],
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

  const updateSettings = useCallback((s: AppSettings) => {
    saveSettings(s);
    setSettings(s);
  }, []);

  return {
    ready,
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
    removeMedicine: remove,
    notificationPermission: permission,
    requestNotifications: request,
  };
}
