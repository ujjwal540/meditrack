"use client";

import { PageShell } from "@/components/layout/PageShell";
import { DoseList } from "@/components/reminders/DoseList";
import { useMediTrack } from "@/components/reminders/ReminderProvider";

export default function SchedulePage() {
  const { doses, respond, stats } = useMediTrack();

  return (
    <PageShell
      title="Daily Medication Timetable"
      subtitle="Morning, afternoon, evening, and bedtime scheduled doses."
      action={
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-[#16A36A] dark:text-[#A3EAC1] bg-[#16A36A]/10 border border-[#16A36A]/20 px-3 py-1.5 rounded-xl">
            {stats.taken} of {stats.total} Completed Today
          </span>
        </div>
      }
    >
      <div className="space-y-6">
        <DoseList doses={doses} onRespond={(k, s) => respond(k, s)} />
      </div>
    </PageShell>
  );
}
