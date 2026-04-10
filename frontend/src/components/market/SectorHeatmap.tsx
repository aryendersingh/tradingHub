"use client";
import { useMarketSectors } from "@/hooks/useMarketData";
import { formatPercent } from "@/lib/formatters";
import type { SectorData } from "@/lib/types";

function getHeatColor(pct: number): string {
  if (pct > 2) return "bg-green-700";
  if (pct > 1) return "bg-green-800";
  if (pct > 0.5) return "bg-green-900";
  if (pct > 0) return "bg-green-950";
  if (pct > -0.5) return "bg-red-950";
  if (pct > -1) return "bg-red-900";
  if (pct > -2) return "bg-red-800";
  return "bg-red-700";
}

export default function SectorHeatmap() {
  const { data, isLoading } = useMarketSectors();

  if (isLoading) {
    return (
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-4 h-64 animate-pulse" />
    );
  }

  const sectors: SectorData[] = data || [];

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3">
      <h3 className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">
        Sector Performance
      </h3>
      <div className="grid grid-cols-4 gap-1">
        {sectors.map((sector) => (
          <div
            key={sector.symbol}
            className={`${getHeatColor(sector.changePercent)} rounded p-2 text-center cursor-pointer hover:opacity-80 transition-opacity`}
          >
            <div className="text-[10px] text-[var(--text-primary)] font-medium truncate">
              {sector.name}
            </div>
            <div
              className={`text-xs font-mono font-bold ${
                sector.changePercent >= 0
                  ? "text-green-300"
                  : "text-red-300"
              }`}
            >
              {formatPercent(sector.changePercent)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
