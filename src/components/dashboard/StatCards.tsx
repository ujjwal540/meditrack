import { CheckCircle2, Clock, Pill } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function StatCards({ total, taken, pending }: { total: number; taken: number; pending: number }) {
  const items = [
    { label: "Scheduled today", value: total, Icon: Pill },
    { label: "Taken", value: taken, Icon: CheckCircle2 },
    { label: "Pending", value: pending, Icon: Clock },
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map(({ label, value, Icon }) => (
        <Card key={label} className="text-center">
          <Icon className="mx-auto h-6 w-6 text-primary" aria-hidden="true" />
          <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-600">{label}</p>
        </Card>
      ))}
    </div>
  );
}
