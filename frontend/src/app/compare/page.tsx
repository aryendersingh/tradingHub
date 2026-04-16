"use client";
import { useState } from "react";
import { useStockComparison } from "@/hooks/useMarketData";
import ComparisonChart from "@/components/compare/ComparisonChart";
import { Plus, X } from "lucide-react";
import { TIMEFRAMES } from "@/lib/constants";

const COMPARISON_TIMEFRAMES = TIMEFRAMES.filter((tf) =>
  ["1M", "3M", "6M", "1Y", "5Y"].includes(tf.label)
);

export default function ComparePage() {
  const [symbols, setSymbols] = useState<string[]>(["AAPL", "MSFT"]);
  const [input, setInput] = useState("");
  const [timeframe, setTimeframe] = useState(COMPARISON_TIMEFRAMES[3]); // 1Y default

  const { data, isLoading } = useStockComparison(symbols, timeframe.period, timeframe.interval);

  const addSymbol = () => {
    const sym = input.trim().toUpperCase();
    if (sym && !symbols.includes(sym) && symbols.length < 5) {
      setSymbols([...symbols, sym]);
      setInput("");
    }
  };

  const removeSymbol = (sym: string) => {
    setSymbols(symbols.filter((s) => s !== sym));
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-sm font-bold text-[var(--accent-orange)] uppercase tracking-wider">
        Stock Comparison
      </h1>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3">
        <div className="flex items-center gap-2 flex-wrap">
          {symbols.map((sym) => (
            <span key={sym} className="flex items-center gap-1 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded px-2 py-1 text-xs font-mono font-bold text-[var(--text-primary)]">
              {sym}
              <button onClick={() => removeSymbol(sym)} className="text-[var(--text-muted)] hover:text-[var(--negative)]">
                <X size={10} />
              </button>
            </span>
          ))}
          {symbols.length < 5 && (
            <form onSubmit={(e) => { e.preventDefault(); addSymbol(); }} className="flex items-center gap-1">
              <input value={input} onChange={(e) => setInput(e.target.value)}
                className="bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs text-[var(--text-primary)] px-2 py-1 rounded w-20 font-mono uppercase"
                placeholder="TICKER" />
              <button type="submit" className="bg-[var(--accent-orange)] text-black p-1 rounded hover:opacity-90">
                <Plus size={12} />
              </button>
            </form>
          )}
        </div>
        <div className="flex items-center gap-1 mt-2">
          {COMPARISON_TIMEFRAMES.map((tf) => (
            <button key={tf.label} onClick={() => setTimeframe(tf)}
              className={`text-[10px] px-2 py-1 rounded font-mono transition-colors ${
                timeframe.label === tf.label
                  ? "bg-[var(--accent-orange)] text-black font-bold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }`}>
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {symbols.length >= 2 ? (
        isLoading ? (
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded animate-pulse h-96" />
        ) : data ? (
          <ComparisonChart data={data} />
        ) : null
      ) : (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-8 text-center">
          <p className="text-sm text-[var(--text-muted)]">Add at least 2 symbols to compare performance.</p>
        </div>
      )}
    </div>
  );
}
