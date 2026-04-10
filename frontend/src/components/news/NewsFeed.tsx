"use client";
import { useMarketNews } from "@/hooks/useMarketData";
import type { NewsArticle } from "@/lib/types";
import { formatTimestamp } from "@/lib/formatters";
import { ExternalLink } from "lucide-react";

export default function NewsFeed({ news: propNews }: { news?: NewsArticle[] }) {
  const { data: marketNews } = useMarketNews();
  const articles: NewsArticle[] = propNews || (marketNews as NewsArticle[] | undefined) || [];

  if (!articles.length) {
    return (
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3">
        <h3 className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">
          News
        </h3>
        <p className="text-xs text-[var(--text-muted)]">No news available</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3">
      <h3 className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">
        Market News
      </h3>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {articles.slice(0, 15).map((article, i) => (
          <a
            key={article.id || i}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-2 rounded hover:bg-[var(--bg-hover)] transition-colors group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-[var(--text-primary)] line-clamp-2 group-hover:text-[var(--accent-blue)]">
                  {article.headline}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-[var(--accent-orange)]">
                    {article.source}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {formatTimestamp(article.datetime)}
                  </span>
                </div>
              </div>
              <ExternalLink
                size={10}
                className="text-[var(--text-muted)] shrink-0 mt-1"
              />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
