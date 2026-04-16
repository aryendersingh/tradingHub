"use client";
import { useFearGreed } from "@/hooks/useMarketData";
import type { FearGreedData } from "@/lib/types";

const LABELS: Record<string, string> = {
  vix: "VIX Level",
  momentum: "Momentum",
  safeHaven: "Safe Haven",
  breadth: "Breadth",
  putCallRatio: "Put/Call",
};

function getColor(score: number): string {
  if (score <= 20) return "var(--negative)";
  if (score <= 40) return "#f97316";
  if (score <= 60) return "#eab308";
  if (score <= 80) return "#22c55e";
  return "var(--positive)";
}

export default function FearGreedGauge() {
  const { data, isLoading } = useFearGreed();

  if (isLoading) {
    return <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3 animate-pulse h-48" />;
  }

  if (!data) return null;

  const fg = data as FearGreedData;
  const angle = (fg.score / 100) * 180 - 90;
  const color = getColor(fg.score);

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3">
      <h3 className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">
        Fear & Greed Index
      </h3>
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 200 110" className="w-full max-w-[180px]">
          <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="var(--bg-tertiary)" strokeWidth="12" strokeLinecap="round" />
          <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={`${(fg.score / 100) * 283} 283`} />
          <line x1="100" y1="100" x2={100 + 70 * Math.cos((angle * Math.PI) / 180)} y2={100 - 70 * Math.sin((-angle * Math.PI) / 180)}
            stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" />
          <circle cx="100" cy="100" r="4" fill="var(--text-primary)" />
          <text x="100" y="85" textAnchor="middle" fill={color} className="text-2xl font-bold" fontSize="24" fontFamily="monospace">{fg.score}</text>
        </svg>
        <span className="text-xs font-bold mt-1" style={{ color }}>{fg.label}</span>
      </div>
      <div className="mt-3 space-y-1">
        {Object.entries(fg.components || {}).map(([key, comp]) => (
          <div key={key} className="flex items-center justify-between text-[10px]">
            <span className="text-[var(--text-muted)]">{LABELS[key] || key}</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${comp.score}%`, backgroundColor: getColor(comp.score) }} />
              </div>
              <span className="font-mono text-[var(--text-secondary)] w-6 text-right">{comp.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
