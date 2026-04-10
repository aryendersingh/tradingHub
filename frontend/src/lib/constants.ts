export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export const REFRESH_INTERVALS = {
  quote: 15_000,
  marketOverview: 30_000,
  sectors: 60_000,
  news: 300_000,
  fundamentals: 3_600_000,
} as const;

export const TIMEFRAMES = [
  { label: "1D", period: "1d", interval: "5m" },
  { label: "5D", period: "5d", interval: "15m" },
  { label: "1M", period: "1mo", interval: "1h" },
  { label: "3M", period: "3mo", interval: "1d" },
  { label: "6M", period: "6mo", interval: "1d" },
  { label: "YTD", period: "ytd", interval: "1d" },
  { label: "1Y", period: "1y", interval: "1d" },
  { label: "5Y", period: "5y", interval: "1wk" },
  { label: "MAX", period: "max", interval: "1mo" },
] as const;

export const INDICATORS = [
  { label: "SMA 20", type: "sma", period: 20 },
  { label: "SMA 50", type: "sma", period: 50 },
  { label: "SMA 200", type: "sma", period: 200 },
  { label: "EMA 20", type: "ema", period: 20 },
  { label: "EMA 50", type: "ema", period: 50 },
  { label: "RSI", type: "rsi", period: 14 },
  { label: "MACD", type: "macd", period: 12 },
  { label: "Bollinger Bands", type: "bbands", period: 20 },
  { label: "ATR", type: "atr", period: 14 },
  { label: "Stochastic", type: "stoch", period: 14 },
] as const;

export const SECTORS = [
  "Technology",
  "Healthcare",
  "Financials",
  "Consumer Discretionary",
  "Communication",
  "Industrials",
  "Consumer Staples",
  "Energy",
  "Utilities",
  "Real Estate",
  "Materials",
] as const;
