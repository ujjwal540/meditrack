"use client";

import { useEffect, useState } from "react";
import { FileText, Plus, Trash2, Upload } from "lucide-react";
import type { Medicine } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { toISODate } from "@/utils/date-utils";
import { validateMedicine, validateUpload } from "@/utils/validation";

const input =
  "mt-1 w-full min-h-12 rounded-xl border-2 border-slate-300 bg-white px-3 text-base focus-visible:outline-3 focus-visible:outline-secondary";

export function MedicineForm({
  onSave,
}: {
  onSave: (m: Omit<Medicine, "id" | "createdAt">) => void;
}) {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [times, setTimes] = useState<string[]>(["08:00"]);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileError, setFileError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ url: string; name: string; isPdf: boolean } | null>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => setStartDate(toISODate(new Date())), []);
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
    const data = { name, dosage, instructions, startDate, endDate: endDate || undefined, times };
    const errs = validateMedicine(data);
    if (preview && !verified) errs.verified = "Please confirm the details match your prescription.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSave({ ...data, times: times.filter(Boolean), notes: notes || undefined });
    setName(""); setDosage(""); setInstructions(""); setEndDate(""); setNotes("");
    setTimes(["08:00"]); setPreview(null); setVerified(false);
  }

  const err = (k: string) =>
    errors[k] ? <p role="alert" className="mt-1 text-sm font-medium text-red-700">{errors[k]}</p> : null;

  return (
    <Card>
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2" noValidate>
        <label className="block font-medium">
          Medicine name
          <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Vitamin D" />
          {err("name")}
        </label>
        <label className="block font-medium">
          Prescribed dosage
          <input className={input} value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g. 1 tablet" />
          {err("dosage")}
        </label>
        <label className="block font-medium md:col-span-2">
          Instructions from your doctor
          <input className={input} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="e.g. After breakfast" />
        </label>
        <label className="block font-medium">
          Start date
          <input type="date" className={input} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          {err("startDate")}
        </label>
        <label className="block font-medium">
          End date (optional)
          <input type="date" className={input} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          {err("endDate")}
        </label>

        <fieldset className="md:col-span-2">
          <legend className="font-medium">Reminder times</legend>
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

        <label className="block font-medium md:col-span-2">
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
                // eslint-disable-next-line @next/next/no-img-element
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
          <Button type="submit" className="w-full md:w-auto">Save medicine and schedule</Button>
        </div>
      </form>
    </Card>
  );
}
