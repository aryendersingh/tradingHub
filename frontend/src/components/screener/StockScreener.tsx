"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { scanStocks } from "@/lib/api";
import { formatPrice, formatPercent, formatLargeNumber, changeColor } from "@/lib/formatters";
import { SECTORS } from "@/lib/constants";
import { Search } from "lucide-react";

interface Filters {
  minMarketCap?: number;
  maxMarketCap?: number;
  minPE?: number;
  maxPE?: number;
  sector?: string;
  minDividendYield?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy: string;
  limit: number;
}

const MARKET_CAP_PRESETS = [
  { label: "Mega (>200B)", min: 200_000_000_000 },
  { label: "Large (10-200B)", min: 10_000_000_000, max: 200_000_000_000 },
  { label: "Mid (2-10B)", min: 2_000_000_000, max: 10_000_000_000 },
  { label: "Small (300M-2B)", min: 300_000_000, max: 2_000_000_000 },
];

export default function StockScreener() {
  const [filters, setFilters] = useState<Filters>({
    sortBy: "intradaymarketcap",
    limit: 25,
  });

  const { mutate, data, isPending } = useMutation({
    mutationFn: scanStocks,
  });

  const handleScan = () => {
    const cleanFilters: Record<string, unknown> = { ...filters };
    Object.keys(cleanFilters).forEach((key) => {
      if (cleanFilters[key] === undefined || cleanFilters[key] === "") {
        delete cleanFilters[key];
      }
    });
    mutate(cleanFilters);
  };

  const results = (data || []) as Array<{
    symbol: string;
    name: string;
    price: number | null;
    changePercent: number | null;
    volume: number | null;
    marketCap: number | null;
    pe: number | null;
    sector: string;
  }>;

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Filter Panel */}
      <div className="col-span-1 space-y-3">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3">
          <h3 className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-3">
            Market Cap
          </h3>
          <div className="space-y-1">
            {MARKET_CAP_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    minMarketCap: preset.min,
                    maxMarketCap: preset.max,
                  }))
                }
                className={`w-full text-left text-xs px-2 py-1 rounded transition-colors ${
                  filters.minMarketCap === preset.min
                    ? "bg-[var(--accent-orange)] text-black"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3">
          <h3 className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Sector
          </h3>
          <select
            className="w-full bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs text-[var(--text-primary)] p-1 rounded"
            value={filters.sector || ""}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                sector: e.target.value || undefined,
              }))
            }
          >
            <option value="">All Sectors</option>
            {SECTORS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3">
          <h3 className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">
            P/E Ratio
          </h3>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              className="w-1/2 bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs p-1 rounded text-[var(--text-primary)]"
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  minPE: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
            <input
              type="number"
              placeholder="Max"
              className="w-1/2 bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs p-1 rounded text-[var(--text-primary)]"
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  maxPE: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            />
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3">
          <h3 className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Min Dividend Yield
          </h3>
          <input
            type="number"
            step="0.5"
            placeholder="e.g. 2.0"
            className="w-full bg-[var(--bg-tertiary)] border border-[var(--border)] text-xs p-1 rounded text-[var(--text-primary)]"
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                minDividendYield: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
        </div>

        <button
          onClick={handleScan}
          disabled={isPending}
          className="w-full bg-[var(--accent-orange)] text-black text-xs font-bold py-2 rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <Search size={12} />
          {isPending ? "Scanning..." : "Scan"}
        </button>
      </div>

      {/* Results */}
      <div className="col-span-3">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded">
          <div className="px-3 py-2 border-b border-[var(--border)]">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
              {results.length > 0 ? `${results.length} Results` : "Run a scan to see results"}
            </span>
          </div>
          {results.length > 0 && (
            <div className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th className="text-left">Symbol</th>
                    <th className="text-left">Name</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Change</th>
                    <th className="text-right">Volume</th>
                    <th className="text-right">Mkt Cap</th>
                    <th className="text-right">P/E</th>
                    <th className="text-left">Sector</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((stock) => (
                    <tr key={stock.symbol} className="hover:bg-[var(--bg-hover)]">
                      <td>
                        <Link
                          href={`/stock/${stock.symbol}`}
                          className="text-[var(--accent-blue)] hover:underline font-bold"
                        >
                          {stock.symbol}
                        </Link>
                      </td>
                      <td className="text-[var(--text-secondary)] max-w-[150px] truncate">
                        {stock.name}
                      </td>
                      <td className="text-right">{formatPrice(stock.price)}</td>
                      <td className={`text-right ${changeColor(stock.changePercent)}`}>
                        {formatPercent(stock.changePercent)}
                      </td>
                      <td className="text-right text-[var(--text-secondary)]">
                        {formatLargeNumber(stock.volume)}
                      </td>
                      <td className="text-right">{formatLargeNumber(stock.marketCap)}</td>
                      <td className="text-right">
                        {stock.pe != null ? stock.pe.toFixed(1) : "—"}
                      </td>
                      <td className="text-[var(--text-muted)]">{stock.sector}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
