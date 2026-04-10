"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import QuoteHeader from "@/components/stock/QuoteHeader";
import StockChart from "@/components/stock/StockChart";
import FundamentalsTable from "@/components/stock/FundamentalsTable";
import FinancialStatements from "@/components/stock/FinancialStatements";
import OptionsChain from "@/components/options/OptionsChain";
import RatingsChart from "@/components/analyst/RatingsChart";
import EarningsTable from "@/components/analyst/EarningsTable";
import HoldersBreakdown from "@/components/stock/HoldersBreakdown";
import NewsFeed from "@/components/news/NewsFeed";
import { useStockNews, useFilings } from "@/hooks/useStockData";
import type { NewsArticle } from "@/lib/types";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "chart", label: "Chart" },
  { key: "fundamentals", label: "Fundamentals" },
  { key: "options", label: "Options" },
  { key: "news", label: "News & Filings" },
  { key: "holders", label: "Holders" },
];

export default function StockDetailPage() {
  const params = useParams();
  const symbol = (params.symbol as string).toUpperCase();
  const [activeTab, setActiveTab] = useState("overview");
  const { data: stockNews } = useStockNews(symbol);
  const { data: filings } = useFilings(symbol);

  return (
    <div>
      <QuoteHeader symbol={symbol} />

      <div className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="flex gap-0 px-4">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`text-xs px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-[var(--accent-orange)] text-[var(--accent-orange)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {activeTab === "overview" && (
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <StockChart symbol={symbol} />
            </div>
            <div className="space-y-4">
              <RatingsChart symbol={symbol} />
              <EarningsTable symbol={symbol} />
            </div>
            <div className="col-span-3">
              <FundamentalsTable symbol={symbol} />
            </div>
          </div>
        )}

        {activeTab === "chart" && <StockChart symbol={symbol} />}

        {activeTab === "fundamentals" && (
          <div className="space-y-4">
            <FundamentalsTable symbol={symbol} />
            <FinancialStatements symbol={symbol} />
          </div>
        )}

        {activeTab === "options" && <OptionsChain symbol={symbol} />}

        {activeTab === "news" && (
          <div className="grid grid-cols-2 gap-4">
            <NewsFeed news={(stockNews || []) as NewsArticle[]} />
            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3">
              <h3 className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">
                SEC Filings
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {((filings || []) as Array<{ type: string; title: string; date: string; url: string }>).map(
                  (filing, i) => (
                    <a
                      key={i}
                      href={filing.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2 rounded hover:bg-[var(--bg-hover)] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded text-[var(--accent-orange)] font-mono">
                          {filing.type}
                        </span>
                        <span className="text-xs text-[var(--text-primary)] truncate">
                          {filing.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)]">{filing.date}</span>
                    </a>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "holders" && <HoldersBreakdown symbol={symbol} />}
      </div>
    </div>
  );
}
