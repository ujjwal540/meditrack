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
        <span className="font-mono text-xs font-bold text-[#16A36A] dark:text-[#20C982] bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 rounded-lg whitespace-nowrap shadow-xs">
          {formatNumber(medicines.length)} {t.medicines.medicinesActiveCount}
        </span>
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
                  <Card interactive={true} className="p-4 sm:p-6 transition-all duration-200">
                    {/* Top Row: Pill icon, Title & Badges, Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Left: Icon & Medicine Info */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div className="grid h-12 w-12 sm:h-14 sm:w-14 shrink-0 place-items-center rounded-2xl bg-[#16A36A]/10 border border-[#16A36A]/25 text-[#16A36A] dark:text-[#20C982] shadow-xs">
                          <PillIcon type={m.type ?? "tablet"} size={36} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-display text-base sm:text-lg md:text-xl font-bold text-[var(--text)] break-words leading-tight">
                              {m.name}
                            </h3>
                            <span className="font-mono text-xs font-bold text-[#16A36A] dark:text-[#A3EAC1] bg-[#16A36A]/15 px-2.5 py-0.5 rounded-lg border border-[#16A36A]/30 shrink-0">
                              {m.dosage}
                            </span>
                            {m.type && (
                              <span className="text-[11px] font-semibold text-[var(--text-muted)] bg-[var(--surface-elevated)] px-2 py-0.5 rounded-md border border-[var(--border)] capitalize shrink-0">
                                {m.type}
                              </span>
                            )}
                          </div>

                          {/* Instructions callout - fully legible, never cut off */}
                          <div className="mt-2.5 flex items-start gap-2 rounded-xl bg-[var(--surface-elevated)]/70 border border-[var(--border)] px-3 py-2 text-xs text-[var(--text)]">
                            <Utensils className="h-3.5 w-3.5 text-[#16A36A] dark:text-[#20C982] mt-0.5 shrink-0" aria-hidden="true" />
                            <p className="leading-relaxed break-words font-medium">
                              {m.instructions || (isNepali ? "कुनै विशेष सल्लाह लेखिएको छैन (सामान्य निर्देशन पालना गर्नुहोस्)" : "No special directions noted. Follow standard regimen.")}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Quick Action Buttons (Always consistent & balanced) */}
                      <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)] shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDetailsId(detailsId === m.id ? null : m.id)}
                          className="text-xs py-1.5 px-3 min-h-[36px]"
                        >
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{detailsId === m.id ? t.common.hide : t.common.details}</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(m.id)}
                          className="text-xs py-1.5 px-3 min-h-[36px]"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{t.common.edit}</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          aria-label={`${t.common.delete} ${m.name}`}
                          onClick={() => remove(m.id, m.name)}
                          className="text-xs py-1.5 px-3 min-h-[36px]"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{t.common.delete}</span>
                        </Button>
                      </div>
                    </div>

                    {/* Schedule & Duration Meta Strip */}
                    <div className="mt-3.5 pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2.5 text-xs">
                      {/* Reminder times chips */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mr-1">
                          {isNepali ? "समय:" : "Times:"}
                        </span>
                        {m.times.map((time) => (
                          <span
                            key={time}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#16A36A]/10 border border-[#16A36A]/25 px-2.5 py-1 font-mono text-xs font-semibold text-[#16A36A] dark:text-[#A3EAC1]"
                          >
                            <Clock3 className="h-3 w-3 shrink-0" />
                            <span>{formatTimeDisplay(time)}</span>
                          </span>
                        ))}
                      </div>

                      {/* Course duration badge */}
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--text-muted)] bg-[var(--surface-elevated)] px-2.5 py-1 rounded-lg border border-[var(--border)]">
                        <CalendarDays className="h-3.5 w-3.5 text-[#16A36A] dark:text-[#20C982] shrink-0" />
                        <span>
                          {m.startDate} {m.endDate ? `→ ${m.endDate}` : `(${t.medicines.ongoing})`}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Details Tray */}
                    {detailsId === m.id && (
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 sm:p-5 mt-4">
                        <div className="grid gap-3.5 text-xs sm:grid-cols-2 lg:grid-cols-4">
                          <div className="flex items-start gap-2.5">
                            <Clock3 className="h-4 w-4 text-[#16A36A] dark:text-[#20C982] mt-0.5 shrink-0" aria-hidden="true" />
                            <div>
                              <strong className="block text-[var(--text)] font-bold">{t.medicines.dailyFrequency}</strong>
                              <span className="text-[var(--text-secondary)] mt-0.5 block">
                                {formatNumber(m.times.length)} {isNepali ? "पटक" : "doses daily"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <Utensils className="h-4 w-4 text-[#16A36A] dark:text-[#20C982] mt-0.5 shrink-0" aria-hidden="true" />
                            <div>
                              <strong className="block text-[var(--text)] font-bold">{t.medicines.foodInstructions}</strong>
                              <span className="text-[var(--text-secondary)] mt-0.5 block break-words">{m.instructions || (isNepali ? "कुनै छैन" : "None noted")}</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <CalendarDays className="h-4 w-4 text-[#16A36A] dark:text-[#20C982] mt-0.5 shrink-0" aria-hidden="true" />
                            <div>
                              <strong className="block text-[var(--text)] font-bold">{t.medicines.courseDuration}</strong>
                              <span className="text-[var(--text-secondary)] mt-0.5 block font-mono">
                                {m.startDate} {m.endDate ? `– ${m.endDate}` : `– ${t.medicines.ongoing}`}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5">
                            <Pill className="h-4 w-4 text-[#16A36A] dark:text-[#20C982] mt-0.5 shrink-0" aria-hidden="true" />
                            <div>
                              <strong className="block text-[var(--text)] font-bold">{t.medicines.nextDueDose}</strong>
                              <span className="text-[var(--text-secondary)] mt-0.5 block font-mono">
                                {doses.find((dose) => dose.medicineId === m.id && dose.status !== "taken")?.time
                                  ? formatTimeDisplay(doses.find((dose) => dose.medicineId === m.id && dose.status !== "taken")!.time)
                                  : t.medicines.completedForToday}
                              </span>
                            </div>
                          </div>
                        </div>

                        {m.notes && (
                          <div className="mt-3.5 text-xs text-[var(--text-secondary)] border-t border-[var(--border-subtle)] pt-2.5">
                            <strong className="text-[var(--text)] font-bold">{t.common.notes}:</strong>{" "}
                            <span className="break-words">{m.notes}</span>
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-[var(--border-subtle)]">
                          {doses
                            .filter((dose) => dose.medicineId === m.id && dose.status !== "taken")
                            .map((dose) => (
                              <span key={dose.key} className="inline-flex flex-wrap gap-2">
                                <Button size="sm" variant="primary" onClick={() => respond(dose.key, "taken")} className="text-xs py-1.5 px-3 min-h-[36px]">
                                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                  {isNepali ? `${formatTimeDisplay(dose.time)} खाएको जनाउनुहोस्` : `Mark ${formatTimeDisplay(dose.time)} Taken`}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => respond(dose.key, "snoozed", settings.snoozeMinutes)}
                                  className="text-xs py-1.5 px-3 min-h-[36px]"
                                >
                                  <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                                  {isNepali ? `${formatNumber(settings.snoozeMinutes)} मिनेट पछि` : `Snooze (${settings.snoozeMinutes}m)`}
                                </Button>
                              </span>
                            ))}
                          <Link
                            href={`/history?medicineId=${encodeURIComponent(m.id)}`}
                            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 text-xs font-semibold text-[#16A36A] dark:text-[#20C982] hover:border-[#16A36A]/40 transition-colors"
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
