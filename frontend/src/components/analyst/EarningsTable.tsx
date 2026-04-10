"use client";
import { useEarnings } from "@/hooks/useStockData";
import { formatRatio, changeColor } from "@/lib/formatters";
import type { EarningsEntry } from "@/lib/types";

export default function EarningsTable({ symbol }: { symbol: string }) {
  const { data } = useEarnings(symbol);
  const earnings = (data || []) as EarningsEntry[];

  if (!earnings.length) return null;

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3">
      <h4 className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">
        Earnings History
      </h4>
      <table className="data-table w-full">
        <thead>
          <tr>
            <th className="text-left">Date</th>
            <th className="text-right">EPS Est</th>
            <th className="text-right">EPS Act</th>
            <th className="text-right">Surprise</th>
          </tr>
        </thead>
        <tbody>
          {earnings.map((e, i) => (
            <tr key={i} className="hover:bg-[var(--bg-hover)]">
              <td>{e.date}</td>
              <td className="text-right font-mono">{formatRatio(e.epsEstimate)}</td>
              <td className="text-right font-mono">{formatRatio(e.epsActual)}</td>
              <td className={`text-right font-mono ${changeColor(e.surprise)}`}>
                {e.surprise != null ? `${e.surprise.toFixed(1)}%` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
