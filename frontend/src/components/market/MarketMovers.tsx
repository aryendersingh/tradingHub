"use client";
import { useState } from "react";
import Link from "next/link";
import { useMarketMovers } from "@/hooks/useMarketData";
import { formatPrice, formatPercent, formatVolume, changeColor } from "@/lib/formatters";

const TABS = [
  { key: "gainers", label: "Gainers" },
  { key: "losers", label: "Losers" },
  { key: "most_actives", label: "Most Active" },
];

export default function MarketMovers() {
  const [activeTab, setActiveTab] = useState("gainers");
  const { data, isLoading } = useMarketMovers(activeTab);

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3">
      <div className="flex items-center gap-2 mb-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded transition-colors ${
              activeTab === tab.key
                ? "bg-[var(--accent-orange)] text-black font-bold"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 bg-[var(--bg-tertiary)] animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <table className="data-table w-full">
          <thead>
            <tr>
              <th className="text-left">Symbol</th>
              <th className="text-right">Price</th>
              <th className="text-right">Change</th>
              <th className="text-right">Volume</th>
            </tr>
          </thead>
          <tbody>
            {(data || []).slice(0, 10).map((item: { symbol: string; name: string; price: number | null; changePercent: number | null; volume: number | null }) => (
              <tr key={item.symbol} className="hover:bg-[var(--bg-hover)] transition-colors">
                <td>
                  <Link
                    href={`/stock/${item.symbol}`}
                    className="text-[var(--accent-blue)] hover:underline"
                  >
                    {item.symbol}
                  </Link>
                </td>
                <td className="text-right">{formatPrice(item.price)}</td>
                <td className={`text-right ${changeColor(item.changePercent)}`}>
                  {formatPercent(item.changePercent)}
                </td>
                <td className="text-right text-[var(--text-secondary)]">
                  {formatVolume(item.volume)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
