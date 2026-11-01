import { describe, expect, it } from "vitest";
import { validateMedicine, validateUpload } from "@/utils/validation";

const valid = { name: "Vitamin D", dosage: "1 tablet", instructions: "", startDate: "2026-11-01", times: ["08:00"] };

describe("medicine validation", () => {
  it("accepts a valid medicine", () => {
    expect(validateMedicine(valid)).toEqual({});
  });
  it("requires name, dosage and at least one time", () => {
    const errs = validateMedicine({ ...valid, name: "", dosage: "", times: [] });
    expect(Object.keys(errs).sort()).toEqual(["dosage", "name", "times"]);
  });
  it("rejects an end date before the start date", () => {
    expect(validateMedicine({ ...valid, endDate: "2026-10-01" }).endDate).toBeDefined();
  });
  it("rejects duplicate reminder times", () => {
    expect(validateMedicine({ ...valid, times: ["08:00", "08:00"] }).times).toBeDefined();
  });
});

describe("prescription upload validation", () => {
  it("accepts JPG, PNG and PDF", () => {
    for (const type of ["image/jpeg", "image/png", "application/pdf"]) {
      expect(validateUpload({ type, size: 1000 })).toBeNull();
    }
  });
  it("rejects unsupported file types", () => {
    expect(validateUpload({ type: "application/zip", size: 1000 })).not.toBeNull();
  });
  it("rejects files over 5 MB", () => {
    expect(validateUpload({ type: "image/png", size: 6 * 1024 * 1024 })).not.toBeNull();
  });
});
