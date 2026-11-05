"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, FileText, Plus, Trash2, Upload, X } from "lucide-react";
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
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            aria-label={isNepali ? "औषधि सूचीमा फर्कनुहोस्" : "Back to medicines"}
            title={isNepali ? "औषधि सूचीमा फर्कनुहोस्" : "Back to medicines"}
            className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[#16A36A] dark:text-[#20C982] hover:border-[#16A36A] hover:bg-[#16A36A]/10 transition-colors active:scale-95 shrink-0"
          >
            <ArrowLeft className="h-5 w-5 stroke-[2.2]" aria-hidden="true" />
          </button>
        )}
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#16A36A]/15 text-[#16A36A] dark:text-[#A3EAC1] border border-[#16A36A]/30 shrink-0">
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
          <legend className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2.5">
            {t.medicines.timesLabel}
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {times.map((timeVal, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-2 shadow-xs transition-colors hover:border-[#16A36A]/40"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="font-mono text-xs font-bold text-[var(--text-muted)] w-5 text-center shrink-0">
                    #{i + 1}
                  </span>
                  <input
                    type="time"
                    aria-label={`Reminder time ${i + 1}`}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm font-mono font-bold text-[#16A36A] dark:text-[#A3EAC1] focus:border-[#16A36A] focus:outline-none"
                    value={timeVal}
                    onChange={(e) =>
                      setTimes(times.map((x, j) => (j === i ? e.target.value : x)))
                    }
                  />
                </div>
                {times.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Remove reminder time ${i + 1}`}
                    onClick={() => setTimes(times.filter((_, j) => j !== i))}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-rose-500/15 hover:text-rose-500 hover:border-rose-500/30 transition-colors"
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
              className="min-h-[46px] text-xs font-bold border-dashed border-2 hover:border-[#16A36A] hover:bg-[#16A36A]/10"
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> {t.medicines.addTime}
            </Button>
          </div>
          {renderErr("times")}
        </fieldset>

        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] md:col-span-2">
          {t.medicines.notesLabel}
          <textarea
            className={inputStyle + " py-2.5 h-20 resize-none leading-relaxed"}
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.medicines.notesPlaceholder}
          />
        </label>

        {/* Prescription Attachment Preview Box */}
        <div className="md:col-span-2 rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--surface-elevated)]/40 p-5 sm:p-6 transition-colors hover:border-[#16A36A]/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#16A36A] dark:text-[#20C982]" />
                <span>{isNepali ? "प्रेस्क्रिप्शन कागजात (ऐच्छिक)" : "Prescription Documentation (Optional)"}</span>
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                {isNepali
                  ? "डाक्टरको प्रेस्क्रिप्शन फोटो वा PDF यहाँ राख्न सक्नुहुन्छ। ढाँचा: JPG, PNG, PDF (१० एमबी सम्म)"
                  : "Attach your doctor prescription image or PDF to verify against dosages. Supports JPG, PNG, PDF up to 10MB."}
              </p>
            </div>
            <label className="inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-xs font-bold text-[var(--text)] hover:border-[#16A36A] hover:bg-[#16A36A]/10 transition-colors shrink-0 shadow-xs">
              <Upload className="h-4 w-4 text-[#16A36A]" aria-hidden="true" />
              <span>{isNepali ? "फाइल छान्नुहोस्" : "Choose File"}</span>
              <input
                type="file"
                className="sr-only"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
            </label>
          </div>

          {fileError && (
            <p role="alert" className="mt-3 text-xs font-semibold text-rose-500 dark:text-[#FB7185]">
              {fileError}
            </p>
          )}

          {preview && (
            <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xs">
              {preview.isPdf ? (
                <div className="flex items-center gap-3 py-2">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 font-bold text-xs font-mono">
                    PDF
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[var(--text)] break-all">{preview.name}</p>
                    <span className="text-[11px] text-[var(--text-muted)] font-mono">Portable Document Format</span>
                  </div>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-black/20 p-2 max-h-56 flex justify-center">
                  <img
                    src={preview.url}
                    alt="Prescription preview"
                    className="max-h-52 w-auto object-contain rounded-lg"
                  />
                </div>
              )}
              <label className="mt-3.5 flex items-start gap-2.5 text-xs text-[var(--text)] cursor-pointer pt-3 border-t border-[var(--border-subtle)]">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-[var(--border)] text-[#16A36A] focus:ring-[#16A36A] shrink-0"
                  checked={verified}
                  onChange={(e) => setVerified(e.target.checked)}
                />
                <span className="leading-relaxed font-medium">
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
