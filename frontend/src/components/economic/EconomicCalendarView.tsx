"use client";
import { useQuery } from "@tanstack/react-query";
import { getEconomicCalendar } from "@/lib/api";
import type { EconomicEvent } from "@/lib/types";

export default function EconomicCalendarView() {
  const { data, isLoading } = useQuery({
    queryKey: ["economic", "calendar"],
    queryFn: getEconomicCalendar,
    staleTime: 3_600_000,
  });

  const events = (data || []) as EconomicEvent[];

  if (isLoading) {
    return <div className="h-64 animate-pulse bg-[var(--bg-secondary)] rounded" />;
  }

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-4">
      <h3 className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-3">
        Economic Calendar (US)
      </h3>
      {events.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)]">No upcoming events</p>
      ) : (
        <div className="overflow-x-auto max-h-96">
          <table className="data-table w-full">
            <thead className="sticky top-0 bg-[var(--bg-secondary)]">
              <tr>
                <th className="text-left">Date</th>
                <th className="text-left">Event</th>
                <th className="text-right">Actual</th>
                <th className="text-right">Estimate</th>
                <th className="text-right">Previous</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => (
                <tr key={i} className="hover:bg-[var(--bg-hover)]">
                  <td className="text-[var(--text-muted)]">{e.date}</td>
                  <td>{e.event}</td>
                  <td className="text-right font-mono">
                    {e.actual != null ? String(e.actual) : "—"}
                  </td>
                  <td className="text-right font-mono text-[var(--text-muted)]">
                    {e.estimate != null ? String(e.estimate) : "—"}
                  </td>
                  <td className="text-right font-mono text-[var(--text-muted)]">
                    {e.previous != null ? String(e.previous) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
