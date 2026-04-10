"use client";
import { useRatings, usePriceTargets } from "@/hooks/useStockData";
import { formatPrice } from "@/lib/formatters";
import type { AnalystRatings, PriceTargets } from "@/lib/types";

export default function RatingsChart({ symbol }: { symbol: string }) {
  const { data: ratings } = useRatings(symbol);
  const { data: targets } = usePriceTargets(symbol);

  const r = ratings as AnalystRatings | undefined;
  const t = targets as PriceTargets | undefined;

  if (!r) return null;

  const total = r.strongBuy + r.buy + r.hold + r.sell + r.strongSell;
  const bars = [
    { label: "Strong Buy", value: r.strongBuy, color: "bg-green-500" },
    { label: "Buy", value: r.buy, color: "bg-green-700" },
    { label: "Hold", value: r.hold, color: "bg-yellow-600" },
    { label: "Sell", value: r.sell, color: "bg-red-700" },
    { label: "Strong Sell", value: r.strongSell, color: "bg-red-500" },
  ];

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3">
      <h4 className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-3">
        Analyst Ratings
      </h4>

      <div className="space-y-1 mb-4">
        {bars.map((bar) => (
          <div key={bar.label} className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--text-muted)] w-20">{bar.label}</span>
            <div className="flex-1 h-4 bg-[var(--bg-tertiary)] rounded overflow-hidden">
              <div
                className={`h-full ${bar.color} rounded`}
                style={{ width: `${total > 0 ? (bar.value / total) * 100 : 0}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-[var(--text-secondary)] w-6 text-right">
              {bar.value}
            </span>
          </div>
        ))}
      </div>

      {t && (
        <div>
          <h4 className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Price Targets
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Low", value: t.low },
              { label: "Mean", value: t.mean },
              { label: "Median", value: t.median },
              { label: "High", value: t.high },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-[10px] text-[var(--text-muted)]">{label}</div>
                <div className="text-xs font-mono">{formatPrice(value)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
