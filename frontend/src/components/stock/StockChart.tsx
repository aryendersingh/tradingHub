"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  ColorType,
} from "lightweight-charts";
import { useStockHistory } from "@/hooks/useStockData";
import { getIndicators } from "@/lib/api";
import { TIMEFRAMES } from "@/lib/constants";
import type { OHLCV } from "@/lib/types";

const OVERLAY_INDICATORS = [
  { label: "SMA 20", type: "sma", period: 20, color: "#3b82f6" },
  { label: "SMA 50", type: "sma", period: 50, color: "#eab308" },
  { label: "SMA 200", type: "sma", period: 200, color: "#ffffff" },
  { label: "EMA 20", type: "ema", period: 20, color: "#06b6d4" },
  { label: "EMA 50", type: "ema", period: 50, color: "#d946ef" },
  { label: "BBands", type: "bbands", period: 20, color: "#6b7280" },
] as const;

export default function StockChart({ symbol }: { symbol: string }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const candleSeriesRef = useRef<ISeriesApi<any> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const volumeSeriesRef = useRef<ISeriesApi<any> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const overlaySeriesRef = useRef<Map<string, ISeriesApi<any>[]>>(new Map());

  const [timeframe, setTimeframe] = useState<(typeof TIMEFRAMES)[number]>(TIMEFRAMES[6]);
  const [activeOverlays, setActiveOverlays] = useState<Set<string>>(new Set());
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
      rightPriceScale: { borderColor: "#2a2a2a" },
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
    overlaySeriesRef.current = new Map();

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

    const isIntraday = timeframe.interval.includes("m") || timeframe.interval.includes("h");
    const formatTime = (t: string) =>
      isIntraday ? Math.floor(new Date(t).getTime() / 1000) : t.slice(0, 10);

    const candles = (data as OHLCV[]).map((d) => ({
      time: formatTime(d.time) as string & number,
      open: d.open ?? 0,
      high: d.high ?? 0,
      low: d.low ?? 0,
      close: d.close ?? 0,
    }));

    const volumes = (data as OHLCV[]).map((d) => ({
      time: formatTime(d.time) as string & number,
      value: d.volume ?? 0,
      color:
        (d.close ?? 0) >= (d.open ?? 0)
          ? "rgba(34, 197, 94, 0.3)"
          : "rgba(239, 68, 68, 0.3)",
    }));

    candleSeriesRef.current.setData(candles);
    volumeSeriesRef.current.setData(volumes);
    chartRef.current?.timeScale().fitContent();
  }, [data, timeframe.interval]);

  const toggleOverlay = useCallback(
    async (indicator: (typeof OVERLAY_INDICATORS)[number]) => {
      const key = `${indicator.type}-${indicator.period}`;
      const chart = chartRef.current;
      if (!chart) return;

      if (activeOverlays.has(key)) {
        // Remove overlay
        const series = overlaySeriesRef.current.get(key);
        if (series) {
          series.forEach((s) => chart.removeSeries(s));
          overlaySeriesRef.current.delete(key);
        }
        setActiveOverlays((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      } else {
        // Add overlay
        try {
          const result = await getIndicators(
            symbol,
            indicator.type,
            indicator.period,
            timeframe.period,
            timeframe.interval
          );
          if (!result || !Array.isArray(result)) return;

          const isIntraday = timeframe.interval.includes("m") || timeframe.interval.includes("h");
          const formatTime = (t: string) =>
            isIntraday ? Math.floor(new Date(t).getTime() / 1000) : t.slice(0, 10);

          const createdSeries: ISeriesApi<"Line">[] = [];

          if (indicator.type === "bbands") {
            // Bollinger Bands: 3 lines (upper, mid, lower)
            const upper = chart.addSeries(LineSeries, {
              color: indicator.color,
              lineWidth: 1,
              lineStyle: 2,
              priceLineVisible: false,
              lastValueVisible: false,
            });
            const mid = chart.addSeries(LineSeries, {
              color: indicator.color,
              lineWidth: 1,
              priceLineVisible: false,
              lastValueVisible: false,
            });
            const lower = chart.addSeries(LineSeries, {
              color: indicator.color,
              lineWidth: 1,
              lineStyle: 2,
              priceLineVisible: false,
              lastValueVisible: false,
            });

            upper.setData(
              result
                .filter((d: { time: string; upper: number }) => d.upper != null)
                .map((d: { time: string; upper: number }) => ({
                  time: formatTime(d.time) as string & number,
                  value: d.upper,
                }))
            );
            mid.setData(
              result
                .filter((d: { time: string; mid: number }) => d.mid != null)
                .map((d: { time: string; mid: number }) => ({
                  time: formatTime(d.time) as string & number,
                  value: d.mid,
                }))
            );
            lower.setData(
              result
                .filter((d: { time: string; lower: number }) => d.lower != null)
                .map((d: { time: string; lower: number }) => ({
                  time: formatTime(d.time) as string & number,
                  value: d.lower,
                }))
            );

            createdSeries.push(upper, mid, lower);
          } else {
            // SMA/EMA: single line
            const line = chart.addSeries(LineSeries, {
              color: indicator.color,
              lineWidth: 2,
              priceLineVisible: false,
              lastValueVisible: false,
            });

            line.setData(
              result
                .filter((d: { time: string; value: number }) => d.value != null)
                .map((d: { time: string; value: number }) => ({
                  time: formatTime(d.time) as string & number,
                  value: d.value,
                }))
            );

            createdSeries.push(line);
          }

          overlaySeriesRef.current.set(key, createdSeries);
          setActiveOverlays((prev) => new Set(prev).add(key));
        } catch {
          // Failed to fetch indicator data
        }
      }
    },
    [symbol, timeframe, activeOverlays]
  );

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-[var(--border)] flex-wrap">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.label}
            onClick={() => {
              setTimeframe(tf);
              setActiveOverlays(new Set());
            }}
            className={`text-[10px] px-2 py-1 rounded font-mono transition-colors ${
              timeframe.label === tf.label
                ? "bg-[var(--accent-orange)] text-black font-bold"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            }`}
          >
            {tf.label}
          </button>
        ))}
        <span className="w-px h-4 bg-[var(--border)] mx-1" />
        {OVERLAY_INDICATORS.map((ind) => {
          const key = `${ind.type}-${ind.period}`;
          const isActive = activeOverlays.has(key);
          return (
            <button
              key={key}
              onClick={() => toggleOverlay(ind)}
              className={`text-[10px] px-2 py-1 rounded font-mono transition-colors ${
                isActive
                  ? "font-bold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }`}
              style={isActive ? { backgroundColor: ind.color, color: "#000" } : undefined}
            >
              {ind.label}
            </button>
          );
        })}
      </div>
      <div ref={chartContainerRef} className="h-96" />
    </div>
  );
}
