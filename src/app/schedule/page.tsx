"use client";

import { PageShell } from "@/components/layout/PageShell";
import { DoseList } from "@/components/reminders/DoseList";
import { useMediTrack } from "@/components/reminders/ReminderProvider";
import { useTranslation } from "@/i18n/LanguageContext";

export default function SchedulePage() {
  const { doses, respond, stats } = useMediTrack();
  const { t, formatNumber, isNepali } = useTranslation();

  return (
    <PageShell
      title={t.schedule.pageTitle}
      subtitle={t.schedule.pageSubtitle}
      action={
        <span className="font-mono text-xs font-bold text-[#16A36A] dark:text-[#20C982] bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 rounded-lg whitespace-nowrap shadow-xs">
          {formatNumber(stats.taken)} / {formatNumber(stats.total)} {t.schedule.completedTodayCount}
        </span>
      }
    >
      <div className="space-y-6">
        <DoseList doses={doses} onRespond={(k, s) => respond(k, s)} />
      </div>
    </PageShell>
  );
}
