import asyncio
from app.clients import yfinance_client as yf
from app.cache.redis_cache import get_or_fetch
from app.cache.cache_keys import (
    market_overview_key, MARKET_OVERVIEW_TTL,
    market_sectors_key, MARKET_SECTORS_TTL,
    market_movers_key, MARKET_MOVERS_TTL,
    global_indices_key, GLOBAL_INDICES_TTL,
    putcall_ratio_key, PUTCALL_RATIO_TTL,
    fear_greed_key, FEAR_GREED_TTL,
    market_breadth_key, MARKET_BREADTH_TTL,
)
from app.utils.helpers import safe_float
from app.utils.market_hours import market_status

INDEX_SYMBOLS = {
    "S&P 500": "^GSPC",
    "Dow Jones": "^DJI",
    "NASDAQ": "^IXIC",
    "Russell 2000": "^RUT",
    "VIX": "^VIX",
}

GLOBAL_INDEX_SYMBOLS = {
    "FTSE 100": "^FTSE",
    "Nikkei 225": "^N225",
    "DAX": "^GDAXI",
    "Hang Seng": "^HSI",
    "Shanghai": "000001.SS",
    "BSE Sensex": "^BSESN",
}

BREADTH_UNIVERSE = [
    "AAPL", "MSFT", "AMZN", "NVDA", "GOOGL", "META", "TSLA", "BRK-B", "UNH", "JNJ",
    "JPM", "V", "PG", "XOM", "MA", "HD", "CVX", "MRK", "ABBV", "LLY",
    "PEP", "KO", "COST", "AVGO", "WMT", "MCD", "CSCO", "ACN", "TMO", "ABT",
    "CRM", "DHR", "NEE", "LIN", "NKE", "PM", "TXN", "UNP", "RTX", "LOW",
    "HON", "ORCL", "QCOM", "AMGN", "BA", "GS", "CAT", "SBUX", "MS", "BLK",
]

SECTOR_ETFS = {
    "Technology": "XLK",
    "Financials": "XLF",
    "Healthcare": "XLV",
    "Energy": "XLE",
    "Industrials": "XLI",
    "Consumer Discretionary": "XLY",
    "Consumer Staples": "XLP",
    "Utilities": "XLU",
    "Real Estate": "XLRE",
    "Communication": "XLC",
    "Materials": "XLB",
}


async def _fetch_overview() -> dict:
    indices = {}
    tasks = []
    names = list(INDEX_SYMBOLS.keys())
    symbols = list(INDEX_SYMBOLS.values())

    for name, symbol in zip(names, symbols):
        tasks.append(yf.get_ticker_fast_info(symbol))

    results = await asyncio.gather(*tasks, return_exceptions=True)

    for name, result in zip(names, results):
        if isinstance(result, Exception):
            continue
        last = safe_float(result.get("lastPrice"), 0)
        prev = safe_float(result.get("previousClose"), 0)
        change = last - prev
        change_pct = (change / prev * 100) if prev else 0
        indices[name] = {
            "symbol": INDEX_SYMBOLS[name],
            "price": round(last, 2),
            "change": round(change, 2),
            "changePercent": round(change_pct, 2),
            "dayHigh": safe_float(result.get("dayHigh")),
            "dayLow": safe_float(result.get("dayLow")),
        }

    return {"indices": indices, "marketStatus": market_status()}


async def get_overview() -> dict:
    return await get_or_fetch(market_overview_key(), MARKET_OVERVIEW_TTL, _fetch_overview)


async def _fetch_sectors() -> list[dict]:
    sectors = []
    tasks = []
    names = list(SECTOR_ETFS.keys())

    for name, symbol in SECTOR_ETFS.items():
        tasks.append(yf.get_ticker_fast_info(symbol))

    results = await asyncio.gather(*tasks, return_exceptions=True)

    for name, result in zip(names, results):
        if isinstance(result, Exception):
            continue
        last = safe_float(result.get("lastPrice"), 0)
        prev = safe_float(result.get("previousClose"), 0)
        change_pct = ((last - prev) / prev * 100) if prev else 0
        sectors.append({
            "name": name,
            "symbol": SECTOR_ETFS[name],
            "price": round(last, 2),
            "changePercent": round(change_pct, 2),
        })

    sectors.sort(key=lambda x: x["changePercent"], reverse=True)
    return sectors


async def get_sectors() -> list[dict]:
    return await get_or_fetch(market_sectors_key(), MARKET_SECTORS_TTL, _fetch_sectors)


async def _fetch_movers(category: str) -> list[dict]:
    try:
        import yfinance as _yf
        if category == "gainers":
            sc = _yf.Screener()
            sc.set_predefined_body("day_gainers")
        elif category == "losers":
            sc = _yf.Screener()
            sc.set_predefined_body("day_losers")
        else:
            sc = _yf.Screener()
            sc.set_predefined_body("most_actives")

        result = sc.response
        quotes = result.get("quotes", [])[:15]
        movers = []
        for q in quotes:
            movers.append({
                "symbol": q.get("symbol", ""),
                "name": q.get("shortName", q.get("longName", "")),
                "price": safe_float(q.get("regularMarketPrice")),
                "change": safe_float(q.get("regularMarketChange")),
                "changePercent": safe_float(q.get("regularMarketChangePercent")),
                "volume": safe_float(q.get("regularMarketVolume")),
            })
        return movers
    except Exception:
        return []


async def get_movers(category: str = "gainers") -> list[dict]:
    return await get_or_fetch(
        market_movers_key(category), MARKET_MOVERS_TTL,
        lambda: _fetch_movers(category)
    )


async def _fetch_global_indices() -> list[dict]:
    indices = []
    tasks = []
    names = list(GLOBAL_INDEX_SYMBOLS.keys())

    for name, symbol in GLOBAL_INDEX_SYMBOLS.items():
        tasks.append(yf.get_ticker_fast_info(symbol))

    results = await asyncio.gather(*tasks, return_exceptions=True)

    for name, result in zip(names, results):
        if isinstance(result, Exception):
            continue
        last = safe_float(result.get("lastPrice"), 0)
        prev = safe_float(result.get("previousClose"), 0)
        change = last - prev
        change_pct = (change / prev * 100) if prev else 0
        indices.append({
            "name": name,
            "symbol": GLOBAL_INDEX_SYMBOLS[name],
            "price": round(last, 2),
            "change": round(change, 2),
            "changePercent": round(change_pct, 2),
        })

    return indices


async def get_global_indices() -> list[dict]:
    return await get_or_fetch(global_indices_key(), GLOBAL_INDICES_TTL, _fetch_global_indices)


async def _fetch_breadth() -> dict:
    tasks = []
    for symbol in BREADTH_UNIVERSE:
        tasks.append(yf.get_ticker_history(symbol, period="1y", interval="1d"))

    results = await asyncio.gather(*tasks, return_exceptions=True)

    advancing = 0
    declining = 0
    above_200 = 0
    below_200 = 0
    new_highs = 0
    new_lows = 0
    total = 0

    for result in results:
        if isinstance(result, Exception) or result is None or result.empty:
            continue
        total += 1
        closes = result["Close"]
        if len(closes) < 2:
            continue

        today = float(closes.iloc[-1])
        yesterday = float(closes.iloc[-2])

        if today >= yesterday:
            advancing += 1
        else:
            declining += 1

        if len(closes) >= 200:
            sma_200 = float(closes.tail(200).mean())
            if today > sma_200:
                above_200 += 1
            else:
                below_200 += 1

        high_52 = float(closes.max())
        low_52 = float(closes.min())
        if today >= high_52 * 0.98:
            new_highs += 1
        if today <= low_52 * 1.02:
            new_lows += 1

    ratio = round(advancing / declining, 2) if declining > 0 else advancing
    pct_above = round(above_200 / total * 100, 1) if total > 0 else 0

    return {
        "advancing": advancing,
        "declining": declining,
        "advanceDeclineRatio": ratio,
        "above200SMA": above_200,
        "below200SMA": below_200,
        "pctAbove200SMA": pct_above,
        "newHighs": new_highs,
        "newLows": new_lows,
    }


async def get_breadth() -> dict:
    return await get_or_fetch(market_breadth_key(), MARKET_BREADTH_TTL, _fetch_breadth)


async def _fetch_putcall_ratio() -> dict:
    try:
        info = await yf.get_ticker_fast_info("^VIX")
        vix = safe_float(info.get("lastPrice"), 20)
        # Approximate put/call from VIX: higher VIX = more puts
        ratio = round(0.5 + (vix - 15) * 0.03, 2)
        ratio = max(0.4, min(ratio, 1.8))
        if ratio < 0.7:
            signal = "Bullish"
        elif ratio > 1.0:
            signal = "Bearish"
        else:
            signal = "Neutral"
        return {"ratio": ratio, "signal": signal}
    except Exception:
        return {"ratio": None, "signal": "Unknown"}


async def get_putcall_ratio() -> dict:
    return await get_or_fetch(putcall_ratio_key(), PUTCALL_RATIO_TTL, _fetch_putcall_ratio)


async def _fetch_fear_greed() -> dict:
    try:
        # Gather all component data concurrently
        vix_task = yf.get_ticker_fast_info("^VIX")
        spy_task = yf.get_ticker_history("SPY", period="6mo", interval="1d")
        tlt_task = yf.get_ticker_fast_info("TLT")
        spy_info_task = yf.get_ticker_fast_info("SPY")

        vix_info, spy_hist, tlt_info, spy_current = await asyncio.gather(
            vix_task, spy_task, tlt_task, spy_info_task, return_exceptions=True
        )

        components = {}

        # 1. VIX score (low VIX = greed)
        if not isinstance(vix_info, Exception):
            vix_val = safe_float(vix_info.get("lastPrice"), 20)
            vix_score = max(0, min(100, 100 - (vix_val - 12) * 3.5))
            components["vix"] = {"value": round(vix_val, 2), "score": round(vix_score)}
        else:
            components["vix"] = {"value": 20, "score": 50}

        # 2. Momentum: SPY vs 125-day SMA
        if not isinstance(spy_hist, Exception) and spy_hist is not None and len(spy_hist) >= 125:
            closes = spy_hist["Close"]
            current = float(closes.iloc[-1])
            sma_125 = float(closes.tail(125).mean())
            pct_above = (current - sma_125) / sma_125 * 100
            momentum_score = max(0, min(100, 50 + pct_above * 5))
            components["momentum"] = {"value": round(pct_above, 2), "score": round(momentum_score)}
        else:
            components["momentum"] = {"value": 0, "score": 50}

        # 3. Safe haven demand (TLT vs SPY performance)
        if not isinstance(tlt_info, Exception) and not isinstance(spy_current, Exception):
            tlt_last = safe_float(tlt_info.get("lastPrice"), 0)
            tlt_prev = safe_float(tlt_info.get("previousClose"), 0)
            spy_last = safe_float(spy_current.get("lastPrice"), 0)
            spy_prev = safe_float(spy_current.get("previousClose"), 0)
            tlt_chg = ((tlt_last - tlt_prev) / tlt_prev * 100) if tlt_prev else 0
            spy_chg = ((spy_last - spy_prev) / spy_prev * 100) if spy_prev else 0
            diff = spy_chg - tlt_chg
            safe_score = max(0, min(100, 50 + diff * 15))
            components["safeHaven"] = {"value": round(diff, 2), "score": round(safe_score)}
        else:
            components["safeHaven"] = {"value": 0, "score": 50}

        # 4. Breadth approximation
        breadth_pct = components.get("momentum", {}).get("value", 0)
        breadth_score = max(0, min(100, 50 + breadth_pct * 4))
        components["breadth"] = {"value": round(breadth_pct, 1), "score": round(breadth_score)}

        # 5. Put/Call approximation from VIX
        pc = components["vix"]["score"]
        components["putCallRatio"] = {"value": round(1.0 - (pc - 50) * 0.01, 2), "score": round(pc)}

        # Composite score
        scores = [c["score"] for c in components.values()]
        composite = round(sum(scores) / len(scores))

        if composite <= 20:
            label = "Extreme Fear"
        elif composite <= 40:
            label = "Fear"
        elif composite <= 60:
            label = "Neutral"
        elif composite <= 80:
            label = "Greed"
        else:
            label = "Extreme Greed"

        return {"score": composite, "label": label, "components": components}
    except Exception:
        return {"score": 50, "label": "Neutral", "components": {}}


async def get_fear_greed() -> dict:
    return await get_or_fetch(fear_greed_key(), FEAR_GREED_TTL, _fetch_fear_greed)
