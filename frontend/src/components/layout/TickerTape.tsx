"use client";
import { useMarketOverview } from "@/hooks/useMarketData";
import { formatPrice, formatPercent, changeColor } from "@/lib/formatters";
import type { IndexData } from "@/lib/types";

export default function TickerTape() {
  const { data } = useMarketOverview();
  if (!data?.indices) return null;

  const items = Object.entries(data.indices as Record<string, IndexData>);
  // Duplicate for seamless scroll
  const allItems = [...items, ...items];

  return (
    <div className="h-6 bg-[var(--bg-primary)] border-b border-[var(--border)] overflow-hidden">
      <div className="ticker-scroll flex items-center h-full whitespace-nowrap gap-6 px-4">
        {allItems.map(([name, idx], i) => (
          <span key={`${name}-${i}`} className="inline-flex items-center gap-2 text-[11px] font-mono">
            <span className="text-[var(--text-muted)]">{name}</span>
            <span className="text-[var(--text-primary)]">{formatPrice(idx.price)}</span>
            <span className={changeColor(idx.changePercent)}>
              {formatPercent(idx.changePercent)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
