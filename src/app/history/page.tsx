"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useMediTrack } from "@/components/reminders/ReminderProvider";
import { formatTime } from "@/utils/date-utils";

export default function HistoryPage() {
  const { logs, medicines } = useMediTrack();
  const names = new Map(medicines.map((m) => [m.id, m.name]));
  const rows = Object.values(logs).sort((a, b) =>
    `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`),
  );

  return (
    <PageShell title="History" subtitle="Every dose you have responded to.">
      {rows.length === 0 ? (
        <Card className="text-slate-600">No dose records yet.</Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-sm uppercase tracking-wide text-slate-600">
              <tr>
                <th className="p-3">Date</th><th className="p-3">Scheduled</th><th className="p-3">Medicine</th>
                <th className="p-3">Status</th><th className="p-3">Recorded at</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-t border-slate-100">
                  <td className="p-3">{r.date}</td>
                  <td className="p-3">{formatTime(r.time)}</td>
                  <td className="p-3 font-medium">{names.get(r.medicineId) ?? "Deleted medicine"}</td>
                  <td className="p-3"><StatusBadge dose={{ status: r.status, isDue: false }} /></td>
                  <td className="p-3">{r.recordedAt ? new Date(r.recordedAt).toLocaleTimeString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </PageShell>
  );
}
