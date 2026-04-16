"use client";
import { useIPOCalendar } from "@/hooks/useMarketData";
import { formatLargeNumber } from "@/lib/formatters";
import type { IPOEntry } from "@/lib/types";

export default function IPOCalendar() {
  const { data, isLoading } = useIPOCalendar();

  if (isLoading) {
    return <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-4 animate-pulse h-60" />;
  }

  const ipos = (data || []) as IPOEntry[];
  if (ipos.length === 0) return null;

  const statusColor = (status: string) => {
    if (status === "priced") return "text-[var(--positive)]";
    if (status === "expected") return "text-[var(--accent-blue)]";
    if (status === "filed") return "text-[var(--warning)]";
    if (status === "withdrawn") return "text-[var(--negative)]";
    return "text-[var(--text-muted)]";
  };

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-4">
      <h3 className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-3">
        IPO Calendar
      </h3>
      <div className="overflow-y-auto max-h-80">
        <table className="data-table w-full">
          <thead className="sticky top-0 bg-[var(--bg-secondary)]">
            <tr>
              <th className="text-left">Date</th>
              <th className="text-left">Name</th>
              <th className="text-left">Symbol</th>
              <th className="text-left">Exchange</th>
              <th className="text-right">Price</th>
              <th className="text-right">Value</th>
              <th className="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {ipos.slice(0, 30).map((ipo, i) => (
              <tr key={`${ipo.symbol}-${ipo.date}-${i}`} className="hover:bg-[var(--bg-hover)]">
                <td className="text-[var(--text-muted)]">{ipo.date}</td>
                <td className="text-[var(--text-primary)] max-w-[150px] truncate">{ipo.name}</td>
                <td className="font-bold text-[var(--accent-blue)]">{ipo.symbol || "—"}</td>
                <td className="text-[var(--text-muted)]">{ipo.exchange}</td>
                <td className="text-right font-mono">{ipo.price || "—"}</td>
                <td className="text-right font-mono">{ipo.totalSharesValue ? formatLargeNumber(ipo.totalSharesValue) : "—"}</td>
                <td className={`text-center text-[10px] uppercase ${statusColor(ipo.status)}`}>{ipo.status || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
