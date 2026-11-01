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

export function deleteMedicine(id: string): void {
  writeJSON(KEY, getMedicines().filter((m) => m.id !== id));
}
