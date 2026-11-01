export const ALLOWED_UPLOAD_TYPES = ["image/jpeg", "image/png", "application/pdf"];
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export interface MedicineInput {
  name: string;
  dosage: string;
  instructions: string;
  startDate: string;
  endDate?: string;
  times: string[];
}

export function validateMedicine(input: MedicineInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!input.name.trim()) errors.name = "Enter the medicine name.";
  if (!input.dosage.trim()) errors.dosage = "Enter the prescribed dosage.";
  if (!input.startDate) errors.startDate = "Choose a start date.";
  if (input.endDate && input.startDate && input.endDate < input.startDate) {
    errors.endDate = "End date must be after the start date.";
  }
  const times = input.times.filter(Boolean);
  if (times.length === 0) errors.times = "Add at least one reminder time.";
  else if (new Set(times).size !== times.length) errors.times = "Reminder times must be different.";
  return errors;
}

export function validateUpload(file: { type: string; size: number }): string | null {
  if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) return "Only JPG, PNG or PDF files are allowed.";
  if (file.size > MAX_UPLOAD_BYTES) return "File is too large (maximum 5 MB).";
  return null;
}
