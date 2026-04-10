"use client";
import { useInstitutional, useInsiders } from "@/hooks/useStockData";
import { formatLargeNumber, formatMarginPercent } from "@/lib/formatters";
import type { InstitutionalHolder, InsiderTransaction } from "@/lib/types";

export default function HoldersBreakdown({ symbol }: { symbol: string }) {
  const { data: institutional } = useInstitutional(symbol);
  const { data: insiders } = useInsiders(symbol);

  const holders = (institutional || []) as InstitutionalHolder[];
  const transactions = (insiders || []) as InsiderTransaction[];

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3">
        <h4 className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">
          Top Institutional Holders
        </h4>
        {holders.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)]">No data available</p>
        ) : (
          <table className="data-table w-full">
            <thead>
              <tr>
                <th className="text-left">Holder</th>
                <th className="text-right">Shares</th>
                <th className="text-right">% Out</th>
                <th className="text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {holders.slice(0, 10).map((h, i) => (
                <tr key={i} className="hover:bg-[var(--bg-hover)]">
                  <td className="max-w-[180px] truncate">{h.holder}</td>
                  <td className="text-right">{formatLargeNumber(h.shares)}</td>
                  <td className="text-right">
                    {h.percentOut != null ? `${(h.percentOut * 100).toFixed(2)}%` : "—"}
                  </td>
                  <td className="text-right">{formatLargeNumber(h.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3">
        <h4 className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">
          Recent Insider Transactions
        </h4>
        {transactions.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)]">No data available</p>
        ) : (
          <table className="data-table w-full">
            <thead>
              <tr>
                <th className="text-left">Insider</th>
                <th className="text-left">Type</th>
                <th className="text-right">Shares</th>
                <th className="text-right">Value</th>
                <th className="text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map((t, i) => (
                <tr key={i} className="hover:bg-[var(--bg-hover)]">
                  <td className="max-w-[120px] truncate">{t.insider}</td>
                  <td
                    className={
                      t.transaction?.toLowerCase().includes("buy") ||
                      t.transaction?.toLowerCase().includes("purchase")
                        ? "text-[var(--positive)]"
                        : t.transaction?.toLowerCase().includes("sale") ||
                            t.transaction?.toLowerCase().includes("sell")
                          ? "text-[var(--negative)]"
                          : ""
                    }
                  >
                    {t.transaction}
                  </td>
                  <td className="text-right">{formatLargeNumber(t.shares)}</td>
                  <td className="text-right">{formatLargeNumber(t.value)}</td>
                  <td className="text-[var(--text-muted)]">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
