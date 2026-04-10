"use client";
import { useQuery } from "@tanstack/react-query";
import { getForex } from "@/lib/api";
import { formatPrice, formatPercent, changeColor } from "@/lib/formatters";
import type { ForexPair } from "@/lib/types";

export default function ForexRates() {
  const { data, isLoading } = useQuery({
    queryKey: ["economic", "forex"],
    queryFn: getForex,
    refetchInterval: 300_000,
  });

  const pairs = (data || []) as ForexPair[];

  if (isLoading) {
    return <div className="h-48 animate-pulse bg-[var(--bg-secondary)] rounded" />;
  }

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3">
      <h3 className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">
        Forex / DXY
      </h3>
      <table className="data-table w-full">
        <thead>
          <tr>
            <th className="text-left">Pair</th>
            <th className="text-right">Price</th>
            <th className="text-right">Change</th>
          </tr>
        </thead>
        <tbody>
          {pairs.map((pair) => (
            <tr key={pair.pair} className="hover:bg-[var(--bg-hover)]">
              <td className="font-bold">{pair.pair}</td>
              <td className="text-right font-mono">{formatPrice(pair.price, 4)}</td>
              <td className={`text-right font-mono ${changeColor(pair.changePercent)}`}>
                {formatPercent(pair.changePercent)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
