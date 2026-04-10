"use client";
import { useYields } from "@/hooks/useMarketData";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export default function MiniYieldCurve() {
  const { data, isLoading } = useYields();

  if (isLoading || !data) {
    return (
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3 h-48 animate-pulse" />
    );
  }

  const chartData = Object.entries(data).map(([tenor, yieldVal]) => ({
    tenor,
    yield: yieldVal as number,
  }));

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3">
      <h3 className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">
        Treasury Yield Curve
      </h3>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={chartData}>
          <XAxis
            dataKey="tenor"
            tick={{ fontSize: 9, fill: "var(--text-muted)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
            width={30}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border)",
              borderRadius: 4,
              fontSize: 11,
              color: "var(--text-primary)",
            }}
            formatter={(value) => [`${Number(value).toFixed(2)}%`, "Yield"]}
          />
          <Line
            type="monotone"
            dataKey="yield"
            stroke="var(--accent-orange)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--accent-orange)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
