import type { Dose, AppSettings, CaregiverConnection } from "@/types";
import { readJSON, uid, writeJSON } from "@/lib/utils";
import { getConnections } from "@/services/caregiver-service";

export interface FamilyAlert {
  id: string;
  doseKey: string;
  patientId?: string;
  patientName: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string;
  scheduledDate: string;
  escalatedAt: string;
  caregiverEmail: string;
  caregiverName?: string;
  status: "escalated" | "confirmed_late" | "acknowledged";
  confirmedAt?: string;
  message: string;
}

const ALERTS_STORAGE_KEY = "meditrack.family_alerts";
const ESCALATED_KEYS_KEY = "meditrack.escalated_dose_keys";

export function getFamilyAlerts(): FamilyAlert[] {
  return readJSON<FamilyAlert[]>(ALERTS_STORAGE_KEY, []);
}

export function saveFamilyAlert(alert: FamilyAlert): void {
  const existing = getFamilyAlerts();
  // Idempotent: prevent duplicate alert for the exact same dose and caregiver
  const duplicate = existing.find(
    (a) => a.doseKey === alert.doseKey && a.caregiverEmail === alert.caregiverEmail,
  );
  if (duplicate) return;

  writeJSON(ALERTS_STORAGE_KEY, [alert, ...existing]);

  // Mark dose key as escalated
  const escalatedKeys = readJSON<string[]>(ESCALATED_KEYS_KEY, []);
  if (!escalatedKeys.includes(alert.doseKey)) {
    writeJSON(ESCALATED_KEYS_KEY, [...escalatedKeys, alert.doseKey]);
  }
}

/**
 * Checks all daily doses against the configured escalation grace period.
 * If a dose is past scheduled time + graceMinutes and has not been confirmed as taken
 * or actively snoozed, it creates a family escalation alert for authorized caregivers.
 */
export async function checkAndTriggerEscalations(
  doses: Dose[],
  settings: AppSettings,
  patientName: string = "Patient Member",
): Promise<FamilyAlert[]> {
  const graceMinutes = settings.graceMinutes || 15;
  const now = new Date();
  const escalatedKeys = new Set(readJSON<string[]>(ESCALATED_KEYS_KEY, []));
  const newAlerts: FamilyAlert[] = [];

  // Fetch authorized connected caregivers
  let connections: CaregiverConnection[] = [];
  try {
    connections = await getConnections();
  } catch {
    connections = [];
  }

  // Only consider caregivers with explicit granted consent
  const authorizedCaregivers = connections.filter(
    (c) => c.consentStatus === "granted" || c.consentStatus === "accepted",
  );

  if (authorizedCaregivers.length === 0) {
    return [];
  }

  for (const dose of doses) {
    // If dose is already taken, skipped, or currently in active snooze window, skip
    if (dose.status === "taken") continue;
    if (dose.status === "snoozed" && dose.snoozedUntil) {
      if (new Date(dose.snoozedUntil).getTime() > now.getTime()) {
        continue;
      }
    }

    // Calculate elapsed time from scheduled dose time
    const [year, month, day] = dose.date.split("-").map(Number);
    const [hour, minute] = dose.time.split(":").map(Number);
    const scheduledDateTime = new Date(year, month - 1, day, hour, minute, 0, 0);

    const elapsedMinutes = (now.getTime() - scheduledDateTime.getTime()) / 60000;

    // Has it exceeded the patient's configured escalation grace period?
    if (elapsedMinutes >= graceMinutes && !escalatedKeys.has(dose.key)) {
      // Trigger escalation alert to authorized family caregivers
      for (const caregiver of authorizedCaregivers) {
        const alertMessage = `MediTrack Family Care Alert: Your connected family member, ${patientName}, has not confirmed taking their scheduled medicine, ${dose.medicineName} (${dose.dosage}), scheduled at ${dose.time}. Please contact them to check.`;

        const alert: FamilyAlert = {
          id: uid(),
          doseKey: dose.key,
          patientName,
          medicineName: dose.medicineName,
          dosage: dose.dosage,
          scheduledTime: dose.time,
          scheduledDate: dose.date,
          escalatedAt: now.toISOString(),
          caregiverEmail: caregiver.caregiverEmail,
          caregiverName: caregiver.caregiverName,
          status: "escalated",
          message: alertMessage,
        };

        saveFamilyAlert(alert);
        newAlerts.push(alert);

        // Deliver browser alert if caregiver has page open
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          try {
            new Notification("MediTrack Family Care Escalation", {
              body: alertMessage,
              icon: "/logo.svg",
              tag: `family-alert-${dose.key}`,
            });
          } catch {}
        }
      }
    }
  }

  return newAlerts;
}

/**
 * When a patient marks a dose as Taken after an escalation alert was already dispatched,
 * this updates the family alert status to 'confirmed_late' so caregivers know the patient is safe.
 */
export function markEscalationConfirmedLate(doseKey: string): void {
  const alerts = getFamilyAlerts();
  let modified = false;
  const nowIso = new Date().toISOString();

  const updated = alerts.map((alert) => {
    if (alert.doseKey === doseKey && alert.status === "escalated") {
      modified = true;
      return {
        ...alert,
        status: "confirmed_late" as const,
        confirmedAt: nowIso,
        message: `${alert.patientName} confirmed taking ${alert.medicineName} late at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`,
      };
    }
    return alert;
  });

  if (modified) {
    writeJSON(ALERTS_STORAGE_KEY, updated);
  }
}

/**
 * Acknowledges a family alert by the caregiver
 */
export function acknowledgeFamilyAlert(alertId: string): void {
  const alerts = getFamilyAlerts();
  writeJSON(
    ALERTS_STORAGE_KEY,
    alerts.map((a) => (a.id === alertId ? { ...a, status: "acknowledged" as const } : a)),
  );
}
