"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOptionsExpirations, getOptionsChain } from "@/lib/api";
import { formatPrice, formatRatio, formatLargeNumber, changeColor } from "@/lib/formatters";
import type { OptionContract } from "@/lib/types";

export default function OptionsChain({ symbol }: { symbol: string }) {
  const [selectedExpiry, setSelectedExpiry] = useState<string>("");

  const { data: expirations } = useQuery({
    queryKey: ["options", symbol, "expirations"],
    queryFn: () => getOptionsExpirations(symbol),
    enabled: !!symbol,
  });

  const expiry = selectedExpiry || (expirations as string[])?.[0] || "";

  const { data: chain, isLoading } = useQuery({
    queryKey: ["options", symbol, "chain", expiry],
    queryFn: () => getOptionsChain(symbol, expiry),
    enabled: !!symbol && !!expiry,
  });

  const calls = (chain?.calls || []) as OptionContract[];
  const puts = (chain?.puts || []) as OptionContract[];

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] overflow-x-auto">
        <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider shrink-0">
          Expiry:
        </span>
        {(expirations as string[] || []).slice(0, 8).map((exp: string) => (
          <button
            key={exp}
            onClick={() => setSelectedExpiry(exp)}
            className={`text-[10px] px-2 py-1 rounded font-mono whitespace-nowrap transition-colors ${
              expiry === exp
                ? "bg-[var(--accent-orange)] text-black font-bold"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {exp}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse bg-[var(--bg-tertiary)]" />
      ) : (
        <div className="overflow-x-auto max-h-[500px]">
          <table className="data-table w-full">
            <thead className="sticky top-0 bg-[var(--bg-secondary)] z-10">
              <tr>
                <th colSpan={6} className="text-center text-green-500 border-r border-[var(--border)]">
                  CALLS
                </th>
                <th className="text-center text-[var(--accent-orange)]">Strike</th>
                <th colSpan={6} className="text-center text-red-500 border-l border-[var(--border)]">
                  PUTS
                </th>
              </tr>
              <tr>
                <th className="text-right">Last</th>
                <th className="text-right">Bid</th>
                <th className="text-right">Ask</th>
                <th className="text-right">Vol</th>
                <th className="text-right">OI</th>
                <th className="text-right border-r border-[var(--border)]">IV</th>
                <th className="text-center">Strike</th>
                <th className="text-right border-l border-[var(--border)]">Last</th>
                <th className="text-right">Bid</th>
                <th className="text-right">Ask</th>
                <th className="text-right">Vol</th>
                <th className="text-right">OI</th>
                <th className="text-right">IV</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call, i) => {
                const put = puts[i];
                const strike = call.strike;
                return (
                  <tr
                    key={strike}
                    className={`hover:bg-[var(--bg-hover)] ${
                      call.inTheMoney ? "bg-green-950/20" : ""
                    }`}
                  >
                    <td className="text-right">{formatPrice(call.lastPrice)}</td>
                    <td className="text-right">{formatPrice(call.bid)}</td>
                    <td className="text-right">{formatPrice(call.ask)}</td>
                    <td className="text-right">{formatLargeNumber(call.volume)}</td>
                    <td className="text-right">{formatLargeNumber(call.openInterest)}</td>
                    <td className="text-right border-r border-[var(--border)]">
                      {call.impliedVolatility != null
                        ? `${(call.impliedVolatility * 100).toFixed(1)}%`
                        : "—"}
                    </td>
                    <td className="text-center font-bold text-[var(--accent-orange)]">
                      {formatPrice(strike)}
                    </td>
                    {put ? (
                      <>
                        <td className={`text-right border-l border-[var(--border)] ${put.inTheMoney ? "bg-red-950/20" : ""}`}>
                          {formatPrice(put.lastPrice)}
                        </td>
                        <td className={`text-right ${put.inTheMoney ? "bg-red-950/20" : ""}`}>
                          {formatPrice(put.bid)}
                        </td>
                        <td className={`text-right ${put.inTheMoney ? "bg-red-950/20" : ""}`}>
                          {formatPrice(put.ask)}
                        </td>
                        <td className={`text-right ${put.inTheMoney ? "bg-red-950/20" : ""}`}>
                          {formatLargeNumber(put.volume)}
                        </td>
                        <td className={`text-right ${put.inTheMoney ? "bg-red-950/20" : ""}`}>
                          {formatLargeNumber(put.openInterest)}
                        </td>
                        <td className={`text-right ${put.inTheMoney ? "bg-red-950/20" : ""}`}>
                          {put.impliedVolatility != null
                            ? `${(put.impliedVolatility * 100).toFixed(1)}%`
                            : "—"}
                        </td>
                      </>
                    ) : (
                      <td colSpan={6} className="border-l border-[var(--border)]" />
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
