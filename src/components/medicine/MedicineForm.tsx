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

const input = "form-input";

export function MedicineForm({
  onSave,
  initialMedicine,
  onCancel,
}: {
  onSave: (m: Omit<Medicine, "id" | "createdAt">) => void;
  initialMedicine?: Medicine;
  onCancel?: () => void;
}) {
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
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview.url); }, [preview]);

  function onFile(file?: File) {
    if (!file) return;
    const err = validateUpload(file);
    setFileError(err);
    if (err) return setPreview(null);
    setPreview({ url: URL.createObjectURL(file), name: file.name, isPdf: file.type === "application/pdf" });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const data = { name, dosage, instructions, startDate, endDate: endDate || undefined, times, type };
    const errs = validateMedicine(data);
    if (preview && !verified) errs.verified = "Please confirm the details match your prescription.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSave({ ...data, times: times.filter(Boolean), notes: notes || undefined });
    if (!initialMedicine) {
      setName(""); setDosage(""); setInstructions(""); setEndDate(""); setNotes("");
      setTimes(["08:00"]); setType("tablet"); setPreview(null); setVerified(false);
    }
  }

  const err = (k: string) =>
    errors[k] ? <p role="alert" className="mt-1 text-sm font-medium text-red-700">{errors[k]}</p> : null;

  return (
    <Card className="relative">
      {onCancel && (
        <button type="button" onClick={onCancel} className="icon-button absolute right-4 top-4" aria-label="Close medicine editor">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
      <div className="mb-5 flex items-center gap-3">
        <span className="icon-badge text-2xl" aria-hidden="true">💊</span>
        <div>
          <h2 className="text-xl font-bold text-[#355b48]">{initialMedicine ? "Edit medicine" : "Add a medicine"}</h2>
          <p className="text-sm text-[#707a73]">Step 1 of 1 · Enter the details exactly as prescribed.</p>
        </div>
      </div>
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2" noValidate>
        <MedicineTypePicker value={type} onChange={setType} />
        <label className="form-label block">
          Medicine name
          <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Vitamin D" />
          {err("name")}
        </label>
        <label className="form-label block">
          Prescribed dosage
          <input className={input} value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g. 1 tablet" />
          {err("dosage")}
        </label>
        <label className="form-label block md:col-span-2">
          Instructions from your doctor
          <input className={input} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="e.g. After breakfast" />
        </label>
        <label className="form-label block">
          Start date
          <input type="date" className={input} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          {err("startDate")}
        </label>
        <label className="form-label block">
          End date (optional)
          <input type="date" className={input} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          {err("endDate")}
        </label>

        <fieldset className="md:col-span-2">
        <legend className="form-label">Reminder times</legend>
          <div className="mt-1 flex flex-wrap gap-3">
            {times.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="time"
                  aria-label={`Reminder time ${i + 1}`}
                  className={input + " !mt-0 w-36"}
                  value={t}
                  onChange={(e) => setTimes(times.map((x, j) => (j === i ? e.target.value : x)))}
                />
                {times.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Remove reminder time ${i + 1}`}
                    onClick={() => setTimes(times.filter((_, j) => j !== i))}
                    className="grid h-12 w-12 place-items-center rounded-xl border-2 border-slate-300 hover:bg-slate-100"
                  >
                    <Trash2 className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => setTimes([...times, "20:00"])}>
              <Plus className="h-5 w-5" aria-hidden="true" /> Add time
            </Button>
          </div>
          {err("times")}
        </fieldset>

        <label className="form-label block md:col-span-2">
          Notes (optional)
          <textarea className={input + " py-2"} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>

        <div className="md:col-span-2 rounded-xl border-2 border-dashed border-slate-300 p-4">
          <p className="font-medium">Prescription (optional)</p>
          <p className="text-sm text-slate-600">
            Upload a JPG, PNG or PDF to keep next to your entry. Type the details yourself and check them
            against the prescription. MediTrack does not read prescriptions automatically.
          </p>
          <label className="mt-3 inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-2 border-slate-300 px-4 font-semibold hover:bg-slate-100">
            <Upload className="h-5 w-5" aria-hidden="true" /> Choose file
            <input type="file" className="sr-only" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
          {fileError && <p role="alert" className="mt-2 text-sm font-medium text-red-700">{fileError}</p>}
          {preview && (
            <div className="mt-3">
              {preview.isPdf ? (
                <p className="flex items-center gap-2"><FileText className="h-5 w-5" aria-hidden="true" /> {preview.name} (PDF selected)</p>
              ) : (
                <img src={preview.url} alt="Prescription preview" className="max-h-64 rounded-lg border" />
              )}
              <label className="mt-3 flex items-start gap-2">
                <input type="checkbox" className="mt-1 h-5 w-5" checked={verified} onChange={(e) => setVerified(e.target.checked)} />
                <span>I have checked that the details above match my prescription.</span>
              </label>
              {err("verified")}
              <p className="mt-1 text-xs text-slate-500">Demo mode: the file is previewed only. Secure storage arrives with Supabase Storage on Day 3–4.</p>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="flex flex-wrap gap-3">
            <Button type="submit" className="w-full md:w-auto">{initialMedicine ? "Save changes" : "Save medicine and schedule"}</Button>
            {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
          </div>
        </div>
      </form>
    </Card>
  );
}
