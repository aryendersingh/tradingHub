import asyncio
from concurrent.futures import ThreadPoolExecutor
from functools import partial

from app.clients import fred_client
from app.clients import finnhub_client as fh
from app.clients import yfinance_client as yf
from app.cache.redis_cache import get_or_fetch
from app.cache.cache_keys import (
    economic_yields_key, ECONOMIC_YIELDS_TTL,
    economic_calendar_key, ECONOMIC_CALENDAR_TTL,
    economic_series_key, ECONOMIC_SERIES_TTL,
    economic_forex_key, ECONOMIC_FOREX_TTL,
    economic_commodities_key, ECONOMIC_COMMODITIES_TTL,
)
from app.utils.helpers import safe_float

_executor = ThreadPoolExecutor(max_workers=2)

MACRO_SERIES = {
    "GDP": "GDP",
    "Real GDP": "GDPC1",
    "CPI": "CPIAUCSL",
    "Core CPI": "CPILFESL",
    "Unemployment": "UNRATE",
    "Nonfarm Payrolls": "PAYEMS",
    "Fed Funds Rate": "DFF",
    "10Y-2Y Spread": "T10Y2Y",
    "PCE": "PCEPI",
}

COMMODITY_SYMBOLS = {
    "Gold": "GC=F",
    "Silver": "SI=F",
    "Crude Oil": "CL=F",
    "Natural Gas": "NG=F",
    "Copper": "HG=F",
}

FOREX_PAIRS = {
    "DXY": "DX-Y.NYB",
    "EUR/USD": "EURUSD=X",
    "USD/JPY": "USDJPY=X",
    "GBP/USD": "GBPUSD=X",
    "USD/CHF": "USDCHF=X",
    "AUD/USD": "AUDUSD=X",
    "USD/CAD": "USDCAD=X",
}


async def get_yields() -> dict:
    return await get_or_fetch(
        economic_yields_key(), ECONOMIC_YIELDS_TTL,
        fred_client.get_yield_curve
    )


async def _fetch_calendar() -> list[dict]:
    loop = asyncio.get_event_loop()
    try:
        cal = await loop.run_in_executor(_executor, fh.economic_calendar)
        events = cal.get("economicCalendar", {}).get("result", [])
        return [
            {
                "country": e.get("country", ""),
                "event": e.get("event", ""),
                "date": e.get("time", ""),
                "impact": e.get("impact", ""),
                "actual": e.get("actual"),
                "estimate": e.get("estimate"),
                "previous": e.get("prev"),
                "unit": e.get("unit", ""),
            }
            for e in events[:50]
            if e.get("country") == "US"
        ]
    except Exception:
        return []


async def get_calendar() -> list[dict]:
    return await get_or_fetch(
        economic_calendar_key(), ECONOMIC_CALENDAR_TTL, _fetch_calendar
    )


async def get_series(series_id: str, limit: int = 252) -> list[dict]:
    async def _fetch():
        s = await fred_client.get_series(series_id, limit)
        if s is None or s.empty:
            return []
        records = []
        for idx, val in s.items():
            if val is not None:
                records.append({
                    "date": idx.strftime("%Y-%m-%d"),
                    "value": round(float(val), 4),
                })
        return records

    return await get_or_fetch(
        economic_series_key(series_id), ECONOMIC_SERIES_TTL, _fetch
    )


async def _fetch_forex() -> list[dict]:
    pairs = []
    tasks = []
    pair_names = list(FOREX_PAIRS.keys())

    for name, symbol in FOREX_PAIRS.items():
        tasks.append(yf.get_ticker_fast_info(symbol))

    results = await asyncio.gather(*tasks, return_exceptions=True)

    for name, result in zip(pair_names, results):
        if isinstance(result, Exception):
            continue
        last = safe_float(result.get("lastPrice"), 0)
        prev = safe_float(result.get("previousClose"), 0)
        change_pct = ((last - prev) / prev * 100) if prev else 0
        pairs.append({
            "pair": name,
            "symbol": FOREX_PAIRS[name],
            "price": round(last, 4),
            "change": round(last - prev, 4),
            "changePercent": round(change_pct, 2),
        })

    return pairs


async def get_forex() -> list[dict]:
    return await get_or_fetch(economic_forex_key(), ECONOMIC_FOREX_TTL, _fetch_forex)


async def get_macro_indicators() -> dict:
    indicators = {}
    for name, series_id in MACRO_SERIES.items():
        val = await fred_client.get_series_latest(series_id)
        if val is not None:
            indicators[name] = round(val, 2)
    return indicators


async def _fetch_commodities() -> list[dict]:
    commodities = []
    tasks = []
    names = list(COMMODITY_SYMBOLS.keys())

    for name, symbol in COMMODITY_SYMBOLS.items():
        tasks.append(yf.get_ticker_fast_info(symbol))

    results = await asyncio.gather(*tasks, return_exceptions=True)

    for name, result in zip(names, results):
        if isinstance(result, Exception):
            continue
        last = safe_float(result.get("lastPrice"), 0)
        prev = safe_float(result.get("previousClose"), 0)
        change = last - prev
        change_pct = (change / prev * 100) if prev else 0
        commodities.append({
            "name": name,
            "symbol": COMMODITY_SYMBOLS[name],
            "price": round(last, 2),
            "change": round(change, 2),
            "changePercent": round(change_pct, 2),
        })

    return commodities


async def get_commodities() -> list[dict]:
    return await get_or_fetch(economic_commodities_key(), ECONOMIC_COMMODITIES_TTL, _fetch_commodities)
