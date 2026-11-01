"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function WeeklyChart({ data }: { data: { day: string; taken: number; scheduled: number }[] }) {
  return (
    <div className="h-64 w-full" role="img" aria-label="Weekly adherence chart: doses taken versus scheduled">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="scheduled" name="Scheduled" fill="#93c5fd" radius={[6, 6, 0, 0]} />
          <Bar dataKey="taken" name="Taken" fill="#0D9488" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
