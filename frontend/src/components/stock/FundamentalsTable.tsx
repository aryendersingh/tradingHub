"use client";
import { useStockRatios } from "@/hooks/useStockData";
import { formatRatio, formatMarginPercent, formatLargeNumber } from "@/lib/formatters";

const RATIO_GROUPS = [
  {
    title: "Valuation",
    items: [
      { key: "trailingPE", label: "P/E (TTM)", fmt: formatRatio },
      { key: "forwardPE", label: "P/E (Fwd)", fmt: formatRatio },
      { key: "priceToBook", label: "P/B", fmt: formatRatio },
      { key: "priceToSales", label: "P/S", fmt: formatRatio },
      { key: "enterpriseToEbitda", label: "EV/EBITDA", fmt: formatRatio },
      { key: "pegRatio", label: "PEG", fmt: formatRatio },
    ],
  },
  {
    title: "Profitability",
    items: [
      { key: "grossMargins", label: "Gross Margin", fmt: formatMarginPercent },
      { key: "operatingMargins", label: "Operating Margin", fmt: formatMarginPercent },
      { key: "profitMargins", label: "Net Margin", fmt: formatMarginPercent },
      { key: "returnOnEquity", label: "ROE", fmt: formatMarginPercent },
      { key: "returnOnAssets", label: "ROA", fmt: formatMarginPercent },
    ],
  },
  {
    title: "Financial Health",
    items: [
      { key: "debtToEquity", label: "Debt/Equity", fmt: formatRatio },
      { key: "currentRatio", label: "Current Ratio", fmt: formatRatio },
      { key: "quickRatio", label: "Quick Ratio", fmt: formatRatio },
    ],
  },
  {
    title: "Growth",
    items: [
      { key: "revenueGrowth", label: "Revenue Growth", fmt: formatMarginPercent },
      { key: "earningsGrowth", label: "Earnings Growth", fmt: formatMarginPercent },
    ],
  },
  {
    title: "Dividend",
    items: [
      { key: "dividendYield", label: "Div Yield", fmt: formatMarginPercent },
      { key: "payoutRatio", label: "Payout Ratio", fmt: formatMarginPercent },
    ],
  },
];

export default function FundamentalsTable({ symbol }: { symbol: string }) {
  const { data, isLoading } = useStockRatios(symbol);

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-[var(--bg-secondary)] rounded" />;
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {RATIO_GROUPS.map((group) => (
        <div
          key={group.title}
          className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3"
        >
          <h4 className="text-[10px] text-[var(--accent-orange)] uppercase tracking-wider mb-2">
            {group.title}
          </h4>
          <table className="data-table w-full">
            <tbody>
              {group.items.map((item) => (
                <tr key={item.key}>
                  <td className="text-[var(--text-muted)]">{item.label}</td>
                  <td className="text-right font-mono">
                    {item.fmt(data[item.key] as number | null)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
