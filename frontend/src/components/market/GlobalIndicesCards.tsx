"use client";
import { useGlobalIndices } from "@/hooks/useMarketData";
import { formatPrice, formatChange, formatPercent, changeColor } from "@/lib/formatters";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { GlobalIndex } from "@/lib/types";

export default function GlobalIndicesCards() {
  const { data, isLoading } = useGlobalIndices();

  if (isLoading) {
    return (
      <div className="grid grid-cols-6 gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3 animate-pulse h-20" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <div>
      <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2 block">
        Global Markets
      </span>
      <div className="grid grid-cols-6 gap-2">
        {(data as GlobalIndex[]).map((idx) => {
          const isPositive = idx.changePercent >= 0;
          return (
            <div key={idx.symbol} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3 hover:border-[var(--border-light)] transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider truncate">
                  {idx.name}
                </span>
                {isPositive ? <TrendingUp size={12} className="text-[var(--positive)]" /> : <TrendingDown size={12} className="text-[var(--negative)]" />}
              </div>
              <div className="font-mono text-sm font-medium text-[var(--text-primary)]">{formatPrice(idx.price)}</div>
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
