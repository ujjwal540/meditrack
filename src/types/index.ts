export type DoseStatus = "pending" | "taken" | "snoozed" | "not_confirmed" | "skipped" | "escalated";

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  times: string[]; // ["08:00", "20:00"]
  notes?: string;
  type?: "tablet" | "capsule" | "injection" | "other";
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
  reason?: string;
  escalated?: boolean;
}

export interface Dose {
  key: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  instructions: string;
  type?: "tablet" | "capsule" | "injection" | "other";
  date: string;
  time: string;
  status: DoseStatus;
  isDue: boolean;
  recordedAt?: string;
  snoozedUntil?: string;
  reason?: string;
  escalated?: boolean;
}

export type ConsentStatus = "invited" | "accepted" | "granted" | "revoked";

export interface CaregiverConnection {
  id: string;
  patientId?: string;
  caregiverId?: string;
  caregiverEmail: string;
  caregiverName?: string;
  consentStatus: ConsentStatus;
  createdAt: string;
}

export type SupportedLanguage = "en" | "ne";

export interface AppSettings {
  language?: SupportedLanguage;
  easyMode: boolean;
  voiceEnabled: boolean;
  snoozeMinutes: number;
  graceMinutes: number; // how long a dose may stay unconfirmed before a caregiver alert
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  vibrationEnabled: boolean;
  familyAlertsEnabled?: boolean;
  repeatReminderInterval?: number; // interval in seconds for gentle alarm repeats
}

export interface HealthMeasurement {
  id: string;
  type: "blood_pressure" | "weight" | "blood_sugar" | "heart_rate" | "other";
  value: string;
  unit?: string;
  recordedAt: string;
  note?: string;
}

export interface Appointment {
  id: string;
  title: string;
  provider?: string;
  date: string;
  time?: string;
  note?: string;
}

export interface CaregiverSchedule {
  id: string;
  type: "call" | "visit";
  patientName: string;
  patientEmail?: string;
  date: string;
  time: string;
  notes?: string;
  status: "scheduled" | "completed" | "cancelled";
  createdAt: string;
}

export type UserRole = "patient" | "family_caregiver" | "professional_caregiver" | "admin";

export interface CareReport {
  id: string;
  patientId?: string;
  caregiverId?: string;
  patientName: string;
  date: string;
  adherenceObserved: string;
  notes: string;
  visitType: "call" | "visit" | "checkin";
  bookingId?: string;
  createdAt: string;
}

export interface ProfessionalCaregiver {
  id: string;
  userId: string;
  fullName: string;
  email?: string;
  phone?: string;
  bio: string;
  qualifications: string;
  yearsExperience: number;
  languages: string[];
  serviceLocation: string;
  hourlyRate: number;
  verificationStatus: "pending" | "verified" | "rejected";
  rating: number;
  reviewCount: number;
  availability: "weekdays" | "weekends" | "weekdays_and_weekends" | "on_call";
  avatarUrl?: string;
  createdAt: string;
}

export interface ProfessionalBooking {
  id: string;
  patientId: string;
  caregiverId: string;
  patientName?: string;
  caregiverName?: string;
  serviceType: "call" | "visit" | "checkin" | "routine_care";
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  hourlyRate: number;
  totalAmount: number;
  careRequirements?: string;
  status: "requested" | "confirmed" | "in_progress" | "completed" | "cancelled" | "rejected";
  patientContactPhone?: string;
  serviceAddress?: string;
  createdAt: string;
}

export interface ProfessionalReview {
  id: string;
  caregiverId: string;
  reviewerId: string;
  reviewerName?: string;
  bookingId?: string;
  rating: number;
  comment: string;
  createdAt: string;
}


