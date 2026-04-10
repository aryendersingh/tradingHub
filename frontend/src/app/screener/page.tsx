"use client";
import StockScreener from "@/components/screener/StockScreener";

export default function ScreenerPage() {
  return (
    <div className="p-4">
      <h1 className="text-sm font-bold text-[var(--accent-orange)] uppercase tracking-wider mb-4">
        Stock Screener
      </h1>
      <StockScreener />
    </div>
  );
}
