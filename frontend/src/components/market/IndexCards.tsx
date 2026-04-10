"use client";
import { useMarketOverview } from "@/hooks/useMarketData";
import { formatPrice, formatChange, formatPercent, changeColor } from "@/lib/formatters";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { IndexData } from "@/lib/types";

export default function IndexCards() {
  const { data, isLoading } = useMarketOverview();

  if (isLoading) {
    return (
      <div className="grid grid-cols-5 gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3 animate-pulse h-20" />
        ))}
      </div>
    );
  }

  if (!data?.indices) return null;

  const statusColor =
    data.marketStatus === "open"
      ? "bg-[var(--positive)]"
      : data.marketStatus === "extended"
        ? "bg-[var(--warning)]"
        : "bg-[var(--negative)]";

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${statusColor}`} />
        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
          Market {data.marketStatus}
        </span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {Object.entries(data.indices as Record<string, IndexData>).map(([name, idx]) => {
          const isPositive = (idx.changePercent ?? 0) >= 0;
          return (
            <div
              key={name}
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3 hover:border-[var(--border-light)] transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                  {name}
                </span>
                {isPositive ? (
                  <TrendingUp size={12} className="text-[var(--positive)]" />
                ) : (
                  <TrendingDown size={12} className="text-[var(--negative)]" />
                )}
              </div>
              <div className="font-mono text-sm font-medium">
                {formatPrice(idx.price)}
              </div>
              <div className={`font-mono text-xs ${changeColor(idx.changePercent)}`}>
                {formatChange(idx.change)} ({formatPercent(idx.changePercent)})
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
