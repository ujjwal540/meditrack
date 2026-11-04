"use client";

import { Suspense } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useMediTrack } from "@/components/reminders/ReminderProvider";
import { useTranslation } from "@/i18n/LanguageContext";
import { useSearchParams } from "next/navigation";
import { Clock } from "lucide-react";

function HistoryContent() {
  const { logs, medicines } = useMediTrack();
  const { t, formatTimeDisplay } = useTranslation();
  const searchParams = useSearchParams();
  const medicineId = searchParams.get("medicineId");
  const names = new Map(medicines.map((m) => [m.id, m.name]));
  const rows = Object.values(logs)
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
    .filter((row) => !medicineId || row.medicineId === medicineId);

  return (
    <PageShell
      title={t.history.pageTitle}
      subtitle={
        medicineId
          ? `${t.history.pageSubtitleSingle} ${names.get(medicineId) ?? ""}`
          : t.history.pageSubtitle
      }
    >
      {rows.length === 0 ? (
        <Card className="text-center p-8 border border-dashed border-[var(--border)]">
          <Clock className="mx-auto h-10 w-10 text-[var(--text-muted)] opacity-60" />
          <p className="mt-3 text-sm text-[var(--text-secondary)]">{t.history.noLogsYet}</p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0 border border-[var(--border)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--border)] bg-[var(--surface-elevated)]/60 text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-3.5 py-3 sm:px-4 sm:py-3.5 whitespace-nowrap">{t.history.colDate}</th>
                  <th className="px-3.5 py-3 sm:px-4 sm:py-3.5 whitespace-nowrap">{t.history.colScheduled}</th>
                  <th className="px-3.5 py-3 sm:px-4 sm:py-3.5 whitespace-nowrap">{t.history.colMedicine}</th>
                  <th className="px-3.5 py-3 sm:px-4 sm:py-3.5 whitespace-nowrap">{t.history.colStatus}</th>
                  <th className="px-3.5 py-3 sm:px-4 sm:py-3.5 whitespace-nowrap">{t.history.colRecordedAt}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {rows.map((r) => (
                  <tr
                    key={r.key}
                    className="hover:bg-[var(--surface-elevated)]/50 transition-colors"
                  >
                    <td className="px-3.5 py-3 sm:px-4 sm:py-3.5 font-mono tabular-nums text-[var(--text)] whitespace-nowrap">
                      {r.date}
                    </td>
                    <td className="px-3.5 py-3 sm:px-4 sm:py-3.5 font-mono font-bold tabular-nums text-[#16A36A] dark:text-[#20C982] whitespace-nowrap">
                      {formatTimeDisplay(r.time)}
                    </td>
                    <td className="px-3.5 py-3 sm:px-4 sm:py-3.5 font-semibold text-[var(--text)] whitespace-nowrap">
                      {names.get(r.medicineId) ?? "Prescription"}
                    </td>
                    <td className="px-3.5 py-3 sm:px-4 sm:py-3.5 whitespace-nowrap">
                      <StatusBadge dose={{ status: r.status, isDue: false }} />
                    </td>
                    <td className="px-3.5 py-3 sm:px-4 sm:py-3.5 font-mono tabular-nums text-[var(--text-muted)] whitespace-nowrap">
                      {r.recordedAt ? new Date(r.recordedAt).toLocaleTimeString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </PageShell>
  );
}

export default function HistoryPage() {
  return (
    <Suspense
      fallback={
        <PageShell title="Dose History" subtitle="Loading records...">
          <Card className="p-8 text-center text-sm text-[var(--text-secondary)]">Loading dose logs...</Card>
        </PageShell>
      }
    >
      <HistoryContent />
    </Suspense>
  );
}

