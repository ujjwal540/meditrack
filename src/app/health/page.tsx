"use client";

import Link from "next/link";
import { ChevronRight, HeartPulse, Sparkles, TrendingUp } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { WeeklyChart } from "@/components/dashboard/WeeklyChart";
import { useMediTrack } from "@/components/reminders/ReminderProvider";
import { useTranslation } from "@/i18n/LanguageContext";

export default function HealthPage() {
  const { ready, stats, weekly } = useMediTrack();
  const { t, formatNumber } = useTranslation();
  const pct = stats.total ? Math.round((stats.taken / stats.total) * 100) : 0;

  return (
    <PageShell
      title={t.health.pageTitle}
      subtitle={t.health.pageSubtitle}
    >
      {!ready ? (
        <div className="skeleton h-64" aria-busy="true" />
      ) : (
        <div className="space-y-6">
          {/* Today's Overview Glass Card */}
          <Card className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 p-5 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left">
              <ProgressRing value={pct} size={120} stroke={11}>
                <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)] tabular-nums">
                  {formatNumber(pct)}%
                </span>
              </ProgressRing>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#16A36A] dark:text-[#20C982]">
                  {t.health.todayAdherenceTitle}
                </span>
                <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-[var(--text)]">
                  {formatNumber(stats.taken)} / {formatNumber(stats.total)} {t.health.confirmedDosesMsg}
                </h2>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {pct >= 80 ? t.health.optimalMsg : t.dashboard.keepGoingMsg}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-auto rounded-2xl border border-[#16A36A]/20 bg-[#16A36A]/10 px-4 sm:px-5 py-3.5 sm:py-4 text-left">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#16A36A] dark:text-[#A3EAC1]">
                <TrendingUp className="h-4 w-4 shrink-0" /> {t.health.routineHealthTitle}
              </span>
              <p className="mt-1 text-xs text-[var(--text-secondary)] max-w-xs">
                {t.health.routineHealthDesc}
              </p>
            </div>
          </Card>

          {/* Weekly Adherence Chart */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-[var(--text)]">
                  {t.health.weeklyChartTitle}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {t.health.weeklyChartSubtitle}
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
                  {t.health.clinicalNoticeTitle}
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                  {t.health.clinicalNoticeBody}
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
                {t.health.viewFullHistory}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[#16A36A] dark:group-hover:text-[#20C982] transition-colors" />
          </Link>
        </div>
      )}
    </PageShell>
  );
}

