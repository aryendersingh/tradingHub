"use client";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import type { ComparisonSeries } from "@/lib/types";

const COLORS = ["#f97316", "#3b82f6", "#22c55e", "#eab308", "#a855f7"];

export default function ComparisonChart({ data }: { data: ComparisonSeries }) {
  if (!data || !data.series || data.symbols.length === 0) return null;

  // Merge all series into a single array of data points by time
  const timeMap = new Map<string, Record<string, number | string>>();
  for (const symbol of data.symbols) {
    const points = data.series[symbol] || [];
    for (const p of points) {
      if (!timeMap.has(p.time)) {
        timeMap.set(p.time, { time: p.time });
      }
      timeMap.get(p.time)![symbol] = p.value;
    }
  }

  const chartData = Array.from(timeMap.values()).sort((a, b) =>
    String(a.time).localeCompare(String(b.time))
  );

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-4">
      <h3 className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-3">
        Relative Performance (%)
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: "var(--text-muted)" }}
            axisLine={{ stroke: "var(--border)" }} tickLine={false}
            tickFormatter={(v) => typeof v === "string" ? v.slice(5) : v} />
          <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false}
            tickLine={false} width={45} tickFormatter={(v) => `${v}%`} />
          <Tooltip
            contentStyle={{
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border)",
              borderRadius: 4,
              fontSize: 12,
              color: "var(--text-primary)",
            }}
            formatter={(value: number) => [`${value.toFixed(2)}%`]}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {data.symbols.map((sym, i) => (
            <Line key={sym} type="monotone" dataKey={sym} stroke={COLORS[i % COLORS.length]}
              strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
