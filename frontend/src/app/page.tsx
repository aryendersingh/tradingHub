"use client";
import IndexCards from "@/components/market/IndexCards";
import GlobalIndicesCards from "@/components/market/GlobalIndicesCards";
import SectorHeatmap from "@/components/market/SectorHeatmap";
import MarketMovers from "@/components/market/MarketMovers";
import MiniYieldCurve from "@/components/market/MiniYieldCurve";
import FearGreedGauge from "@/components/market/FearGreedGauge";
import MarketBreadthCard from "@/components/market/MarketBreadthCard";
import PutCallCard from "@/components/market/PutCallCard";
import NewsFeed from "@/components/news/NewsFeed";

export default function DashboardPage() {
  return (
    <div className="p-4 space-y-4">
      <IndexCards />
      <GlobalIndicesCards />

      <div className="grid grid-cols-3 gap-4">
        {/* Left column */}
        <div className="space-y-4">
          <FearGreedGauge />
          <SectorHeatmap />
          <MiniYieldCurve />
        </div>

        {/* Center column */}
        <div className="space-y-4">
          <MarketBreadthCard />
          <PutCallCard />
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
