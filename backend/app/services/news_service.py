import asyncio
from concurrent.futures import ThreadPoolExecutor
from functools import partial
from datetime import datetime, timedelta

from app.clients import finnhub_client as fh
from app.cache.redis_cache import get_or_fetch
from app.cache.cache_keys import (
    news_market_key, NEWS_MARKET_TTL,
    news_stock_key, NEWS_STOCK_TTL,
    filings_key, NEWS_FILINGS_TTL,
)

_executor = ThreadPoolExecutor(max_workers=2)


async def _fetch_market_news() -> list[dict]:
    loop = asyncio.get_event_loop()
    try:
        news = await loop.run_in_executor(_executor, partial(fh.general_news, "general"))
        return [
            {
                "id": item.get("id"),
                "headline": item.get("headline", ""),
                "summary": item.get("summary", ""),
                "source": item.get("source", ""),
                "url": item.get("url", ""),
                "image": item.get("image", ""),
                "datetime": item.get("datetime"),
                "category": item.get("category", ""),
            }
            for item in (news or [])[:30]
        ]
    except Exception:
        return []


async def get_market_news() -> list[dict]:
    return await get_or_fetch(news_market_key(), NEWS_MARKET_TTL, _fetch_market_news)


async def _fetch_stock_news(symbol: str) -> list[dict]:
    loop = asyncio.get_event_loop()
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        month_ago = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        news = await loop.run_in_executor(
            _executor, partial(fh.company_news, symbol, month_ago, today)
        )
        return [
            {
                "id": item.get("id"),
                "headline": item.get("headline", ""),
                "summary": item.get("summary", ""),
                "source": item.get("source", ""),
                "url": item.get("url", ""),
                "image": item.get("image", ""),
                "datetime": item.get("datetime"),
                "related": item.get("related", ""),
            }
            for item in (news or [])[:20]
        ]
    except Exception:
        return []


async def get_stock_news(symbol: str) -> list[dict]:
    return await get_or_fetch(
        news_stock_key(symbol), NEWS_STOCK_TTL,
        lambda: _fetch_stock_news(symbol)
    )


async def _fetch_filings(symbol: str) -> list[dict]:
    from app.clients import yfinance_client as yf
    try:
        info = await yf.get_ticker_info(symbol)
        sec_filings = info.get("secFilings", [])
        if sec_filings:
            return [
                {
                    "type": f.get("type", ""),
                    "title": f.get("title", ""),
                    "date": f.get("date", ""),
                    "url": f.get("edgarUrl", ""),
                }
                for f in sec_filings[:20]
            ]
    except Exception:
        pass
    return []


async def get_filings(symbol: str) -> list[dict]:
    return await get_or_fetch(
        filings_key(symbol), NEWS_FILINGS_TTL,
        lambda: _fetch_filings(symbol)
    )
