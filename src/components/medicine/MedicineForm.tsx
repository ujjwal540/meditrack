"use client";

import { useEffect, useState } from "react";
import { FileText, Plus, Trash2, Upload, X } from "lucide-react";
import type { Medicine } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MedicineTypePicker } from "@/components/medicine/MedicineTypePicker";
import type { MedType } from "@/components/ui/PillIcon";
import { toISODate } from "@/utils/date-utils";
import { validateMedicine, validateUpload } from "@/utils/validation";
import { useTranslation } from "@/i18n/LanguageContext";

const inputStyle =
  "w-full min-h-12 mt-1.5 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text)] placeholder:text-[var(--text-muted)] text-sm transition-all focus:border-[#16A36A] focus:outline-none focus:ring-2 focus:ring-[#16A36A]/20";

export function MedicineForm({
  onSave,
  initialMedicine,
  onCancel,
}: {
  onSave: (m: Omit<Medicine, "id" | "createdAt">) => void;
  initialMedicine?: Medicine;
  onCancel?: () => void;
}) {
  const { t, isNepali } = useTranslation();
  const [name, setName] = useState(initialMedicine?.name ?? "");
  const [dosage, setDosage] = useState(initialMedicine?.dosage ?? "");
  const [instructions, setInstructions] = useState(initialMedicine?.instructions ?? "");
  const [startDate, setStartDate] = useState(initialMedicine?.startDate ?? "");
  const [endDate, setEndDate] = useState(initialMedicine?.endDate ?? "");
  const [times, setTimes] = useState<string[]>(initialMedicine?.times ?? ["08:00"]);
  const [notes, setNotes] = useState(initialMedicine?.notes ?? "");
  const [type, setType] = useState<MedType>(initialMedicine?.type ?? "tablet");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileError, setFileError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ url: string; name: string; isPdf: boolean } | null>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!initialMedicine) setStartDate(toISODate(new Date()));
  }, [initialMedicine]);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview.url);
  }, [preview]);

  function onFile(file?: File) {
    if (!file) return;
    const err = validateUpload(file);
    setFileError(err);
    if (err) return setPreview(null);
    setPreview({
      url: URL.createObjectURL(file),
      name: file.name,
      isPdf: file.type === "application/pdf",
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const data = { name, dosage, instructions, startDate, endDate: endDate || undefined, times, type };
    const errs = validateMedicine(data);
    if (preview && !verified) {
      errs.verified = isNepali
        ? "कृपया भरिएको विवरण प्रेस्क्रिप्शनसँग मिलेको पुष्टि गर्नुहोस्।"
        : "Please confirm the details match your prescription.";
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSave({ ...data, times: times.filter(Boolean), notes: notes || undefined });
    if (!initialMedicine) {
      setName("");
      setDosage("");
      setInstructions("");
      setEndDate("");
      setNotes("");
      setTimes(["08:00"]);
      setType("tablet");
      setPreview(null);
      setVerified(false);
    }
  }

  const renderErr = (k: string) =>
    errors[k] ? (
      <p role="alert" className="mt-1 text-xs font-semibold text-rose-500 dark:text-[#FB7185]">
        {errors[k]}
      </p>
    ) : null;

  return (
    <Card className="relative overflow-hidden border border-[#16A36A]/25 bg-[var(--surface)] p-6 sm:p-8 backdrop-blur-xl shadow-[var(--shadow-card)]">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text)] transition-colors"
          aria-label={t.common.close}
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#16A36A]/15 text-[#16A36A] dark:text-[#A3EAC1] border border-[#16A36A]/30">
          <span className="text-lg">💊</span>
        </div>
        <div>
          <h2 className="font-display text-xl font-bold tracking-tight text-[var(--text)]">
            {initialMedicine ? t.medicines.editMedicineTitle : t.medicines.addMedicineTitle}
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            {initialMedicine ? t.medicines.editMedicineSubtitle : t.medicines.addMedicineSubtitle}
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="grid gap-5 md:grid-cols-2" noValidate>
        <MedicineTypePicker value={type} onChange={setType} />

        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          {t.medicines.nameLabel}
          <input
            className={inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.medicines.namePlaceholder}
          />
          {renderErr("name")}
        </label>

        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          {t.medicines.dosageLabel}
          <input
            className={inputStyle}
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            placeholder={t.medicines.dosagePlaceholder}
          />
          {renderErr("dosage")}
        </label>

        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] md:col-span-2">
          {t.medicines.instructionsLabel}
          <input
            className={inputStyle}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder={t.medicines.instructionsPlaceholder}
          />
        </label>

        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          {t.medicines.startDateLabel}
          <input
            type="date"
            className={inputStyle}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          {renderErr("startDate")}
        </label>

        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          {t.medicines.endDateLabel}
          <input
            type="date"
            className={inputStyle}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          {renderErr("endDate")}
        </label>

        {/* Times Timetable Picker */}
        <fieldset className="md:col-span-2">
          <legend className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
            {t.medicines.timesLabel}
          </legend>
          <div className="flex flex-wrap gap-3">
            {times.map((timeVal, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <input
                  type="time"
                  aria-label={`Reminder time ${i + 1}`}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-sm font-mono text-[#16A36A] dark:text-[#A3EAC1] focus:border-[#16A36A] focus:outline-none"
                  value={timeVal}
                  onChange={(e) =>
                    setTimes(times.map((x, j) => (j === i ? e.target.value : x)))
                  }
                />
                {times.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Remove reminder time ${i + 1}`}
                    onClick={() => setTimes(times.filter((_, j) => j !== i))}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-rose-500/15 hover:text-rose-500 hover:border-rose-500/30 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTimes([...times, "20:00"])}
              className="text-xs py-2"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" /> {t.medicines.addTime}
            </Button>
          </div>
          {renderErr("times")}
        </fieldset>

        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] md:col-span-2">
          {t.medicines.notesLabel}
          <textarea
            className={inputStyle + " py-2 h-20 resize-none"}
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.medicines.notesPlaceholder}
          />
        </label>

        {/* Prescription Attachment Preview Box */}
        <div className="md:col-span-2 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-elevated)]/40 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
            {isNepali ? "प्रेस्क्रिप्शन कागजात (ऐच्छिक)" : "Prescription Documentation (optional)"}
          </p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            {isNepali
              ? "डाक्टरको प्रेस्क्रिप्शन फोटो वा PDF यहाँ राख्न सक्नुहुन्छ।"
              : "Upload an image or PDF of your doctor prescription to review against your schedule."}
          </p>
          <label className="mt-3 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-xs font-semibold text-[var(--text)] hover:border-[#16A36A]/40 transition-colors">
            <Upload className="h-4 w-4" aria-hidden="true" /> {isNepali ? "फाइल छान्नुहोस्" : "Choose File"}
            <input
              type="file"
              className="sr-only"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </label>
          {fileError && (
            <p role="alert" className="mt-2 text-xs font-semibold text-rose-500 dark:text-[#FB7185]">
              {fileError}
            </p>
          )}
          {preview && (
            <div className="mt-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3">
              {preview.isPdf ? (
                <p className="flex items-center gap-2 text-xs text-[var(--text)]">
                  <FileText className="h-4 w-4 text-[#16A36A] dark:text-[#20C982]" aria-hidden="true" />
                  <span>{preview.name} (PDF Selected)</span>
                </p>
              ) : (
                <img
                  src={preview.url}
                  alt="Prescription preview"
                  className="block h-auto max-h-48 max-w-full rounded-lg border border-[var(--border)] object-contain"
                />
              )}
              <label className="mt-3 flex items-start gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-[var(--border)] text-[#16A36A] focus:ring-[#16A36A]"
                  checked={verified}
                  onChange={(e) => setVerified(e.target.checked)}
                />
                <span>
                  {isNepali
                    ? "म पुष्टि गर्दछु कि यी विवरणहरू डाक्टरको प्रेस्क्रिप्शनसँग मिल्छन्।"
                    : "I confirm that these entered details match my prescription."}
                </span>
              </label>
              {renderErr("verified")}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="md:col-span-2 pt-2">
          <div className="flex flex-wrap gap-3">
            <Button type="submit" size="md" variant="primary" className="px-6">
              {initialMedicine ? t.common.save : t.medicines.saveMedicine}
            </Button>
            {onCancel && (
              <Button type="button" size="md" variant="outline" onClick={onCancel}>
                {t.common.cancel}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Card>
  );
}
