"use client";
import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/hooks/useStore";
import { useWebSocket } from "@/hooks/useWebSocket";
import { formatPrice, formatChange, changeColor } from "@/lib/formatters";
import { Plus, Trash2 } from "lucide-react";

export default function WatchlistPage() {
  const { watchlist, addToWatchlist, removeFromWatchlist, quotes } = useStore();
  const [newSymbol, setNewSymbol] = useState("");

  // Subscribe to watchlist symbols via WebSocket
  const symbols = watchlist.map((w) => w.symbol);
  useWebSocket(symbols);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSymbol.trim()) {
      addToWatchlist({ symbol: newSymbol.trim().toUpperCase() });
      setNewSymbol("");
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-sm font-bold text-[var(--accent-orange)] uppercase tracking-wider">
          Watchlist
        </h1>
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
            placeholder="Add symbol..."
            className="bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs text-[var(--text-primary)] px-2 py-1 rounded font-mono w-28 outline-none"
          />
          <button
            type="submit"
            className="bg-[var(--accent-orange)] text-black text-xs px-3 py-1 rounded font-bold flex items-center gap-1 hover:opacity-90"
          >
            <Plus size={12} /> Add
          </button>
        </form>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded">
        <table className="data-table w-full">
          <thead>
            <tr>
              <th className="text-left">Symbol</th>
              <th className="text-left">Name</th>
              <th className="text-right">Price</th>
              <th className="text-right">Change</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {watchlist.map((item) => {
              const liveQuote = quotes[item.symbol];
              return (
                <tr key={item.symbol} className="hover:bg-[var(--bg-hover)]">
                  <td>
                    <Link
                      href={`/stock/${item.symbol}`}
                      className="text-[var(--accent-blue)] hover:underline font-bold"
                    >
                      {item.symbol}
                    </Link>
                  </td>
                  <td className="text-[var(--text-secondary)]">{item.name || "—"}</td>
                  <td className="text-right font-mono">
                    {liveQuote ? formatPrice(liveQuote.price) : "—"}
                  </td>
                  <td className="text-right">
                    {liveQuote && (
                      <span className={`font-mono ${changeColor(0)}`}>
                        Live
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => removeFromWatchlist(item.symbol)}
                      className="text-[var(--text-muted)] hover:text-[var(--negative)] transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
