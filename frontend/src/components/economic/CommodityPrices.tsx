"use client";
import { useCommodities } from "@/hooks/useMarketData";
import { formatPrice, formatChange, formatPercent, changeColor } from "@/lib/formatters";
import type { CommodityData } from "@/lib/types";

export default function CommodityPrices() {
  const { data, isLoading } = useCommodities();

  if (isLoading) {
    return <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-4 animate-pulse h-60" />;
  }

  const items = (data || []) as CommodityData[];
  if (items.length === 0) return null;

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-4">
      <h3 className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-3">
        Commodities
      </h3>
      <table className="data-table w-full">
        <thead>
          <tr>
            <th className="text-left">Name</th>
            <th className="text-right">Price</th>
            <th className="text-right">Change</th>
            <th className="text-right">%</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.symbol} className="hover:bg-[var(--bg-hover)]">
              <td className="font-bold text-[var(--text-primary)]">{c.name}</td>
              <td className="text-right font-mono">{formatPrice(c.price)}</td>
              <td className={`text-right font-mono ${changeColor(c.change)}`}>{formatChange(c.change)}</td>
              <td className={`text-right font-mono ${changeColor(c.changePercent)}`}>{formatPercent(c.changePercent)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
