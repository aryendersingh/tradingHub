# TradingHub

A Bloomberg terminal-inspired web application for US equity trading decisions. Real-time market data, charts, fundamentals, options, news, and economic indicators — all in one place.

![Stack](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square) ![Stack](https://img.shields.io/badge/Frontend-Next.js_14-000000?style=flat-square) ![Stack](https://img.shields.io/badge/Charts-TradingView_Lightweight-2962FF?style=flat-square) ![Stack](https://img.shields.io/badge/Cache-Redis-DC382D?style=flat-square)

## Features

### Market Overview
- Live major indices (S&P 500, Dow Jones, NASDAQ, Russell 2000, VIX)
- Sector performance heatmap (11 SPDR sector ETFs)
- Top gainers, losers, and most active stocks
- Scrolling ticker tape with real-time prices
- Market status indicator (open / extended hours / closed)

### Stock Analysis
- Real-time quotes via Finnhub WebSocket
- Interactive candlestick charts with volume (TradingView Lightweight Charts)
- 9 timeframes: 1D, 5D, 1M, 3M, 6M, YTD, 1Y, 5Y, MAX
- Full financial statements (income statement, balance sheet, cash flow)
- 20+ key ratios: P/E, P/B, EV/EBITDA, ROE, margins, debt ratios, growth
- Dividend history and yield data
- Institutional holders and insider transactions

### Options
- Full options chain with calls and puts by expiration
- Greeks (implied from yfinance): IV, open interest, volume
- In-the-money highlighting
- Strike-centered two-sided table layout

### Technical Analysis
- Server-side indicator computation via pandas-ta (zero API cost)
- SMA/EMA (20, 50, 200), RSI, MACD, Bollinger Bands, ATR, VWAP, Stochastic, OBV

### News & Analyst Data
- Real-time market and company news (Finnhub)
- SEC filings via yfinance + EDGAR
- Analyst ratings (buy/hold/sell breakdown)
- Price targets (low, mean, median, high)
- Earnings calendar with EPS estimates vs actuals

### Economic Dashboard
- US Treasury yield curve (1M through 30Y via FRED)
- Economic calendar (FOMC, CPI, NFP, GDP events)
- Macro indicators: Fed funds rate, GDP, CPI, unemployment, PCE, 10Y-2Y spread
- Forex rates: DXY, EUR/USD, USD/JPY, GBP/USD, and more

### Screening & Watchlists
- Stock screener with filters: market cap, P/E, sector, dividend yield, price
- Persistent watchlist (localStorage) with live WebSocket prices

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python, FastAPI, Redis, APScheduler |
| **Frontend** | Next.js 14 (App Router), React, TailwindCSS |
| **Charts** | TradingView Lightweight Charts v5 |
| **Data** | yfinance, Finnhub, FRED, SEC EDGAR |
| **State** | Zustand (client), TanStack Query (server) |
| **Real-time** | Finnhub WebSocket -> FastAPI relay -> Browser |

## Data Sources

| Source | Cost | What It Provides |
|--------|------|-----------------|
| **Finnhub** | Free (60 req/min) | Real-time WebSocket prices, news, analyst ratings, earnings, economic calendar |
| **yfinance** | Free | Historical OHLCV, fundamentals, options chains, holders, dividends, screener |
| **FRED** | Free | Treasury yields, GDP, CPI, unemployment, fed funds rate, all macro data |
| **SEC EDGAR** | Free | Company filings (10-K, 10-Q, 8-K) |

## Quick Start

See [SETUP.md](SETUP.md) for detailed instructions.

```bash
# 1. Set API keys in backend/.env
#    Get free keys from: finnhub.io/register and fred.stlouisfed.org

# 2. Start Redis
docker run -d --name tradinghub-redis -p 6379:6379 redis:7-alpine

# 3. Start backend
cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000

# 4. Start frontend (new terminal)
cd frontend && pnpm dev

# 5. Open http://localhost:3000
```

## Project Structure

```
tradingHub/
├── backend/                    # Python FastAPI
│   ├── app/
│   │   ├── main.py             # App factory, CORS, lifespan
│   │   ├── config.py           # Environment settings
│   │   ├── api/                # Route handlers (market, stock, options, etc.)
│   │   ├── services/           # Business logic + data fetching
│   │   ├── clients/            # API wrappers (yfinance, finnhub, fred, edgar)
│   │   ├── cache/              # Redis cache-aside with TTL
│   │   └── utils/              # Market hours, helpers
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                   # Next.js 14
│   ├── src/
│   │   ├── app/                # Pages (dashboard, stock/[symbol], screener, economic, watchlist)
│   │   ├── components/         # UI components (market, stock, options, news, economic, etc.)
│   │   ├── hooks/              # React hooks (WebSocket, data fetching, store)
│   │   └── lib/                # API client, formatters, types, constants
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml          # Local dev (backend + redis + frontend)
├── SETUP.md                    # Detailed setup instructions
└── .env.example                # Template for API keys
```

## Deployment

### Railway (Backend) + Vercel (Frontend) — Recommended

**Backend on Railway:**
1. Create a new Railway project
2. Add a service from this repo, set root directory to `backend/`
3. Add a Redis plugin (auto-injects `REDIS_URL`)
4. Set environment variables: `FINNHUB_API_KEY`, `FRED_API_KEY`, `CORS_ORIGINS`

**Frontend on Vercel:**
1. Import this repo on Vercel
2. Set root directory to `frontend/`
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL` = your Railway backend URL
   - `NEXT_PUBLIC_WS_URL` = your Railway backend URL (wss://)

### Docker Compose (Self-hosted)

```bash
docker-compose up --build
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check |
| `GET /api/market/overview` | Major indices + market status |
| `GET /api/market/sectors` | Sector ETF performance |
| `GET /api/market/movers?category=gainers` | Top movers (gainers/losers/most_actives) |
| `GET /api/stock/{symbol}/quote` | Real-time quote |
| `GET /api/stock/{symbol}/profile` | Company profile |
| `GET /api/stock/{symbol}/history?period=1y&interval=1d` | OHLCV history |
| `GET /api/stock/{symbol}/fundamentals` | Financial statements |
| `GET /api/stock/{symbol}/ratios` | Key financial ratios |
| `GET /api/stock/{symbol}/dividends` | Dividend data |
| `GET /api/stock/{symbol}/institutional` | Institutional holders |
| `GET /api/stock/{symbol}/insiders` | Insider transactions |
| `GET /api/stock/{symbol}/options/expirations` | Available option expiries |
| `GET /api/stock/{symbol}/options/chain?expiry=YYYY-MM-DD` | Options chain |
| `GET /api/stock/{symbol}/indicators?indicator=rsi&period=14` | Technical indicators |
| `GET /api/stock/{symbol}/ratings` | Analyst ratings |
| `GET /api/stock/{symbol}/price-targets` | Analyst price targets |
| `GET /api/stock/{symbol}/earnings` | Earnings history |
| `GET /api/news/market` | Market news |
| `GET /api/news/stock/{symbol}` | Company news |
| `GET /api/news/filings/{symbol}` | SEC filings |
| `GET /api/economic/yields` | Treasury yield curve |
| `GET /api/economic/calendar` | Economic calendar |
| `GET /api/economic/macro` | Macro indicators |
| `GET /api/economic/forex` | Forex rates |
| `POST /api/screener/scan` | Stock screener |
| `WS /ws/prices` | Real-time price WebSocket |

## License

MIT
