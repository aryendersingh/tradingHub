import asyncio
from concurrent.futures import ThreadPoolExecutor
from functools import partial

from app.clients import finnhub_client as fh
from app.cache.redis_cache import get_or_fetch
from app.cache.cache_keys import ipo_calendar_key, IPO_CALENDAR_TTL
from app.utils.helpers import safe_float

_executor = ThreadPoolExecutor(max_workers=2)

async def _fetch_ipo_calendar(from_date: str, to_date: str) -> list[dict]:
    loop = asyncio.get_event_loop()
    try:
        cal = await loop.run_in_executor(
            _executor, partial(fh.ipo_calendar, from_date, to_date)
        )
        ipos = cal.get("ipoCalendar", [])
        return [
            {
                "date": ipo.get("date", ""),
                "exchange": ipo.get("exchange", ""),
                "name": ipo.get("name", ""),
                "symbol": ipo.get("symbol", ""),
                "price": ipo.get("price", ""),
                "shares": ipo.get("numberOfShares"),
                "totalSharesValue": safe_float(ipo.get("totalSharesValue")),
                "status": ipo.get("status", ""),
            }
            for ipo in ipos
        ]
    except Exception:
        return []

async def get_ipo_calendar(from_date: str, to_date: str) -> list[dict]:
    return await get_or_fetch(
        ipo_calendar_key(from_date, to_date), IPO_CALENDAR_TTL,
        lambda: _fetch_ipo_calendar(from_date, to_date)
    )
