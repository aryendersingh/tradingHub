export interface IndexData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  dayHigh: number | null;
  dayLow: number | null;
}

export interface MarketOverview {
  indices: Record<string, IndexData>;
  marketStatus: "open" | "extended" | "closed";
}

export interface SectorData {
  name: string;
  symbol: string;
  price: number;
  changePercent: number;
}

export interface StockQuote {
  symbol: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  high: number | null;
  low: number | null;
  open: number | null;
  previousClose: number | null;
  timestamp: number | null;
  preMarketPrice: number | null;
  preMarketChange: number | null;
  preMarketChangePercent: number | null;
  postMarketPrice: number | null;
  postMarketChange: number | null;
  postMarketChangePercent: number | null;
}

export interface StockProfile {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  exchange: string;
  currency: string;
  marketCap: number | null;
  enterpriseValue: number | null;
  employees: number | null;
  website: string;
  description: string;
  country: string;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  avgVolume: number | null;
  beta: number | null;
  sharesOutstanding: number | null;
  floatShares: number | null;
  shortRatio: number | null;
}

export interface OHLCV {
  time: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
}

export interface StockRatios {
  symbol: string;
  trailingPE: number | null;
  forwardPE: number | null;
  priceToBook: number | null;
  priceToSales: number | null;
  enterpriseToEbitda: number | null;
  pegRatio: number | null;
  returnOnEquity: number | null;
  returnOnAssets: number | null;
  grossMargins: number | null;
  operatingMargins: number | null;
  profitMargins: number | null;
  debtToEquity: number | null;
  currentRatio: number | null;
  revenueGrowth: number | null;
  earningsGrowth: number | null;
  dividendYield: number | null;
  [key: string]: string | number | null | undefined;
}

export interface OptionContract {
  strike: number;
  lastPrice: number | null;
  bid: number | null;
  ask: number | null;
  change: number | null;
  percentChange: number | null;
  volume: number | null;
  openInterest: number | null;
  impliedVolatility: number | null;
  inTheMoney: boolean;
  contractSymbol: string;
}

export interface OptionsChainData {
  calls: OptionContract[];
  puts: OptionContract[];
  expiry: string;
}

export interface NewsArticle {
  id: number | string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image: string;
  datetime: number;
  category?: string;
}

export interface AnalystRatings {
  symbol: string;
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
  period: string;
}

export interface PriceTargets {
  symbol: string;
  current: number | null;
  low: number | null;
  high: number | null;
  mean: number | null;
  median: number | null;
}

export interface EarningsEntry {
  date: string;
  epsEstimate: number | null;
  epsActual: number | null;
  surprise: number | null;
}

export interface EconomicEvent {
  country: string;
  event: string;
  date: string;
  impact: string;
  actual: number | string | null;
  estimate: number | string | null;
  previous: number | string | null;
  unit: string;
}

export interface ForexPair {
  pair: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface WatchlistItem {
  symbol: string;
  name?: string;
}

export interface MoverData {
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  volume: number | null;
}

export interface InstitutionalHolder {
  holder: string;
  shares: number | null;
  dateReported: string | null;
  percentOut: number | null;
  value: number | null;
}

export interface InsiderTransaction {
  insider: string;
  relation: string;
  date: string | null;
  transaction: string;
  shares: number | null;
  value: number | null;
}

export interface PeerData {
  symbol: string;
  name: string;
  marketCap: number | null;
  trailingPE: number | null;
  priceToBook: number | null;
  grossMargins: number | null;
  operatingMargins: number | null;
  profitMargins: number | null;
  changePercent: number | null;
}

export interface PeerComparison {
  symbol: string;
  sector: string;
  peers: PeerData[];
}

export interface EarningsCalendarEntry {
  date: string;
  symbol: string;
  hour: string;
  epsEstimate: number | null;
  epsActual: number | null;
  revenueEstimate: number | null;
  revenueActual: number | null;
}

export interface MarketBreadth {
  advancing: number;
  declining: number;
  advanceDeclineRatio: number;
  above200SMA: number;
  below200SMA: number;
  pctAbove200SMA: number;
  newHighs: number;
  newLows: number;
}

export interface PutCallRatio {
  ratio: number | null;
  signal: string;
}

export interface ShortInterest {
  symbol: string;
  shortPercentOfFloat: number | null;
  shortRatio: number | null;
  sharesShort: number | null;
  sharesShortPriorMonth: number | null;
  dateShortInterest: number | null;
}

export interface CommodityData {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface GlobalIndex {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface FearGreedComponent {
  value: number;
  score: number;
}

export interface FearGreedData {
  score: number;
  label: string;
  components: Record<string, FearGreedComponent>;
}

export interface IPOEntry {
  date: string;
  exchange: string;
  name: string;
  symbol: string;
  price: string;
  shares: number | null;
  totalSharesValue: number | null;
  status: string;
}

export interface PortfolioPosition {
  symbol: string;
  name?: string;
  shares: number;
  costBasis: number;
  addedAt: string;
}

export interface ComparisonSeries {
  symbols: string[];
  series: Record<string, { time: string; value: number }[]>;
}
