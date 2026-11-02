import type { AppSettings, DoseLog } from "@/types";
import { readJSON, writeJSON } from "@/lib/utils";

const LOGS_KEY = "meditrack.dose_logs";
const SETTINGS_KEY = "meditrack.settings";

export const DEFAULT_SETTINGS: AppSettings = {
  easyMode: false,
  voiceEnabled: true,
  snoozeMinutes: 10,
  graceMinutes: 30,
  notificationsEnabled: true,
  soundEnabled: true,
  soundVolume: 0.35,
  vibrationEnabled: true,
};

export function getLogs(): Record<string, DoseLog> {
  return readJSON<Record<string, DoseLog>>(LOGS_KEY, {});
}

/** One log per dose key, so saving twice can never create a duplicate record. */
export function saveLog(log: DoseLog): void {
  writeJSON(LOGS_KEY, { ...getLogs(), [log.key]: log });
}

export function getSettings(): AppSettings {
  const stored = readJSON<Partial<AppSettings>>(SETTINGS_KEY, {});
  return {
    easyMode: typeof stored.easyMode === "boolean"
      ? stored.easyMode
      : DEFAULT_SETTINGS.easyMode,
    voiceEnabled: typeof stored.voiceEnabled === "boolean"
      ? stored.voiceEnabled
      : DEFAULT_SETTINGS.voiceEnabled,
    snoozeMinutes: [5, 10, 15, 30].includes(stored.snoozeMinutes ?? -1)
      ? stored.snoozeMinutes!
      : DEFAULT_SETTINGS.snoozeMinutes,
    graceMinutes: [15, 30, 45, 60].includes(stored.graceMinutes ?? -1)
      ? stored.graceMinutes!
      : DEFAULT_SETTINGS.graceMinutes,
    notificationsEnabled: typeof stored.notificationsEnabled === "boolean"
      ? stored.notificationsEnabled
      : DEFAULT_SETTINGS.notificationsEnabled,
    soundEnabled: typeof stored.soundEnabled === "boolean"
      ? stored.soundEnabled
      : DEFAULT_SETTINGS.soundEnabled,
    soundVolume: typeof stored.soundVolume === "number" && Number.isFinite(stored.soundVolume)
      ? Math.min(1, Math.max(0.05, stored.soundVolume))
      : DEFAULT_SETTINGS.soundVolume,
    vibrationEnabled: typeof stored.vibrationEnabled === "boolean"
      ? stored.vibrationEnabled
      : DEFAULT_SETTINGS.vibrationEnabled,
  };
}

export function saveSettings(settings: AppSettings): void {
  writeJSON(SETTINGS_KEY, settings);
}
