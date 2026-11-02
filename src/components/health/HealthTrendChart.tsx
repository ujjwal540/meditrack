"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function HealthTrendChart({
  data,
  label,
}: {
  data: { date: string; value: number }[];
  label: string;
}) {
  if (data.length < 2) {
    return <p className="rounded-2xl bg-[#f8f6ef] p-4 text-[#707a73]">Add at least two measurements of this type to see a trend.</p>;
  }
  return (
    <div className="h-64 w-full" role="img" aria-label={`${label} trend from user-entered measurements`}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 12, right: 12, bottom: 4, left: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#355B48" strokeWidth={3} dot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
