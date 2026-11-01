import { describe, expect, it } from "vitest";
import type { DoseLog, Medicine } from "@/types";
import { buildDosesForDate, getDueDoses, getNextDose, summarize } from "@/utils/date-utils";

const med: Medicine = {
  id: "m1",
  name: "Test medicine",
  dosage: "1 tablet",
  instructions: "After food",
  startDate: "2026-11-01",
  endDate: "2026-11-03",
  times: ["08:00", "20:00"],
  createdAt: "2026-11-01T00:00:00Z",
};

const at = (h: number, m = 0) => new Date(2026, 10, 1, h, m);

describe("reminder logic", () => {
  it("creates one dose per reminder time", () => {
    expect(buildDosesForDate([med], {}, "2026-11-01", at(7))).toHaveLength(2);
  });

  it("does not remind before the scheduled time", () => {
    const doses = buildDosesForDate([med], {}, "2026-11-01", at(7, 59));
    expect(getDueDoses(doses, at(7, 59))).toHaveLength(0);
  });

  it("reminds at the scheduled time", () => {
    const doses = buildDosesForDate([med], {}, "2026-11-01", at(8, 0));
    expect(getDueDoses(doses, at(8, 0)).map((d) => d.time)).toEqual(["08:00"]);
  });

  it("does not remind again after Taken", () => {
    const key = "m1_2026-11-01_08:00";
    const logs: Record<string, DoseLog> = {
      [key]: { key, medicineId: "m1", date: "2026-11-01", time: "08:00", status: "taken" },
    };
    const doses = buildDosesForDate([med], logs, "2026-11-01", at(8, 5));
    expect(getDueDoses(doses, at(8, 5))).toHaveLength(0);
    expect(summarize(doses)).toEqual({ total: 2, taken: 1, pending: 1 });
  });

  it("snooze waits until snoozedUntil, then reminds once", () => {
    const key = "m1_2026-11-01_08:00";
    const until = at(8, 10).toISOString();
    const logs: Record<string, DoseLog> = {
      [key]: { key, medicineId: "m1", date: "2026-11-01", time: "08:00", status: "snoozed", snoozedUntil: until },
    };
    expect(getDueDoses(buildDosesForDate([med], logs, "2026-11-01", at(8, 5)), at(8, 5))).toHaveLength(0);
    expect(getDueDoses(buildDosesForDate([med], logs, "2026-11-01", at(8, 10)), at(8, 10))).toHaveLength(1);
  });

  it("old unanswered doses show 'not_confirmed' and do not trigger reminders", () => {
    const now = at(15, 0);
    const doses = buildDosesForDate([med], {}, "2026-11-01", now);
    expect(doses[0].status).toBe("not_confirmed");
    expect(getDueDoses(doses, now)).toHaveLength(0);
  });

  it("past schedules (outside the date range) create no doses", () => {
    expect(buildDosesForDate([med], {}, "2026-11-05", at(8))).toHaveLength(0);
    expect(buildDosesForDate([med], {}, "2026-10-31", at(8))).toHaveLength(0);
  });

  it("finds the next upcoming dose", () => {
    const now = at(9, 0);
    const doses = buildDosesForDate([med], {}, "2026-11-01", now);
    expect(getNextDose(doses, now)?.time).toBe("20:00");
  });
});
