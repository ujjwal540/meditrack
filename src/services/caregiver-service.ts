import type { CaregiverConnection, ConsentStatus } from "@/types";
import { readJSON, uid, writeJSON } from "@/lib/utils";

// Demo-mode placeholder. On Day 3 this becomes real invitations stored in the
// `caregiver_connections` table, protected by Row Level Security.
const KEY = "meditrack.caregivers";

export function getConnections(): CaregiverConnection[] {
  return readJSON<CaregiverConnection[]>(KEY, []);
}

export function inviteCaregiver(email: string, name?: string): CaregiverConnection {
  const connection: CaregiverConnection = {
    id: uid(),
    caregiverEmail: email.trim().toLowerCase(),
    caregiverName: name?.trim() || undefined,
    consentStatus: "invited",
    createdAt: new Date().toISOString(),
  };
  writeJSON(KEY, [...getConnections(), connection]);
  return connection;
}

export function setConsent(id: string, consentStatus: ConsentStatus): void {
  writeJSON(
    KEY,
    getConnections().map((c) => (c.id === id ? { ...c, consentStatus } : c)),
  );
}

export function removeConnection(id: string): void {
  writeJSON(KEY, getConnections().filter((c) => c.id !== id));
}
