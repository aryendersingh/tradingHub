"use client";
import Link from "next/link";
import { usePeers } from "@/hooks/useStockData";
import { formatLargeNumber, formatRatio, formatMarginPercent, formatPercent, changeColor } from "@/lib/formatters";
import type { PeerComparison as PeerComparisonType } from "@/lib/types";

export default function PeerComparison({ symbol }: { symbol: string }) {
  const { data, isLoading } = usePeers(symbol);

  if (isLoading) {
    return <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3 animate-pulse h-48" />;
  }

  if (!data) return null;

  const pc = data as PeerComparisonType;
  if (!pc.peers || pc.peers.length === 0) return null;

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3">
      <h3 className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">
        Peer Comparison — {pc.sector}
      </h3>
      <div className="overflow-x-auto">
        <table className="data-table w-full">
          <thead>
            <tr>
              <th className="text-left">Symbol</th>
              <th className="text-left">Name</th>
              <th className="text-right">Mkt Cap</th>
              <th className="text-right">P/E</th>
              <th className="text-right">P/B</th>
              <th className="text-right">Gross Mgn</th>
              <th className="text-right">Op Mgn</th>
              <th className="text-right">Net Mgn</th>
              <th className="text-right">Chg %</th>
            </tr>
          </thead>
          <tbody>
            {pc.peers.map((peer) => (
              <tr key={peer.symbol} className={`hover:bg-[var(--bg-hover)] ${peer.symbol === symbol ? "bg-[var(--bg-tertiary)]" : ""}`}>
                <td>
                  <Link href={`/stock/${peer.symbol}`} className="text-[var(--accent-blue)] hover:underline font-bold">
                    {peer.symbol}
                  </Link>
                </td>
                <td className="text-[var(--text-secondary)] max-w-[120px] truncate">{peer.name}</td>
                <td className="text-right">{formatLargeNumber(peer.marketCap)}</td>
                <td className="text-right font-mono">{formatRatio(peer.trailingPE)}</td>
                <td className="text-right font-mono">{formatRatio(peer.priceToBook)}</td>
                <td className="text-right font-mono">{formatMarginPercent(peer.grossMargins)}</td>
                <td className="text-right font-mono">{formatMarginPercent(peer.operatingMargins)}</td>
                <td className="text-right font-mono">{formatMarginPercent(peer.profitMargins)}</td>
                <td className={`text-right font-mono ${changeColor(peer.changePercent)}`}>{formatPercent(peer.changePercent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
