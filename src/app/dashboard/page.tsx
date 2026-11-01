"use client";

import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { StatCards } from "@/components/dashboard/StatCards";
import { WeeklyChart } from "@/components/dashboard/WeeklyChart";
import { DoseList } from "@/components/reminders/DoseList";
import { useMediTrack } from "@/components/reminders/ReminderProvider";
import { formatTime } from "@/utils/date-utils";

export default function DashboardPage() {
  const { ready, now, doses, stats, nextDose, weekly, respond, notificationPermission, requestNotifications } =
    useMediTrack();

  return (
    <PageShell
      title="Today's medicine"
      subtitle={now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
      action={
        <Link href="/medicines" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-5 font-semibold text-white hover:bg-teal-700">
          <Plus className="h-5 w-5" aria-hidden="true" /> Add medicine
        </Link>
      }
    >
      {!ready ? (
        <p>Loading…</p>
      ) : (
        <div className="space-y-6">
          {notificationPermission === "default" && (
            <Card className="flex flex-wrap items-center justify-between gap-3 border-amber-300 bg-amber-50">
              <p className="text-lg">Enable alerts so MediTrack can use notifications, sound, and vibration while it is open.</p>
              <button onClick={requestNotifications} className="min-h-12 rounded-xl bg-secondary px-5 font-semibold text-white">
                Enable alerts
              </button>
            </Card>
          )}
          <StatCards {...stats} />
          <Card>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Next reminder</p>
            <p className="mt-1 text-2xl font-bold">
              {nextDose ? `${nextDose.medicineName} at ${formatTime(nextDose.time)}` : "Nothing more scheduled today"}
            </p>
          </Card>
          <DoseList doses={doses} onRespond={(k, s) => respond(k, s)} />
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <h2 className="mb-3 text-xl font-semibold">Weekly adherence</h2>
              <WeeklyChart data={weekly} />
            </Card>
            <Card>
              <h2 className="mb-2 flex items-center gap-2 text-xl font-semibold">
                <Users className="h-5 w-5" aria-hidden="true" /> Family connection
              </h2>
              <p className="text-slate-600">Let a family member see your dose status, only with your permission.</p>
              <Link href="/family" className="mt-3 inline-block font-semibold text-secondary underline">Manage family</Link>
            </Card>
          </div>
          <p className="text-sm text-slate-500">
            Reminders work while MediTrack is open in your browser. Background reminders need push notifications (planned).
          </p>
        </div>
      )}
    </PageShell>
  );
}
