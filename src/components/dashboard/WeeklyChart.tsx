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
import { useTranslation } from "@/i18n/LanguageContext";

const NEPALI_DAY_MAP: Record<string, string> = {
  Sun: "आइत",
  Mon: "सोम",
  Tue: "मङ्गल",
  Wed: "बुध",
  Thu: "बिही",
  Fri: "शुक्र",
  Sat: "शनि",
  Sunday: "आइतबार",
  Monday: "सोमबार",
  Tuesday: "मङ्गलबार",
  Wednesday: "बुधबार",
  Thursday: "बिहीबार",
  Friday: "शुक्रबार",
  Saturday: "शनिबार",
};

export function WeeklyChart({
  data,
}: {
  data: { day: string; taken: number; scheduled: number }[];
}) {
  const { t, isNepali, formatNumber } = useTranslation();

  const chartData = data.map((d) => ({
    ...d,
    displayDay: isNepali && NEPALI_DAY_MAP[d.day] ? NEPALI_DAY_MAP[d.day] : d.day,
  }));

  return (
    <div
      className="h-64 w-full pt-2"
      role="img"
      aria-label={t.health.weeklyChartTitle}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(163,234,193,0.08)" />
          <XAxis
            dataKey="displayDay"
            tick={{ fill: "#A7B7AC", fontSize: 12 }}
            axisLine={{ stroke: "rgba(163,234,193,0.15)" }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#A7B7AC", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => formatNumber(val)}
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
            formatter={(value: any, name: any) => [
              formatNumber(value),
              name === "scheduled" ? t.health.scheduledLegend : t.health.takenLegend,
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
            iconType="circle"
          />
          <Bar
            dataKey="scheduled"
            name={t.health.scheduledLegend}
            fill="#708477"
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
          />
          <Bar
            dataKey="taken"
            name={t.health.takenLegend}
            fill="#16A36A"
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

