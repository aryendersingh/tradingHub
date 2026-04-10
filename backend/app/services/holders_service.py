from app.clients import yfinance_client as yf
from app.cache.redis_cache import get_or_fetch
from app.cache.cache_keys import (
    stock_holders_key, STOCK_HOLDERS_TTL,
    stock_insiders_key, STOCK_INSIDERS_TTL,
)
from app.utils.helpers import safe_float, safe_int, df_to_records


async def _fetch_institutional(symbol: str) -> list[dict]:
    try:
        df = await yf.get_institutional_holders(symbol)
        if df is None or df.empty:
            return []
        records = []
        for _, row in df.iterrows():
            records.append({
                "holder": str(row.get("Holder", "")),
                "shares": safe_int(row.get("Shares")),
                "dateReported": str(row.get("Date Reported", "")) if row.get("Date Reported") is not None else None,
                "percentOut": safe_float(row.get("% Out")),
                "value": safe_int(row.get("Value")),
            })
        return records
    except Exception:
        return []


async def get_institutional(symbol: str) -> list[dict]:
    return await get_or_fetch(
        stock_holders_key(symbol, "institutional"), STOCK_HOLDERS_TTL,
        lambda: _fetch_institutional(symbol)
    )


async def _fetch_insiders(symbol: str) -> list[dict]:
    try:
        df = await yf.get_insider_transactions(symbol)
        if df is None or df.empty:
            return []
        records = []
        for _, row in df.iterrows():
            records.append({
                "insider": str(row.get("Insider Trading", row.get("insider", ""))),
                "relation": str(row.get("Relationship", row.get("relation", ""))),
                "date": str(row.get("Start Date", row.get("date", ""))) if row.get("Start Date", row.get("date")) is not None else None,
                "transaction": str(row.get("Transaction", row.get("transaction", ""))),
                "shares": safe_int(row.get("Shares", row.get("shares"))),
                "value": safe_float(row.get("Value", row.get("value"))),
            })
        return records[:20]
    except Exception:
        return []


async def get_insiders(symbol: str) -> list[dict]:
    return await get_or_fetch(
        stock_insiders_key(symbol), STOCK_INSIDERS_TTL,
        lambda: _fetch_insiders(symbol)
    )
