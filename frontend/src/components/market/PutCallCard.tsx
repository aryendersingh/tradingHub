"use client";
import { usePutCallRatio } from "@/hooks/useMarketData";
import type { PutCallRatio } from "@/lib/types";

export default function PutCallCard() {
  const { data, isLoading } = usePutCallRatio();

  if (isLoading) {
    return <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3 animate-pulse h-24" />;
  }

  if (!data) return null;

  const pc = data as PutCallRatio;
  const signalColor =
    pc.signal === "Bullish" ? "var(--positive)" :
    pc.signal === "Bearish" ? "var(--negative)" : "var(--warning)";

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3">
      <h3 className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">
        Put/Call Ratio
      </h3>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-mono font-bold text-[var(--text-primary)]">
            {pc.ratio != null ? pc.ratio.toFixed(2) : "\u2014"}
          </div>
          <div className="text-xs font-bold mt-1" style={{ color: signalColor }}>
            {pc.signal}
          </div>
        </div>
        <div className="text-[10px] text-[var(--text-muted)] text-right">
          <div>&lt;0.7 = Bullish</div>
          <div>&gt;1.0 = Bearish</div>
        </div>
      </div>
    </div>
  );
}
