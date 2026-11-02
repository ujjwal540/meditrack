import type { Dose, DoseLog, Medicine } from "@/types";

/** A pending dose older than this is shown as "Not yet confirmed" and no longer pops up. */
export const OVERDUE_WINDOW_MINUTES = 120;

const pad = (n: number) => String(n).padStart(2, "0");

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function timeToDate(date: string, time: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  return new Date(y, m - 1, d, h, min, 0, 0);
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? "PM" : "AM"}`;
}

export function periodOf(time: string): "Morning" | "Afternoon" | "Evening" | "Night" {
  const h = Number(time.split(":")[0]);
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  if (h < 21) return "Evening";
  return "Night";
}

export function isActiveOn(med: Medicine, date: string): boolean {
  return date >= med.startDate && (!med.endDate || date <= med.endDate);
}

export function buildDosesForDate(
  medicines: Medicine[],
  logs: Record<string, DoseLog>,
  date: string,
  now: Date,
): Dose[] {
  const doses: Dose[] = [];
  for (const med of medicines) {
    if (!isActiveOn(med, date)) continue;
    for (const time of med.times) {
      const key = `${med.id}_${date}_${time}`;
      const log = logs[key];
      const scheduled = timeToDate(date, time);
      const minutesLate = (now.getTime() - scheduled.getTime()) / 60000;
      let status = log?.status ?? "pending";
      if (status === "pending" && minutesLate > OVERDUE_WINDOW_MINUTES) {
        status = "not_confirmed"; // never claim "missed" – we simply don't know
      }
      doses.push({
        key,
        medicineId: med.id,
        medicineName: med.name,
        dosage: med.dosage,
        instructions: med.instructions,
        type: med.type ?? "tablet",
        date,
        time,
        status,
        isDue: status === "pending" && minutesLate >= 0,
        recordedAt: log?.recordedAt,
        snoozedUntil: log?.snoozedUntil,
      });
    }
  }
  return doses.sort((a, b) => a.time.localeCompare(b.time));
}

/** Doses that should trigger a reminder right now. */
export function getDueDoses(doses: Dose[], now: Date): Dose[] {
  return doses.filter((d) => {
    if (d.status === "snoozed") {
      return !!d.snoozedUntil && new Date(d.snoozedUntil).getTime() <= now.getTime();
    }
    return d.status === "pending" && d.isDue;
  });
}

export function getNextDose(doses: Dose[], now: Date): Dose | undefined {
  return doses.find(
    (d) => d.status === "pending" && timeToDate(d.date, d.time).getTime() > now.getTime(),
  );
}

export function summarize(doses: Dose[]) {
  const total = doses.length;
  const taken = doses.filter((d) => d.status === "taken").length;
  return { total, taken, pending: total - taken };
}

export function weeklyAdherence(
  medicines: Medicine[],
  logs: Record<string, DoseLog>,
  now: Date,
): { day: string; taken: number; scheduled: number }[] {
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const doses = buildDosesForDate(medicines, logs, toISODate(d), now);
    out.push({
      day: d.toLocaleDateString(undefined, { weekday: "short" }),
      taken: doses.filter((x) => x.status === "taken").length,
      scheduled: doses.length,
    });
  }
  return out;
}
