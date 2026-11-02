"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, HeartPulse } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { WeeklyChart } from "@/components/dashboard/WeeklyChart";
import { useMediTrack } from "@/components/reminders/ReminderProvider";

export default function HealthPage() {
  const { ready, stats, weekly } = useMediTrack();
  const pct = stats.total ? Math.round((stats.taken / stats.total) * 100) : 0;

  return (
    <PageShell title="Health" subtitle="Your medicine progress at a glance.">
      {!ready ? (
        <div className="skeleton h-64" aria-busy="true" />
      ) : (
        <div className="space-y-6">
          <Card className="soft-card">
            <div className="health-today-grid">
              <div className="health-progress">
                <ProgressRing value={pct} size={150}>
                  <span className="font-display text-4xl font-extrabold text-forest">{pct}%</span>
                </ProgressRing>
              </div>
              <div className="health-today-copy">
                <h2 className="font-display text-3xl font-bold text-forest">Today</h2>
                <p className="text-2xl font-bold">
                  {stats.taken} of {stats.total} medicines taken
                </p>
                <p className="text-xl text-muted">You&apos;re doing great. Keep going!</p>
              </div>
              <div className="health-today-art">
                <Image
                  src="/images/illustrations/health-wellness.png"
                  alt="Illustration representing health and wellness"
                  width={1200}
                  height={1189}
                  className="illustration"
                />
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 font-display text-3xl font-bold text-forest">This week</h2>
            <WeeklyChart data={weekly} />
          </Card>

          <Card className="bg-mint">
            <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-forest">
              <HeartPulse className="h-7 w-7" aria-hidden="true" /> Your health notes
            </h2>
            <p className="mt-2 text-xl">
              No measurements added yet. Anything you add yourself will be marked{" "}
              <strong>“Entered by you”</strong>. MediTrack does not give diagnoses or medical advice.
            </p>
          </Card>

          <Link
            href="/history"
            className="flex min-h-16 items-center justify-between rounded-[1.5rem] bg-white p-5 text-xl font-extrabold text-forest shadow-soft"
          >
            See medicine history <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </Link>
        </div>
      )}
    </PageShell>
  );
}
