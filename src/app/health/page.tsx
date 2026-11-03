"use client";

import Link from "next/link";
import { ChevronRight, HeartPulse, Sparkles, TrendingUp } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { WeeklyChart } from "@/components/dashboard/WeeklyChart";
import { useMediTrack } from "@/components/reminders/ReminderProvider";

export default function HealthPage() {
  const { ready, stats, weekly } = useMediTrack();
  const pct = stats.total ? Math.round((stats.taken / stats.total) * 100) : 0;

  return (
    <PageShell
      title="Health & Adherence"
      subtitle="Track your consistency trends and medication compliance."
    >
      {!ready ? (
        <div className="skeleton h-64" aria-busy="true" />
      ) : (
        <div className="space-y-6">
          {/* Today's Overview Glass Card */}
          <Card className="flex flex-wrap items-center justify-between gap-6 p-6 sm:p-8">
            <div className="flex items-center gap-6">
              <ProgressRing value={pct} size={130} stroke={12}>
                <span className="font-mono text-3xl font-bold tracking-tight text-[var(--text)] tabular-nums">
                  {pct}%
                </span>
              </ProgressRing>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#16A36A] dark:text-[#20C982]">
                  Today&apos;s Adherence
                </span>
                <h2 className="mt-1 font-display text-2xl font-bold text-[var(--text)]">
                  {stats.taken} of {stats.total} Doses Confirmed
                </h2>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {pct >= 80
                    ? "Optimal adherence routine. Keep up the great work!"
                    : "Consistent timing reinforces long-term wellness."}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#16A36A]/20 bg-[#16A36A]/10 px-5 py-4 text-left">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#16A36A] dark:text-[#A3EAC1]">
                <TrendingUp className="h-4 w-4" /> Routine Health
              </span>
              <p className="mt-1 text-xs text-[var(--text-secondary)] max-w-xs">
                Your medication adherence data is stored securely in your browser space.
              </p>
            </div>
          </Card>

          {/* Weekly Adherence Chart */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-[var(--text)]">
                  Weekly Adherence Overview
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Daily comparison of scheduled versus confirmed doses over the last 7 days.
                </p>
              </div>
            </div>
            <WeeklyChart data={weekly} />
          </Card>

          {/* Clinical Disclaimer Banner */}
          <Card className="border border-[#A78BFA]/25 bg-[#A78BFA]/5 p-5">
            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#A78BFA]/15 text-[#A78BFA]">
                <HeartPulse className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-[var(--text)]">
                  Clinical &amp; Safety Notice
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                  MediTrack tracks adherence routines for self-management and caregiver reassurance. MediTrack does not provide clinical diagnoses, therapeutic alterations, or substitute professional healthcare advice.
                </p>
              </div>
            </div>
          </Card>

          {/* Link to History */}
          <Link
            href="/history"
            className="group flex min-h-14 items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 backdrop-blur-xl transition-all duration-200 hover:border-[#16A36A]/40 hover:scale-[1.005] shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#16A36A]/10 text-[#16A36A] dark:text-[#20C982]">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="font-display text-sm font-bold text-[var(--text)]">
                View Complete Historical Dose Logs
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[#16A36A] dark:group-hover:text-[#20C982] transition-colors" />
          </Link>
        </div>
      )}
    </PageShell>
  );
}
