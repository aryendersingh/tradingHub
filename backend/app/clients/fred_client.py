import asyncio
from concurrent.futures import ThreadPoolExecutor
from functools import partial

from fredapi import Fred
import pandas as pd

from app.config import settings

_executor = ThreadPoolExecutor(max_workers=2)
_client: Fred | None = None


def _get_fred() -> Fred:
    global _client
    if _client is None and settings.fred_api_key:
        _client = Fred(api_key=settings.fred_api_key)
    return _client


async def _run_sync(fn, *args, **kwargs):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, partial(fn, *args, **kwargs))


def _get_series(series_id: str, limit: int = 252) -> pd.Series:
    fred = _get_fred()
    if fred is None:
        return pd.Series()
    return fred.get_series(series_id).tail(limit)


def _get_series_latest(series_id: str) -> float | None:
    fred = _get_fred()
    if fred is None:
        return None
    s = fred.get_series(series_id).dropna()
    return float(s.iloc[-1]) if len(s) > 0 else None


YIELD_SERIES = {
    "1M": "DGS1MO",
    "3M": "DGS3MO",
    "6M": "DGS6MO",
    "1Y": "DGS1",
    "2Y": "DGS2",
    "3Y": "DGS3",
    "5Y": "DGS5",
    "7Y": "DGS7",
    "10Y": "DGS10",
    "20Y": "DGS20",
    "30Y": "DGS30",
}


def _get_yield_curve() -> dict:
    fred = _get_fred()
    if fred is None:
        return {}
    result = {}
    for label, series_id in YIELD_SERIES.items():
        try:
            s = fred.get_series(series_id).dropna()
            if len(s) > 0:
                result[label] = float(s.iloc[-1])
        except Exception:
            pass
    return result


async def get_series(series_id: str, limit: int = 252) -> pd.Series:
    return await _run_sync(_get_series, series_id, limit)


async def get_series_latest(series_id: str) -> float | None:
    return await _run_sync(_get_series_latest, series_id)


async def get_yield_curve() -> dict:
    return await _run_sync(_get_yield_curve)
