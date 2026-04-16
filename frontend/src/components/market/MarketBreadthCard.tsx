"use client";
import { useMarketBreadth } from "@/hooks/useMarketData";
import type { MarketBreadth } from "@/lib/types";

export default function MarketBreadthCard() {
  const { data, isLoading } = useMarketBreadth();

  if (isLoading) {
    return <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3 animate-pulse h-36" />;
  }

  if (!data) return null;

  const b = data as MarketBreadth;
  const advPct = b.advancing + b.declining > 0 ? (b.advancing / (b.advancing + b.declining)) * 100 : 50;

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3">
      <h3 className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-3">
        Market Breadth
      </h3>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-[var(--positive)]">Advancing: {b.advancing}</span>
            <span className="text-[var(--negative)]">Declining: {b.declining}</span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden bg-[var(--bg-tertiary)]">
            <div className="bg-[var(--positive)]" style={{ width: `${advPct}%` }} />
            <div className="bg-[var(--negative)]" style={{ width: `${100 - advPct}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-[var(--text-muted)]">Above 200 SMA</span>
            <span className="text-[var(--text-secondary)] font-mono">{b.pctAbove200SMA}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-[var(--bg-tertiary)]">
            <div className="h-full bg-[var(--accent-blue)] rounded-full" style={{ width: `${b.pctAbove200SMA}%` }} />
          </div>
        </div>
        <div className="flex justify-between text-[10px]">
          <span>
            <span className="text-[var(--text-muted)]">New Highs: </span>
            <span className="text-[var(--positive)] font-mono">{b.newHighs}</span>
          </span>
          <span>
            <span className="text-[var(--text-muted)]">New Lows: </span>
            <span className="text-[var(--negative)] font-mono">{b.newLows}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
