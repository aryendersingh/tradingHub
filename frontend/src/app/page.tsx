"use client";
import IndexCards from "@/components/market/IndexCards";
import SectorHeatmap from "@/components/market/SectorHeatmap";
import MarketMovers from "@/components/market/MarketMovers";
import MiniYieldCurve from "@/components/market/MiniYieldCurve";
import NewsFeed from "@/components/news/NewsFeed";

export default function DashboardPage() {
  return (
    <div className="p-4 space-y-4">
      <IndexCards />

      <div className="grid grid-cols-3 gap-4">
        {/* Left column */}
        <div className="space-y-4">
          <SectorHeatmap />
          <MiniYieldCurve />
        </div>

        {/* Center column */}
        <div className="space-y-4">
          <MarketMovers />
        </div>

        {/* Right column */}
        <div>
          <NewsFeed />
        </div>
      </div>
    </div>
  );
}
