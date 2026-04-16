import asyncio
from concurrent.futures import ThreadPoolExecutor
from functools import partial

from app.clients import finnhub_client as fh
from app.clients import yfinance_client as yf
from app.cache.redis_cache import get_or_fetch
from app.cache.cache_keys import (
    analyst_ratings_key, ANALYST_RATINGS_TTL,
    analyst_targets_key, ANALYST_TARGETS_TTL,
    earnings_key, EARNINGS_TTL,
    earnings_calendar_key, EARNINGS_CALENDAR_TTL,
)
from app.utils.helpers import safe_float, safe_int, df_to_records

_executor = ThreadPoolExecutor(max_workers=2)


async def _fetch_ratings(symbol: str) -> dict:
    loop = asyncio.get_event_loop()
    try:
        trends = await loop.run_in_executor(
            _executor, partial(fh.recommendation_trends, symbol)
        )
        if trends:
            latest = trends[0]
            return {
                "symbol": symbol,
                "strongBuy": latest.get("strongBuy", 0),
                "buy": latest.get("buy", 0),
                "hold": latest.get("hold", 0),
                "sell": latest.get("sell", 0),
                "strongSell": latest.get("strongSell", 0),
                "period": latest.get("period", ""),
            }
    except Exception:
        pass

    # Fallback to yfinance
    try:
        recs = await yf.get_recommendations(symbol)
        if recs is not None and not recs.empty:
            latest = recs.iloc[0]
            return {
                "symbol": symbol,
                "strongBuy": safe_int(latest.get("strongBuy"), 0),
                "buy": safe_int(latest.get("buy"), 0),
                "hold": safe_int(latest.get("hold"), 0),
                "sell": safe_int(latest.get("sell"), 0),
                "strongSell": safe_int(latest.get("strongSell"), 0),
                "period": str(recs.index[0]) if len(recs.index) > 0 else "",
            }
    except Exception:
        pass

    return {"symbol": symbol, "strongBuy": 0, "buy": 0, "hold": 0, "sell": 0, "strongSell": 0, "period": ""}


async def get_ratings(symbol: str) -> dict:
    return await get_or_fetch(
        analyst_ratings_key(symbol), ANALYST_RATINGS_TTL,
        lambda: _fetch_ratings(symbol)
    )


async def _fetch_price_targets(symbol: str) -> dict:
    try:
        targets = await yf.get_analyst_price_targets(symbol)
        return {
            "symbol": symbol,
            "current": safe_float(targets.get("current")),
            "low": safe_float(targets.get("low")),
            "high": safe_float(targets.get("high")),
            "mean": safe_float(targets.get("mean")),
            "median": safe_float(targets.get("median")),
        }
    except Exception:
        return {"symbol": symbol, "current": None, "low": None, "high": None, "mean": None, "median": None}


async def get_price_targets(symbol: str) -> dict:
    return await get_or_fetch(
        analyst_targets_key(symbol), ANALYST_TARGETS_TTL,
        lambda: _fetch_price_targets(symbol)
    )


async def _fetch_earnings(symbol: str) -> list[dict]:
    try:
        df = await yf.get_earnings_dates(symbol)
        if df is None or df.empty:
            return []
        records = []
        for idx, row in df.iterrows():
            records.append({
                "date": idx.strftime("%Y-%m-%d") if hasattr(idx, "strftime") else str(idx),
                "epsEstimate": safe_float(row.get("EPS Estimate")),
                "epsActual": safe_float(row.get("Reported EPS")),
                "surprise": safe_float(row.get("Surprise(%)")),
            })
        return records[:12]
    except Exception:
        return []


async def get_earnings(symbol: str) -> list[dict]:
    return await get_or_fetch(
        earnings_key(symbol), EARNINGS_TTL,
        lambda: _fetch_earnings(symbol)
    )


async def _fetch_earnings_calendar(from_date: str, to_date: str) -> list[dict]:
    loop = asyncio.get_event_loop()
    try:
        cal = await loop.run_in_executor(
            _executor, partial(fh.earnings_calendar, from_date, to_date)
        )
        events = cal.get("earningsCalendar", [])
        return [
            {
                "date": e.get("date", ""),
                "symbol": e.get("symbol", ""),
                "hour": e.get("hour", ""),
                "epsEstimate": safe_float(e.get("epsEstimate")),
                "epsActual": safe_float(e.get("epsActual")),
                "revenueEstimate": safe_float(e.get("revenueEstimate")),
                "revenueActual": safe_float(e.get("revenueActual")),
            }
            for e in events[:100]
        ]
    except Exception:
        return []


async def get_earnings_calendar(from_date: str, to_date: str) -> list[dict]:
    return await get_or_fetch(
        earnings_calendar_key(from_date, to_date), EARNINGS_CALENDAR_TTL,
        lambda: _fetch_earnings_calendar(from_date, to_date)
    )
