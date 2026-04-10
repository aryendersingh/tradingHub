"use client";
import { useEffect, useRef, useState } from "react";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  CandlestickSeries,
  HistogramSeries,
  ColorType,
} from "lightweight-charts";
import { useStockHistory } from "@/hooks/useStockData";
import { TIMEFRAMES } from "@/lib/constants";
import type { OHLCV } from "@/lib/types";

export default function StockChart({ symbol }: { symbol: string }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const candleSeriesRef = useRef<ISeriesApi<any> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const volumeSeriesRef = useRef<ISeriesApi<any> | null>(null);

  const [timeframe, setTimeframe] = useState<(typeof TIMEFRAMES)[number]>(TIMEFRAMES[6]); // 1Y default
  const { data } = useStockHistory(symbol, timeframe.period, timeframe.interval);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#111111" },
        textColor: "#888888",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
      },
      grid: {
        vertLines: { color: "#1a1a1a" },
        horzLines: { color: "#1a1a1a" },
      },
      crosshair: {
        vertLine: { color: "#555555", width: 1, style: 2 },
        horzLine: { color: "#555555", width: 1, style: 2 },
      },
      rightPriceScale: {
        borderColor: "#2a2a2a",
      },
      timeScale: {
        borderColor: "#2a2a2a",
        timeVisible: timeframe.interval.includes("m") || timeframe.interval.includes("h"),
      },
      handleScroll: true,
      handleScale: true,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width, height });
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [timeframe.interval]);

  useEffect(() => {
    if (!data || !candleSeriesRef.current || !volumeSeriesRef.current) return;

    const candles = (data as OHLCV[]).map((d) => ({
      time: d.time as string,
      open: d.open ?? 0,
      high: d.high ?? 0,
      low: d.low ?? 0,
      close: d.close ?? 0,
    }));

    const volumes = (data as OHLCV[]).map((d) => ({
      time: d.time as string,
      value: d.volume ?? 0,
      color:
        (d.close ?? 0) >= (d.open ?? 0)
          ? "rgba(34, 197, 94, 0.3)"
          : "rgba(239, 68, 68, 0.3)",
    }));

    candleSeriesRef.current.setData(candles);
    volumeSeriesRef.current.setData(volumes);
    chartRef.current?.timeScale().fitContent();
  }, [data]);

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-[var(--border)]">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.label}
            onClick={() => setTimeframe(tf)}
            className={`text-[10px] px-2 py-1 rounded font-mono transition-colors ${
              timeframe.label === tf.label
                ? "bg-[var(--accent-orange)] text-black font-bold"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>
      <div ref={chartContainerRef} className="h-96" />
    </div>
  );
}
