"use client";
import { useYields } from "@/hooks/useMarketData";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function YieldCurve() {
  const { data, isLoading } = useYields();

  if (isLoading || !data) {
    return <div className="h-80 animate-pulse bg-[var(--bg-secondary)] rounded" />;
  }

  const chartData = Object.entries(data).map(([tenor, yieldVal]) => ({
    tenor,
    yield: yieldVal as number,
  }));

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-4">
      <h3 className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-3">
        US Treasury Yield Curve
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-orange)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--accent-orange)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="tenor"
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
            width={40}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border)",
              borderRadius: 4,
              fontSize: 12,
              color: "var(--text-primary)",
            }}
            formatter={(value) => [`${Number(value).toFixed(3)}%`, "Yield"]}
          />
          <Area
            type="monotone"
            dataKey="yield"
            stroke="var(--accent-orange)"
            strokeWidth={2}
            fill="url(#yieldGrad)"
            dot={{ r: 4, fill: "var(--accent-orange)", stroke: "var(--bg-secondary)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
