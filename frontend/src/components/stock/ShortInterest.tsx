"use client";
import { useShortInterest } from "@/hooks/useStockData";
import { formatLargeNumber } from "@/lib/formatters";
import type { ShortInterest as ShortInterestType } from "@/lib/types";

export default function ShortInterest({ symbol }: { symbol: string }) {
  const { data, isLoading } = useShortInterest(symbol);

  if (isLoading) {
    return <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3 animate-pulse h-28" />;
  }

  if (!data) return null;

  const si = data as ShortInterestType;

  const rows = [
    { label: "Short % of Float", value: si.shortPercentOfFloat != null ? `${(si.shortPercentOfFloat * 100).toFixed(1)}%` : "—" },
    { label: "Short Ratio (Days)", value: si.shortRatio != null ? si.shortRatio.toFixed(1) : "—" },
    { label: "Shares Short", value: formatLargeNumber(si.sharesShort) },
    { label: "Prior Month", value: formatLargeNumber(si.sharesShortPriorMonth) },
  ];

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3">
      <h3 className="text-[10px] text-[var(--accent-orange)] uppercase tracking-wider mb-2">
        Short Interest
      </h3>
      <table className="data-table w-full">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="text-[var(--text-muted)]">{row.label}</td>
              <td className="text-right font-mono">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
