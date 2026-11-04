import type { Medicine } from "@/types";
import { supabase } from "@/lib/supabase";
import { readJSON, uid, writeJSON } from "@/lib/utils";

const KEY = "meditrack.medicines";

type MedicineRow = {
  id: string;
  patient_id: string;
  medicine_name: string;
  dosage: string;
  instructions: string;
  notes: string | null;
  created_at: string;
};

type ScheduleRow = {
  medicine_id: string;
  reminder_time: string;
  start_date: string;
  end_date: string | null;
};

function toMedicine(row: MedicineRow, schedules: ScheduleRow[]): Medicine {
  return {
    id: row.id,
    name: row.medicine_name,
    dosage: row.dosage,
    instructions: row.instructions,
    notes: row.notes ?? undefined,
    times: schedules
      .filter((schedule) => schedule.medicine_id === row.id)
      .map((schedule) => schedule.reminder_time.slice(0, 5))
      .sort(),
    startDate: schedules.find((schedule) => schedule.medicine_id === row.id)?.start_date ?? new Date().toISOString().slice(0, 10),
    endDate: schedules.find((schedule) => schedule.medicine_id === row.id)?.end_date ?? undefined,
    createdAt: row.created_at,
  };
}

function normalize(input: Omit<Medicine, "id" | "createdAt">) {
  return { ...input, times: [...new Set(input.times)].sort() };
}

async function currentUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function getMedicines(): Promise<Medicine[]> {
  if (!supabase) return readJSON<Medicine[]>(KEY, []);
  const userId = await currentUserId();
  if (!userId) return [];

  const [{ data: medicines, error: medicineError }, { data: schedules, error: scheduleError }] = await Promise.all([
    supabase.from("medicines").select("id, patient_id, medicine_name, dosage, instructions, notes, created_at").eq("patient_id", userId).order("created_at", { ascending: true }),
    supabase.from("medicine_schedules").select("medicine_id, reminder_time, start_date, end_date").in("medicine_id", (await supabase.from("medicines").select("id").eq("patient_id", userId)).data?.map((row) => row.id) ?? []),
  ]);
  if (medicineError || scheduleError) {
    console.warn("[v0] Failed to load medicines from Supabase", medicineError ?? scheduleError);
    return [];
  }
  return ((medicines ?? []) as MedicineRow[]).map((medicine) => toMedicine(medicine, (schedules ?? []) as ScheduleRow[]));
}

async function saveSchedules(medicineId: string, input: Omit<Medicine, "id" | "createdAt">) {
  if (!supabase) return;
  await supabase.from("medicine_schedules").delete().eq("medicine_id", medicineId);
  const rows = input.times.map((time) => ({
    medicine_id: medicineId,
    reminder_time: time,
    start_date: input.startDate,
    end_date: input.endDate || null,
  }));
  if (rows.length) await supabase.from("medicine_schedules").insert(rows);
}

export async function addMedicine(input: Omit<Medicine, "id" | "createdAt">): Promise<Medicine | undefined> {
  const normalized = normalize(input);
  if (!supabase) {
    const medicine: Medicine = { ...normalized, id: uid(), createdAt: new Date().toISOString() };
    writeJSON(KEY, [...readJSON<Medicine[]>(KEY, []), medicine]);
    return medicine;
  }
  const userId = await currentUserId();
  if (!userId) return undefined;
  const { data, error } = await supabase.from("medicines").insert({ patient_id: userId, medicine_name: normalized.name, dosage: normalized.dosage, instructions: normalized.instructions, notes: normalized.notes || null }).select("id, patient_id, medicine_name, dosage, instructions, notes, created_at").single();
  if (error || !data) return undefined;
  await saveSchedules(data.id, normalized);
  return { ...normalized, id: data.id, createdAt: data.created_at };
}

export async function updateMedicine(id: string, input: Omit<Medicine, "id" | "createdAt">): Promise<Medicine | undefined> {
  const normalized = normalize(input);
  if (!supabase) {
    const medicines = readJSON<Medicine[]>(KEY, []);
    const existing = medicines.find((medicine) => medicine.id === id);
    if (!existing) return undefined;
    const updated = { ...existing, ...normalized };
    writeJSON(KEY, medicines.map((medicine) => (medicine.id === id ? updated : medicine)));
    return updated;
  }
  const userId = await currentUserId();
  if (!userId) return undefined;
  const { data, error } = await supabase.from("medicines").update({ medicine_name: normalized.name, dosage: normalized.dosage, instructions: normalized.instructions, notes: normalized.notes || null }).eq("id", id).eq("patient_id", userId).select("id, patient_id, medicine_name, dosage, instructions, notes, created_at").single();
  if (error || !data) return undefined;
  await saveSchedules(id, normalized);
  return { ...normalized, id: data.id, createdAt: data.created_at };
}

export async function deleteMedicine(id: string): Promise<void> {
  if (!supabase) {
    writeJSON(KEY, readJSON<Medicine[]>(KEY, []).filter((medicine) => medicine.id !== id));
    return;
  }
  const userId = await currentUserId();
  if (userId) await supabase.from("medicines").delete().eq("id", id).eq("patient_id", userId);
}
