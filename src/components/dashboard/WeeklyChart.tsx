"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function WeeklyChart({
  data,
}: {
  data: { day: string; taken: number; scheduled: number }[];
}) {
  return (
    <div
      className="h-64 w-full pt-2"
      role="img"
      aria-label="Weekly adherence chart: doses taken versus scheduled"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(163,234,193,0.08)" />
          <XAxis
            dataKey="day"
            tick={{ fill: "#A7B7AC", fontSize: 12 }}
            axisLine={{ stroke: "rgba(163,234,193,0.15)" }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#A7B7AC", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
              borderRadius: "14px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
              color: "var(--text)",
              fontSize: "12px",
            }}
            cursor={{ fill: "rgba(22,163,106,0.06)" }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
            iconType="circle"
          />
          <Bar
            dataKey="scheduled"
            name="Scheduled"
            fill="#708477"
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
          />
          <Bar
            dataKey="taken"
            name="Taken"
            fill="#16A36A"
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
