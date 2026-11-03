"use client";

import { Check } from "lucide-react";
import { PillIcon, type MedType } from "@/components/ui/PillIcon";
import { cn } from "@/lib/utils";

const OPTIONS: { id: MedType; label: string }[] = [
  { id: "tablet", label: "Tablet" },
  { id: "capsule", label: "Capsule" },
  { id: "injection", label: "Injection" },
  { id: "other", label: "Other Form" },
];

export function MedicineTypePicker({
  value,
  onChange,
}: {
  value: MedType;
  onChange: (t: MedType) => void;
}) {
  return (
    <fieldset className="md:col-span-2">
      <legend className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
        Medication Delivery Form
      </legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {OPTIONS.map((o) => {
          const selected = value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(o.id)}
              className={cn(
                "group relative flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-sm font-bold transition-all duration-200 active:scale-95",
                selected
                  ? "border-[#16A36A] bg-[#16A36A]/15 text-[#16A36A] dark:text-[#A3EAC1] shadow-[0_0_20px_rgba(22,163,106,0.2)]"
                  : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:border-[#16A36A]/30 hover:text-[var(--text)]",
              )}
            >
              <PillIcon type={o.id} size={44} />
              <span>{o.label}</span>
              {selected && (
                <span className="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full bg-gradient-to-r from-[#16A36A] to-[#20C982] text-white">
                  <Check className="h-3 w-3 stroke-[3]" aria-hidden="true" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}