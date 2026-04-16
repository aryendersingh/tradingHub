"use client";
import YieldCurve from "@/components/economic/YieldCurve";
import EconomicCalendarView from "@/components/economic/EconomicCalendarView";
import MacroIndicators from "@/components/economic/MacroIndicators";
import ForexRates from "@/components/economic/ForexRates";
import CommodityPrices from "@/components/economic/CommodityPrices";
import IPOCalendar from "@/components/economic/IPOCalendar";
import EarningsCalendar from "@/components/market/EarningsCalendar";

export default function EconomicPage() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-sm font-bold text-[var(--accent-orange)] uppercase tracking-wider">
        Economic Dashboard
      </h1>
      <MacroIndicators />
      <div className="grid grid-cols-2 gap-4">
        <YieldCurve />
        <ForexRates />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <CommodityPrices />
        <IPOCalendar />
      </div>
      <EarningsCalendar />
      <EconomicCalendarView />
    </div>
  );
}
