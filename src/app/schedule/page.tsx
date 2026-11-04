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
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-[#16A36A] dark:text-[#A3EAC1] bg-[#16A36A]/10 border border-[#16A36A]/20 px-3 py-1.5 rounded-xl">
            {formatNumber(stats.taken)} / {formatNumber(stats.total)} {t.schedule.completedTodayCount}
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
