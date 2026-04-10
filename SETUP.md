# TradingHub — Local Setup Guide

## Prerequisites

- **Python 3.12+** (check: `python3 --version`)
- **Node.js 20+** (check: `node --version`)
- **pnpm** (check: `pnpm --version`, install: `npm i -g pnpm`)
- **Docker** (for Redis — or install Redis natively)

## 1. Get API Keys (Free)

| Service | Sign Up | Time | What It Powers |
|---------|---------|------|----------------|
| **Finnhub** | https://finnhub.io/register | ~1 min | Real-time prices, news, analyst ratings, earnings |
| **FRED** | https://fred.stlouisfed.org/docs/api/api_key.html | ~1 min | Treasury yields, GDP, CPI, unemployment, macro data |

Both are completely free with generous rate limits.

## 2. Configure Environment

Edit `backend/.env` and paste your keys:

```bash
FINNHUB_API_KEY=your_finnhub_key_here
FRED_API_KEY=your_fred_key_here
```

The rest of the defaults are fine for local development:

```
REDIS_URL=redis://localhost:6379
CORS_ORIGINS=http://localhost:3000
ENV=development
```

## 3. Start Redis

**Option A — Docker (recommended):**

```bash
docker run -d --name tradinghub-redis -p 6379:6379 redis:7-alpine
```

**Option B — Homebrew (macOS):**

```bash
brew install redis
brew services start redis
```

**Option C — Without Redis:**

The app will still work but every API call hits the source directly (slower, may hit rate limits). No code changes needed — Redis failures are handled gracefully.

## 4. Start the Backend

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Verify it's running:

```bash
curl http://localhost:8000/api/health
# Should return: {"status":"ok"}
```

### First time only — if `.venv` doesn't exist:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 5. Start the Frontend

Open a **new terminal**:

```bash
cd frontend
pnpm dev
```

## 6. Open the App

Go to **http://localhost:3000**

You should see:
- Top: scrolling ticker tape with index prices
- Market status indicator (open/closed/extended)
- S&P 500, Dow, NASDAQ, Russell 2000, VIX cards
- Sector heatmap, market movers, news feed, yield curve

### Try these:
- Type a ticker (e.g. `AAPL`) in the search bar and press Enter
- Click through the tabs: Overview, Chart, Fundamentals, Options, News, Holders
- Visit `/screener` to filter stocks by market cap, P/E, sector
- Visit `/economic` for yield curve, macro indicators, forex rates
- Visit `/watchlist` to manage your watchlist with live prices

## Troubleshooting

### Backend won't start
- Make sure you activated the venv: `source .venv/bin/activate`
- Check Python version: needs 3.12+
- Reinstall deps: `pip install -r requirements.txt`

### "Connection refused" errors on frontend
- Is the backend running on port 8000?
- Check `frontend/.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:8000`

### No data showing up
- Check your API keys are set in `backend/.env`
- Finnhub key: test with `curl "https://finnhub.io/api/v1/quote?symbol=AAPL&token=YOUR_KEY"`
- FRED key: test with `curl "https://api.stlouisfed.org/fred/series?series_id=DGS10&api_key=YOUR_KEY&file_type=json"`

### Redis connection errors
- The app works without Redis (just slower). Check the backend logs — Redis errors are warnings, not fatal.
- If using Docker: `docker ps` to confirm the container is running

### Market data says "closed"
- Normal outside US market hours (9:30 AM–4:00 PM ET, Mon–Fri)
- Index data and news still load; real-time WebSocket prices won't stream until market opens

## Stopping Everything

```bash
# Frontend: Ctrl+C in the frontend terminal
# Backend: Ctrl+C in the backend terminal
# Redis (Docker): docker stop tradinghub-redis
# Redis (Homebrew): brew services stop redis
```
