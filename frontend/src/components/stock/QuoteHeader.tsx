"use client";
import { useStockQuote, useStockProfile } from "@/hooks/useStockData";
import {
  formatPrice,
  formatChange,
  formatPercent,
  formatLargeNumber,
  changeColor,
} from "@/lib/formatters";

export default function QuoteHeader({ symbol }: { symbol: string }) {
  const { data: quote } = useStockQuote(symbol);
  const { data: profile } = useStockProfile(symbol);

  if (!quote) {
    return (
      <div className="bg-[var(--bg-secondary)] border-b border-[var(--border)] p-3 animate-pulse h-16" />
    );
  }

  const isPositive = (quote.changePercent ?? 0) >= 0;

  return (
    <div className="bg-[var(--bg-secondary)] border-b border-[var(--border)] px-4 py-3">
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[var(--accent-orange)] font-mono">
              {symbol}
            </span>
            {profile && (
              <span className="text-sm text-[var(--text-secondary)]">
                {profile.name}
              </span>
            )}
          </div>
          {profile && (
            <div className="text-[10px] text-[var(--text-muted)]">
              {profile.sector} &middot; {profile.industry} &middot; {profile.exchange}
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-3 ml-auto">
          <span className={`text-2xl font-mono font-bold ${isPositive ? "glow-positive" : "glow-negative"}`}>
            {formatPrice(quote.price)}
          </span>
          <span className={`text-sm font-mono ${changeColor(quote.change)}`}>
            {formatChange(quote.change)}
          </span>
          <span className={`text-sm font-mono ${changeColor(quote.changePercent)}`}>
            ({formatPercent(quote.changePercent)})
          </span>
        </div>

        {(quote.preMarketPrice || quote.postMarketPrice) && (
          <div className="flex items-center gap-3 text-xs font-mono">
            {quote.preMarketPrice && (
              <span className="text-[var(--text-muted)]">
                Pre:{" "}
                <span className={changeColor(quote.preMarketChange)}>
                  {formatPrice(quote.preMarketPrice)} ({formatPercent(quote.preMarketChangePercent)})
                </span>
              </span>
            )}
            {quote.postMarketPrice && (
              <span className="text-[var(--text-muted)]">
                Post:{" "}
                <span className={changeColor(quote.postMarketChange)}>
                  {formatPrice(quote.postMarketPrice)} ({formatPercent(quote.postMarketChangePercent)})
                </span>
              </span>
            )}
          </div>
        )}

        <div className="flex gap-6 text-xs font-mono">
          <div>
            <span className="text-[var(--text-muted)]">Open </span>
            <span>{formatPrice(quote.open)}</span>
          </div>
          <div>
            <span className="text-[var(--text-muted)]">High </span>
            <span>{formatPrice(quote.high)}</span>
          </div>
          <div>
            <span className="text-[var(--text-muted)]">Low </span>
            <span>{formatPrice(quote.low)}</span>
          </div>
          <div>
            <span className="text-[var(--text-muted)]">Prev </span>
            <span>{formatPrice(quote.previousClose)}</span>
          </div>
          {profile && (
            <>
              <div>
                <span className="text-[var(--text-muted)]">MCap </span>
                <span>{formatLargeNumber(profile.marketCap)}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Vol </span>
                <span>{formatLargeNumber(profile.avgVolume)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
