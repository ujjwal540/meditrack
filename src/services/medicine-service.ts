import type { Medicine } from "@/types";
import { readJSON, uid, writeJSON } from "@/lib/utils";

// Day 1–2: data lives in the browser (localStorage).
// Day 3: swap these functions to Supabase queries; the rest of the app stays the same.
const KEY = "meditrack.medicines";

export function getMedicines(): Medicine[] {
  return readJSON<Medicine[]>(KEY, []);
}

export function addMedicine(input: Omit<Medicine, "id" | "createdAt">): Medicine {
  const medicine: Medicine = {
    ...input,
    times: [...new Set(input.times)].sort(),
    id: uid(),
    createdAt: new Date().toISOString(),
  };
  writeJSON(KEY, [...getMedicines(), medicine]);
  return medicine;
}

export function updateMedicine(
  id: string,
  input: Omit<Medicine, "id" | "createdAt">,
): Medicine | undefined {
  const medicines = getMedicines();
  const existing = medicines.find((medicine) => medicine.id === id);
  if (!existing) return undefined;
  const updated: Medicine = {
    ...existing,
    ...input,
    times: [...new Set(input.times)].sort(),
  };
  writeJSON(KEY, medicines.map((medicine) => (medicine.id === id ? updated : medicine)));
  return updated;
}

export function deleteMedicine(id: string): void {
  writeJSON(KEY, getMedicines().filter((m) => m.id !== id));
}
