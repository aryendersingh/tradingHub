"use client";
import { useState } from "react";
import { useStockFundamentals } from "@/hooks/useStockData";
import { formatLargeNumber } from "@/lib/formatters";

type StatementType = "incomeStatement" | "balanceSheet" | "cashFlow";
type Period = "annual" | "quarterly";

const TABS: { key: StatementType; label: string }[] = [
  { key: "incomeStatement", label: "Income Statement" },
  { key: "balanceSheet", label: "Balance Sheet" },
  { key: "cashFlow", label: "Cash Flow" },
];

export default function FinancialStatements({ symbol }: { symbol: string }) {
  const [activeTab, setActiveTab] = useState<StatementType>("incomeStatement");
  const [period, setPeriod] = useState<Period>("annual");
  const { data, isLoading } = useStockFundamentals(symbol);

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-[var(--bg-secondary)] rounded" />;
  }

  if (!data) return null;

  const statementData = data[activeTab]?.[period] as Record<string, unknown>[] | undefined;
  if (!statementData || statementData.length === 0) {
    return (
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-4">
        <p className="text-xs text-[var(--text-muted)]">No data available</p>
      </div>
    );
  }

  // Get all row labels (keys) from the first record, excluding 'index'
  const allKeys = Object.keys(statementData[0]).filter((k) => k !== "index");
  const periods = statementData.map((r) => String(r.index || "")).slice(0, 4);

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)]">
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
        <div className="ml-auto flex gap-1">
          {(["annual", "quarterly"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`text-[10px] px-2 py-1 rounded ${
                period === p
                  ? "bg-[var(--bg-hover)] text-[var(--text-primary)]"
                  : "text-[var(--text-muted)]"
              }`}
            >
              {p === "annual" ? "Annual" : "Quarterly"}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto max-h-96">
        <table className="data-table w-full">
          <thead className="sticky top-0 bg-[var(--bg-secondary)]">
            <tr>
              <th className="text-left min-w-[180px]">Item</th>
              {periods.map((p) => (
                <th key={p} className="text-right min-w-[100px]">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allKeys.map((key) => (
              <tr key={key} className="hover:bg-[var(--bg-hover)]">
                <td className="text-[var(--text-secondary)]">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </td>
                {statementData.slice(0, 4).map((record, i) => {
                  const val = record[key];
                  return (
                    <td key={i} className="text-right font-mono">
                      {typeof val === "number"
                        ? formatLargeNumber(val)
                        : val != null
                          ? String(val)
                          : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
