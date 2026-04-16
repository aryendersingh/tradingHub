"use client";
import Link from "next/link";
import { useEarningsCalendar } from "@/hooks/useMarketData";
import { formatPrice, formatLargeNumber } from "@/lib/formatters";
import type { EarningsCalendarEntry } from "@/lib/types";

export default function EarningsCalendar() {
  const { data, isLoading } = useEarningsCalendar();

  if (isLoading) {
    return <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3 animate-pulse h-64" />;
  }

  const events = (data || []) as EarningsCalendarEntry[];
  if (events.length === 0) return null;

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3">
      <h3 className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">
        Upcoming Earnings
      </h3>
      <div className="overflow-y-auto max-h-80">
        <table className="data-table w-full">
          <thead className="sticky top-0 bg-[var(--bg-secondary)]">
            <tr>
              <th className="text-left">Date</th>
              <th className="text-left">Symbol</th>
              <th className="text-center">Timing</th>
              <th className="text-right">EPS Est</th>
              <th className="text-right">EPS Act</th>
              <th className="text-right">Rev Est</th>
              <th className="text-right">Rev Act</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e, i) => (
              <tr key={`${e.symbol}-${e.date}-${i}`} className="hover:bg-[var(--bg-hover)]">
                <td className="text-[var(--text-muted)]">{e.date}</td>
                <td>
                  <Link href={`/stock/${e.symbol}`} className="text-[var(--accent-blue)] hover:underline font-bold">
                    {e.symbol}
                  </Link>
                </td>
                <td className="text-center text-[var(--text-muted)]">
                  {e.hour === "bmo" ? "Pre" : e.hour === "amc" ? "Post" : "—"}
                </td>
                <td className="text-right font-mono">{e.epsEstimate != null ? formatPrice(e.epsEstimate) : "—"}</td>
                <td className="text-right font-mono">{e.epsActual != null ? formatPrice(e.epsActual) : "—"}</td>
                <td className="text-right font-mono">{e.revenueEstimate != null ? formatLargeNumber(e.revenueEstimate) : "—"}</td>
                <td className="text-right font-mono">{e.revenueActual != null ? formatLargeNumber(e.revenueActual) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
