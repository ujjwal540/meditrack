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
    return (
      <p className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 text-xs text-[var(--text-secondary)]">
        Add at least two measurements of this type to see a trend chart.
      </p>
    );
  }
  return (
    <div className="h-64 w-full" role="img" aria-label={`${label} trend from user-entered measurements`}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 12, right: 12, bottom: 4, left: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#A7B7AC" }} />
          <YAxis tick={{ fontSize: 12, fill: "#A7B7AC" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
              borderRadius: "14px",
              color: "var(--text)",
              fontSize: "12px",
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#16A36A"
            strokeWidth={3}
            dot={{ r: 4, fill: "#20C982", strokeWidth: 2, stroke: "#10251A" }}
            activeDot={{ r: 6, fill: "#20C982" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
