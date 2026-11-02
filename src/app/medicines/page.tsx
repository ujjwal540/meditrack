"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock3, Eye, Pencil, Pill, Trash2, Utensils } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MedicineForm } from "@/components/medicine/MedicineForm";
import { useMediTrack } from "@/components/reminders/ReminderProvider";
import { formatTime } from "@/utils/date-utils";

export default function MedicinesPage() {
  const { medicines, addMedicine, updateMedicine, removeMedicine, doses, respond, settings } = useMediTrack();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const editingMedicine = medicines.find((medicine) => medicine.id === editingId);

  function remove(id: string, name: string) {
    if (window.confirm(`Delete ${name}? This will remove it from your active schedule.`)) removeMedicine(id);
  }

  return (
    <PageShell title="Your medicines" subtitle="Keep your treatment routine clear and easy to follow.">
      <div className="space-y-8">
        {editingMedicine ? (
          <MedicineForm
            initialMedicine={editingMedicine}
            onSave={(input) => { updateMedicine(editingMedicine.id, input); setEditingId(null); }}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <MedicineForm onSave={addMedicine} />
        )}
        <section aria-label="Your medicines">
          <h2 className="mb-3 text-2xl font-semibold text-[#355b48]">Your medicines ({medicines.length})</h2>
          {medicines.length === 0 ? (
            <Card className="text-slate-600">No medicines yet. Add your first one above.</Card>
          ) : (
            <ul className="space-y-3">
              {medicines.map((m) => (
                <li key={m.id}>
                  <Card className="flex flex-wrap items-center gap-4">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#e7f1e7] text-[#355b48]"><Pill className="h-7 w-7" aria-hidden="true" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xl font-semibold text-[#26332b]">{m.name} · {m.dosage}</p>
                      <p className="text-[#707a73]">{m.instructions || "No instructions added"}</p>
                      <p className="mt-1 text-sm font-medium text-[#355b48]">
                        {m.times.map(formatTime).join(" · ")} · from {m.startDate}
                        {m.endDate ? ` to ${m.endDate}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={() => setDetailsId(detailsId === m.id ? null : m.id)}><Eye className="h-5 w-5" aria-hidden="true" /> Details</Button>
                      <Button variant="outline" onClick={() => setEditingId(m.id)}><Pencil className="h-5 w-5" aria-hidden="true" /> Edit</Button>
                      <Button variant="danger" aria-label={`Delete ${m.name}`} onClick={() => remove(m.id, m.name)}><Trash2 className="h-5 w-5" aria-hidden="true" /> Delete</Button>
                    </div>
                    {detailsId === m.id && (
                      <div className="basis-full rounded-2xl bg-[#f8f6ef] p-4">
                        <div className="grid gap-3 text-sm text-[#707a73] sm:grid-cols-2 lg:grid-cols-4">
                          <p className="flex gap-2"><Clock3 className="h-5 w-5 text-[#78947b]" aria-hidden="true" /><span><strong className="block text-[#26332b]">Frequency</strong>{m.times.length} time{m.times.length === 1 ? "" : "s"} daily</span></p>
                          <p className="flex gap-2"><Utensils className="h-5 w-5 text-[#78947b]" aria-hidden="true" /><span><strong className="block text-[#26332b]">Food instructions</strong>{m.instructions || "Not specified"}</span></p>
                          <p className="flex gap-2"><CalendarDays className="h-5 w-5 text-[#78947b]" aria-hidden="true" /><span><strong className="block text-[#26332b]">Course dates</strong>{m.startDate}{m.endDate ? ` – ${m.endDate}` : " – ongoing"}</span></p>
                          <p className="flex gap-2"><Pill className="h-5 w-5 text-[#78947b]" aria-hidden="true" /><span><strong className="block text-[#26332b]">Next reminder</strong>{doses.find((dose) => dose.medicineId === m.id && dose.status !== "taken")?.time ? formatTime(doses.find((dose) => dose.medicineId === m.id && dose.status !== "taken")!.time) : "All done today"}</span></p>
                        </div>
                        {m.notes && <p className="mt-3 text-sm text-[#707a73]"><strong className="text-[#26332b]">Notes:</strong> {m.notes}</p>}
                        <div className="mt-4 flex flex-wrap gap-2">
                          {doses.filter((dose) => dose.medicineId === m.id && dose.status !== "taken").map((dose) => (
                            <span key={dose.key} className="inline-flex flex-wrap gap-2">
                              <Button onClick={() => respond(dose.key, "taken")}><CheckCircle2 className="h-5 w-5" aria-hidden="true" /> Mark {formatTime(dose.time)} taken</Button>
                              <Button variant="outline" onClick={() => respond(dose.key, "snoozed", settings.snoozeMinutes)}><Clock3 className="h-5 w-5" aria-hidden="true" /> Snooze</Button>
                            </span>
                          ))}
                          <Link href={`/history?medicineId=${encodeURIComponent(m.id)}`} className="inline-flex min-h-12 items-center gap-2 rounded-2xl border-2 border-[#cbd8cc] bg-white px-4 font-semibold text-[#355b48]"><Eye className="h-5 w-5" aria-hidden="true" /> View history</Link>
                        </div>
                      </div>
                    )}
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </PageShell>
  );
}
