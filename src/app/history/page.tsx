"use client";

import { Suspense } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useMediTrack } from "@/components/reminders/ReminderProvider";
import { formatTime } from "@/utils/date-utils";
import { useSearchParams } from "next/navigation";
import { Clock } from "lucide-react";

function HistoryContent() {
  const { logs, medicines } = useMediTrack();
  const searchParams = useSearchParams();
  const medicineId = searchParams.get("medicineId");
  const names = new Map(medicines.map((m) => [m.id, m.name]));
  const rows = Object.values(logs)
    .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
    .filter((row) => !medicineId || row.medicineId === medicineId);

  return (
    <PageShell
      title="Dose History & Logs"
      subtitle={
        medicineId
          ? `Individual dose confirmation records for ${names.get(medicineId) ?? "this medication"}.`
          : "Complete audit log of all scheduled and confirmed medicine doses."
      }
    >
      {rows.length === 0 ? (
        <Card className="text-center p-8 border border-dashed border-[var(--border)]">
          <Clock className="mx-auto h-10 w-10 text-[var(--text-muted)] opacity-60" />
          <p className="mt-3 text-sm text-[var(--text-secondary)]">No dose records logged yet.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0 border border-[var(--border)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--border)] bg-[var(--surface-elevated)]/60 text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Scheduled</th>
                  <th className="p-4">Medicine</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Recorded At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {rows.map((r) => (
                  <tr
                    key={r.key}
                    className="hover:bg-[var(--surface-elevated)]/50 transition-colors"
                  >
                    <td className="p-4 font-mono tabular-nums text-[var(--text)]">
                      {r.date}
                    </td>
                    <td className="p-4 font-mono font-bold tabular-nums text-[#16A36A] dark:text-[#20C982]">
                      {formatTime(r.time)}
                    </td>
                    <td className="p-4 font-semibold text-[var(--text)]">
                      {names.get(r.medicineId) ?? "Prescription"}
                    </td>
                    <td className="p-4">
                      <StatusBadge dose={{ status: r.status, isDue: false }} />
                    </td>
                    <td className="p-4 font-mono tabular-nums text-[var(--text-muted)]">
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
