"use client";
import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { useStockQuote } from "@/hooks/useStockData";
import Link from "next/link";
import { formatPrice, formatPercent, formatLargeNumber, changeColor } from "@/lib/formatters";
import { Plus, Trash2 } from "lucide-react";
import type { PortfolioPosition } from "@/lib/types";

function PositionRow({ pos, onRemove }: { pos: PortfolioPosition; onRemove: () => void }) {
  const { data: quote } = useStockQuote(pos.symbol);
  const currentPrice = quote?.price ?? 0;
  const marketValue = pos.shares * currentPrice;
  const totalCost = pos.shares * pos.costBasis;
  const pnl = marketValue - totalCost;
  const pnlPct = totalCost > 0 ? (pnl / totalCost) * 100 : 0;

  return (
    <tr className="hover:bg-[var(--bg-hover)]">
      <td>
        <Link href={`/stock/${pos.symbol}`} className="text-[var(--accent-blue)] hover:underline font-bold">
          {pos.symbol}
        </Link>
      </td>
      <td className="text-right font-mono">{pos.shares}</td>
      <td className="text-right font-mono">{formatPrice(pos.costBasis)}</td>
      <td className="text-right font-mono">{formatPrice(currentPrice)}</td>
      <td className="text-right font-mono">{formatLargeNumber(marketValue)}</td>
      <td className={`text-right font-mono ${changeColor(pnl)}`}>{pnl >= 0 ? "+" : ""}{formatPrice(pnl)}</td>
      <td className={`text-right font-mono ${changeColor(pnlPct)}`}>{formatPercent(pnlPct)}</td>
      <td className="text-right">
        <button onClick={onRemove} className="text-[var(--text-muted)] hover:text-[var(--negative)] transition-colors">
          <Trash2 size={12} />
        </button>
      </td>
    </tr>
  );
}

export default function PortfolioPage() {
  const { portfolio, addPosition, removePosition } = useStore();
  const [symbol, setSymbol] = useState("");
  const [shares, setShares] = useState("");
  const [costBasis, setCostBasis] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !shares || !costBasis) return;
    addPosition({
      symbol: symbol.toUpperCase(),
      shares: Number(shares),
      costBasis: Number(costBasis),
      addedAt: new Date().toISOString(),
    });
    setSymbol("");
    setShares("");
    setCostBasis("");
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-sm font-bold text-[var(--accent-orange)] uppercase tracking-wider">
        Portfolio Tracker
      </h1>

      <form onSubmit={handleAdd} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3">
        <div className="flex items-end gap-3">
          <div>
            <label className="text-[10px] text-[var(--text-muted)] uppercase block mb-1">Symbol</label>
            <input value={symbol} onChange={(e) => setSymbol(e.target.value)}
              className="bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs text-[var(--text-primary)] p-2 rounded w-24 font-mono uppercase"
              placeholder="AAPL" />
          </div>
          <div>
            <label className="text-[10px] text-[var(--text-muted)] uppercase block mb-1">Shares</label>
            <input type="number" value={shares} onChange={(e) => setShares(e.target.value)}
              className="bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs text-[var(--text-primary)] p-2 rounded w-24 font-mono"
              placeholder="100" />
          </div>
          <div>
            <label className="text-[10px] text-[var(--text-muted)] uppercase block mb-1">Cost Basis</label>
            <input type="number" step="0.01" value={costBasis} onChange={(e) => setCostBasis(e.target.value)}
              className="bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs text-[var(--text-primary)] p-2 rounded w-28 font-mono"
              placeholder="150.00" />
          </div>
          <button type="submit" className="bg-[var(--accent-orange)] text-black text-xs font-bold px-4 py-2 rounded hover:opacity-90 transition-opacity flex items-center gap-1">
            <Plus size={12} /> Add
          </button>
        </div>
      </form>

      {portfolio.length > 0 ? (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded">
          <div className="px-3 py-2 border-b border-[var(--border)]">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
              {portfolio.length} Position{portfolio.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th className="text-left">Symbol</th>
                  <th className="text-right">Shares</th>
                  <th className="text-right">Cost</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">Value</th>
                  <th className="text-right">P&L</th>
                  <th className="text-right">P&L %</th>
                  <th className="text-right"></th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((pos) => (
                  <PositionRow key={pos.symbol} pos={pos} onRemove={() => removePosition(pos.symbol)} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-8 text-center">
          <p className="text-sm text-[var(--text-muted)]">No positions yet. Add a stock above to start tracking.</p>
        </div>
      )}
    </div>
  );
}
