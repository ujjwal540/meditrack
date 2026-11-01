export type DoseStatus = "pending" | "taken" | "snoozed" | "not_confirmed";

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  times: string[]; // ["08:00", "20:00"]
  notes?: string;
  createdAt: string;
}

export interface DoseLog {
  key: string; // `${medicineId}_${date}_${time}` – unique, prevents duplicates
  medicineId: string;
  date: string;
  time: string;
  status: DoseStatus;
  recordedAt?: string;
  snoozedUntil?: string;
}

export interface Dose {
  key: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  instructions: string;
  date: string;
  time: string;
  status: DoseStatus;
  isDue: boolean;
  recordedAt?: string;
  snoozedUntil?: string;
}

export type ConsentStatus = "invited" | "accepted" | "granted" | "revoked";

export interface CaregiverConnection {
  id: string;
  caregiverEmail: string;
  caregiverName?: string;
  consentStatus: ConsentStatus;
  createdAt: string;
}

export interface AppSettings {
  snoozeMinutes: number;
  graceMinutes: number; // how long a dose may stay unconfirmed before a caregiver alert
}
