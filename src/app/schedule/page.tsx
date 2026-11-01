"use client";

import { PageShell } from "@/components/layout/PageShell";
import { DoseList } from "@/components/reminders/DoseList";
import { useMediTrack } from "@/components/reminders/ReminderProvider";

export default function SchedulePage() {
  const { doses, respond } = useMediTrack();
  return (
    <PageShell title="Today's timetable" subtitle="Morning, afternoon and evening doses in order.">
      <DoseList doses={doses} onRespond={(k, s) => respond(k, s)} />
    </PageShell>
  );
}
