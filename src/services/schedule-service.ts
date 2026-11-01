import type { AppSettings, DoseLog } from "@/types";
import { readJSON, writeJSON } from "@/lib/utils";

const LOGS_KEY = "meditrack.dose_logs";
const SETTINGS_KEY = "meditrack.settings";

export const DEFAULT_SETTINGS: AppSettings = { snoozeMinutes: 10, graceMinutes: 30 };

export function getLogs(): Record<string, DoseLog> {
  return readJSON<Record<string, DoseLog>>(LOGS_KEY, {});
}

/** One log per dose key, so saving twice can never create a duplicate record. */
export function saveLog(log: DoseLog): void {
  writeJSON(LOGS_KEY, { ...getLogs(), [log.key]: log });
}

export function getSettings(): AppSettings {
  return { ...DEFAULT_SETTINGS, ...readJSON<Partial<AppSettings>>(SETTINGS_KEY, {}) };
}

export function saveSettings(settings: AppSettings): void {
  writeJSON(SETTINGS_KEY, settings);
}
