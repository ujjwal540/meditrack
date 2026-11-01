"use client";

import { Trash2 } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MedicineForm } from "@/components/medicine/MedicineForm";
import { useMediTrack } from "@/components/reminders/ReminderProvider";
import { formatTime } from "@/utils/date-utils";

export default function MedicinesPage() {
  const { medicines, addMedicine, removeMedicine } = useMediTrack();
  return (
    <PageShell title="Medicines" subtitle="Enter exactly what your doctor prescribed.">
      <div className="space-y-8">
        <MedicineForm onSave={addMedicine} />
        <section aria-label="Your medicines">
          <h2 className="mb-3 text-2xl font-semibold">Your medicines ({medicines.length})</h2>
          {medicines.length === 0 ? (
            <Card className="text-slate-600">No medicines yet. Add your first one above.</Card>
          ) : (
            <ul className="space-y-3">
              {medicines.map((m) => (
                <li key={m.id}>
                  <Card className="flex flex-wrap items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xl font-semibold">{m.name} · {m.dosage}</p>
                      <p className="text-slate-600">{m.instructions || "No instructions added"}</p>
                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {m.times.map(formatTime).join(" · ")} · from {m.startDate}
                        {m.endDate ? ` to ${m.endDate}` : ""}
                      </p>
                    </div>
                    <Button variant="danger" aria-label={`Delete ${m.name}`} onClick={() => removeMedicine(m.id)}>
                      <Trash2 className="h-5 w-5" aria-hidden="true" /> Delete
                    </Button>
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
