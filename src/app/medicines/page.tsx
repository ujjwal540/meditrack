"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Pencil,
  Pill,
  Trash2,
  Utensils,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MedicineForm } from "@/components/medicine/MedicineForm";
import { PillIcon } from "@/components/ui/PillIcon";
import { useMediTrack } from "@/components/reminders/ReminderProvider";
import { useTranslation } from "@/i18n/LanguageContext";

export default function MedicinesPage() {
  const {
    medicines,
    addMedicine,
    updateMedicine,
    removeMedicine,
    doses,
    respond,
    settings,
  } = useMediTrack();
  const { t, isNepali, formatNumber, formatTimeDisplay } = useTranslation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const editingMedicine = medicines.find((medicine) => medicine.id === editingId);

  function remove(id: string, name: string) {
    const prompt = isNepali
      ? `${name} हटाउन चाहनुहुन्छ? यो औषधि दैनिक तालिकाबाट हट्नेछ।`
      : `Delete ${name}? This will remove it from your active daily schedule.`;
    if (window.confirm(prompt)) {
      removeMedicine(id);
    }
  }

  return (
    <PageShell
      title={t.medicines.pageTitle}
      subtitle={t.medicines.pageSubtitle}
      action={
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-[#16A36A] dark:text-[#A3EAC1] bg-[#16A36A]/10 border border-[#16A36A]/20 px-3 py-1.5 rounded-xl">
            {formatNumber(medicines.length)} {t.medicines.medicinesActiveCount}
          </span>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Editor or Creator Form */}
        {editingMedicine ? (
          <MedicineForm
            initialMedicine={editingMedicine}
            onSave={(input) => {
              updateMedicine(editingMedicine.id, input);
              setEditingId(null);
            }}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <MedicineForm onSave={addMedicine} />
        )}

        {/* Medicines List Section */}
        <section aria-label={t.medicines.prescriptionsHeading}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)]">
              {t.medicines.prescriptionsHeading} ({formatNumber(medicines.length)})
            </h2>
          </div>

          {medicines.length === 0 ? (
            <Card className="text-center p-8 border border-dashed border-[var(--border)]">
              <Pill className="mx-auto h-12 w-12 text-[var(--text-muted)] opacity-60" />
              <p className="mt-3 text-sm text-[var(--text-secondary)]">
                {t.medicines.noMedicinesConfigured}
              </p>
            </Card>
          ) : (
            <ul className="space-y-3.5">
              {medicines.map((m) => (
                <li key={m.id}>
                  <Card interactive={true} className="flex flex-wrap items-center gap-3.5 sm:gap-4 p-4 sm:p-5">
                    {/* Icon */}
                    <div className="grid h-11 w-11 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-xl bg-[#16A36A]/10 border border-[#16A36A]/20">
                      <PillIcon type={m.type ?? "tablet"} size={32} />
                    </div>

                    {/* Basic Info */}
                    <div className="min-w-0 flex-1 basis-56">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-base sm:text-lg font-bold text-[var(--text)] truncate">
                          {m.name}
                        </h3>
                        <span className="font-mono text-[11px] sm:text-xs text-[#16A36A] dark:text-[#A3EAC1] font-semibold bg-[#16A36A]/10 px-2 py-0.5 rounded-md border border-[#16A36A]/20">
                          {m.dosage}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-[var(--text-secondary)] truncate">
                        {m.instructions || (isNepali ? "कुनै विशेष सल्लाह लेखिएको छैन" : "No specific instructions specified")}
                      </p>
                      <p className="mt-1 font-mono text-[11px] text-[var(--text-muted)]">
                        {m.times.map(formatTimeDisplay).join(" · ")} · {isNepali ? "सुरु:" : "from"} {m.startDate}
                        {m.endDate ? ` ${isNepali ? "देखि" : "to"} ${m.endDate}` : ""}
                      </p>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex w-full sm:w-auto flex-wrap items-center justify-start sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)] shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDetailsId(detailsId === m.id ? null : m.id)}
                        className="text-xs py-1.5 px-3"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{detailsId === m.id ? t.common.hide : t.common.details}</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(m.id)}
                        className="text-xs py-1.5 px-3"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{t.common.edit}</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        aria-label={`${t.common.delete} ${m.name}`}
                        onClick={() => remove(m.id, m.name)}
                        className="text-xs py-1.5 px-3"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{t.common.delete}</span>
                      </Button>
                    </div>

                    {/* Expandable Details Tray */}
                    {detailsId === m.id && (
                      <div className="basis-full rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 mt-2">
                        <div className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
                          <div className="flex items-start gap-2.5">
                            <Clock3 className="h-4 w-4 text-[#16A36A] dark:text-[#20C982] mt-0.5 shrink-0" aria-hidden="true" />
                            <div>
                              <strong className="block text-[var(--text)]">{t.medicines.dailyFrequency}</strong>
                              <span className="text-[var(--text-secondary)]">
                                {formatNumber(m.times.length)} {isNepali ? "पटक" : "doses daily"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <Utensils className="h-4 w-4 text-[#16A36A] dark:text-[#20C982] mt-0.5 shrink-0" aria-hidden="true" />
                            <div>
                              <strong className="block text-[var(--text)]">{t.medicines.foodInstructions}</strong>
                              <span className="text-[var(--text-secondary)]">{m.instructions || (isNepali ? "कुनै छैन" : "None noted")}</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <CalendarDays className="h-4 w-4 text-[#16A36A] dark:text-[#20C982] mt-0.5 shrink-0" aria-hidden="true" />
                            <div>
                              <strong className="block text-[var(--text)]">{t.medicines.courseDuration}</strong>
                              <span className="text-[var(--text-secondary)]">
                                {m.startDate} {m.endDate ? `– ${m.endDate}` : `– ${t.medicines.ongoing}`}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <Pill className="h-4 w-4 text-[#16A36A] dark:text-[#20C982] mt-0.5 shrink-0" aria-hidden="true" />
                            <div>
                              <strong className="block text-[var(--text)]">{t.medicines.nextDueDose}</strong>
                              <span className="text-[var(--text-secondary)]">
                                {doses.find((dose) => dose.medicineId === m.id && dose.status !== "taken")?.time
                                  ? formatTimeDisplay(doses.find((dose) => dose.medicineId === m.id && dose.status !== "taken")!.time)
                                  : t.medicines.completedForToday}
                              </span>
                            </div>
                          </div>
                        </div>

                        {m.notes && (
                          <p className="mt-3 text-xs text-[var(--text-secondary)] border-t border-[var(--border-subtle)] pt-2">
                            <strong className="text-[var(--text)]">{t.common.notes}:</strong> {m.notes}
                          </p>
                        )}

                        <div className="mt-3.5 flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
                          {doses
                            .filter((dose) => dose.medicineId === m.id && dose.status !== "taken")
                            .map((dose) => (
                              <span key={dose.key} className="inline-flex flex-wrap gap-2">
                                <Button size="sm" variant="primary" onClick={() => respond(dose.key, "taken")} className="text-xs py-1.5 px-3">
                                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                  {isNepali ? `${formatTimeDisplay(dose.time)} खाएको जनाउनुहोस्` : `Mark ${formatTimeDisplay(dose.time)} Taken`}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => respond(dose.key, "snoozed", settings.snoozeMinutes)}
                                  className="text-xs py-1.5 px-3"
                                >
                                  <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                                  {isNepali ? `${formatNumber(settings.snoozeMinutes)} मिनेट पछि` : `Snooze (${settings.snoozeMinutes}m)`}
                                </Button>
                              </span>
                            ))}
                          <Link
                            href={`/history?medicineId=${encodeURIComponent(m.id)}`}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 text-xs font-semibold text-[#16A36A] dark:text-[#20C982] hover:border-[#16A36A]/40 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" /> {t.medicines.doseHistory}
                          </Link>
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
