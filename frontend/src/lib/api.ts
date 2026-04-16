import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 15000,
});

// Market
export const getMarketOverview = () => api.get("/market/overview").then((r) => r.data);
export const getMarketSectors = () => api.get("/market/sectors").then((r) => r.data);
export const getMarketMovers = (category = "gainers") =>
  api.get(`/market/movers?category=${category}`).then((r) => r.data);

// Stock
export const getStockQuote = (symbol: string) =>
  api.get(`/stock/${symbol}/quote`).then((r) => r.data);
export const getStockProfile = (symbol: string) =>
  api.get(`/stock/${symbol}/profile`).then((r) => r.data);
export const getStockHistory = (symbol: string, period = "1y", interval = "1d") =>
  api.get(`/stock/${symbol}/history?period=${period}&interval=${interval}`).then((r) => r.data);
export const getStockFundamentals = (symbol: string) =>
  api.get(`/stock/${symbol}/fundamentals`).then((r) => r.data);
export const getStockRatios = (symbol: string) =>
  api.get(`/stock/${symbol}/ratios`).then((r) => r.data);
export const getStockDividends = (symbol: string) =>
  api.get(`/stock/${symbol}/dividends`).then((r) => r.data);

// Holders
export const getInstitutional = (symbol: string) =>
  api.get(`/stock/${symbol}/institutional`).then((r) => r.data);
export const getInsiders = (symbol: string) =>
  api.get(`/stock/${symbol}/insiders`).then((r) => r.data);

// Options
export const getOptionsExpirations = (symbol: string) =>
  api.get(`/stock/${symbol}/options/expirations`).then((r) => r.data);
export const getOptionsChain = (symbol: string, expiry: string) =>
  api.get(`/stock/${symbol}/options/chain?expiry=${expiry}`).then((r) => r.data);

// Technicals
export const getIndicators = (
  symbol: string,
  indicator: string,
  period = 14,
  timeframe = "1y",
  interval = "1d"
) =>
  api
    .get(
      `/stock/${symbol}/indicators?indicator=${indicator}&period=${period}&timeframe=${timeframe}&interval=${interval}`
    )
    .then((r) => r.data);

// News
export const getMarketNews = () => api.get("/news/market").then((r) => r.data);
export const getStockNews = (symbol: string) =>
  api.get(`/news/stock/${symbol}`).then((r) => r.data);
export const getFilings = (symbol: string) =>
  api.get(`/news/filings/${symbol}`).then((r) => r.data);

// Analyst
export const getRatings = (symbol: string) =>
  api.get(`/stock/${symbol}/ratings`).then((r) => r.data);
export const getPriceTargets = (symbol: string) =>
  api.get(`/stock/${symbol}/price-targets`).then((r) => r.data);
export const getEarnings = (symbol: string) =>
  api.get(`/stock/${symbol}/earnings`).then((r) => r.data);

// Economic
export const getYields = () => api.get("/economic/yields").then((r) => r.data);
export const getEconomicCalendar = () => api.get("/economic/calendar").then((r) => r.data);
export const getEconomicSeries = (seriesId: string, limit = 252) =>
  api.get(`/economic/indicators/${seriesId}?limit=${limit}`).then((r) => r.data);
export const getMacroIndicators = () => api.get("/economic/macro").then((r) => r.data);
export const getForex = () => api.get("/economic/forex").then((r) => r.data);

// Screener
export const scanStocks = (filters: Record<string, unknown>) =>
  api.post("/screener/scan", filters).then((r) => r.data);

// Peers
export const getPeers = (symbol: string) =>
  api.get(`/stock/${symbol}/peers`).then((r) => r.data);

// Short Interest
export const getShortInterest = (symbol: string) =>
  api.get(`/stock/${symbol}/short-interest`).then((r) => r.data);

// Market Breadth
export const getMarketBreadth = () => api.get("/market/breadth").then((r) => r.data);

// Put/Call Ratio
export const getPutCallRatio = () => api.get("/market/putcall").then((r) => r.data);

// Global Indices
export const getGlobalIndices = () => api.get("/market/global").then((r) => r.data);

// Fear & Greed
export const getFearGreed = () => api.get("/market/fear-greed").then((r) => r.data);

// Earnings Calendar
export const getEarningsCalendar = (fromDate?: string, toDate?: string) =>
  api.get("/stock/earnings-calendar", { params: { from_date: fromDate, to_date: toDate } }).then((r) => r.data);

// IPO Calendar
export const getIPOCalendar = (fromDate?: string, toDate?: string) =>
  api.get("/economic/ipo-calendar", { params: { from_date: fromDate, to_date: toDate } }).then((r) => r.data);

// Commodities
export const getCommodities = () => api.get("/economic/commodities").then((r) => r.data);

// Stock Comparison
export const getStockComparison = (symbols: string[], period = "1y", interval = "1d") =>
  api.get(`/stock/compare?symbols=${symbols.join(",")}&period=${period}&interval=${interval}`).then((r) => r.data);

export default api;
