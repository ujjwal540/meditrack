"use client";

import { useState } from "react";
import { BellRing, Check } from "lucide-react";
import type { Dose } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PillIcon } from "@/components/ui/PillIcon";
import { formatTime } from "@/utils/date-utils";

export function NextMedicineCard({
  dose,
  snoozeMinutes,
  onTaken,
  onLater,
}: {
  dose?: Dose;
  snoozeMinutes: number;
  onTaken: (key: string) => void;
  onLater: (key: string) => void;
}) {
  const [done, setDone] = useState(false);

  if (!dose) {
    return (
      <Card className="bg-mint text-center">
        <p className="font-display text-3xl font-bold text-forest">All done for now 🎉</p>
        <p className="mt-1 text-xl text-muted">No more medicines are waiting. Well done!</p>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-0 bg-[#3a3d37] p-6 text-[#f4eee3]">
      {done && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-[#faf6ee]/95 text-ink" role="status">
          <div className="animate-pop text-center">
            <span className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-forest text-white">
              <Check className="h-14 w-14" aria-hidden="true" />
            </span>
            <p className="mt-3 font-display text-3xl font-bold text-forest">Well done!</p>
            <p className="text-xl text-muted">Your medicine has been marked as taken.</p>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 text-lg font-extrabold uppercase tracking-wide text-[#f4eee3]/80">
        <BellRing className="h-5 w-5" aria-hidden="true" /> Next medicine
        {dose.isDue && <span className="ml-2 rounded-full bg-accent px-3 py-0.5 text-base text-ink">Due now</span>}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-5">
        <div className="grid h-28 w-28 shrink-0 place-items-center rounded-[2rem] bg-[#6aaa92]">
          <PillIcon type={dose.type} size={80} />
        </div>
        <div className="min-w-0 flex-1 basis-48">
          <h2 className="font-display text-4xl font-extrabold leading-tight text-[#f4eee3]">{dose.medicineName}</h2>
          <p className="mt-1 text-xl text-[#f4eee3]/80">
            {dose.dosage}{dose.instructions ? ` · ${dose.instructions}` : ""}
          </p>
        </div>
        <p className="rounded-full bg-accent px-6 py-2 text-3xl font-extrabold text-ink">{formatTime(dose.time)}</p>
      </div>
      <div className="mt-6 grid gap-3">
        <Button
          size="xl"
          variant="soft"
          onClick={() => {
            setDone(true);
            onTaken(dose.key);
            setTimeout(() => setDone(false), 1800);
          }}
        >
          <Check className="h-7 w-7" aria-hidden="true" /> I Took My Medicine
        </Button>
        <Button size="xl" variant="outline" className="border-[#f4eee3]/60 bg-transparent text-[#f4eee3] hover:bg-[#f4eee3]/10" onClick={() => onLater(dose.key)}>
          Remind Me Later ({snoozeMinutes} min)
        </Button>
      </div>
    </Card>
  );
}
