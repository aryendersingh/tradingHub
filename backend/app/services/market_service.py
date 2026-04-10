import asyncio
from app.clients import yfinance_client as yf
from app.cache.redis_cache import get_or_fetch
from app.cache.cache_keys import (
    market_overview_key, MARKET_OVERVIEW_TTL,
    market_sectors_key, MARKET_SECTORS_TTL,
    market_movers_key, MARKET_MOVERS_TTL,
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
