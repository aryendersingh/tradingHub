from app.clients import yfinance_client as yf
from app.cache.redis_cache import get_or_fetch
from app.cache.cache_keys import (
    options_expirations_key, OPTIONS_EXPIRATIONS_TTL,
    options_chain_key, OPTIONS_CHAIN_TTL,
)
from app.utils.helpers import safe_float, safe_int


async def get_expirations(symbol: str) -> list[str]:
    async def _fetch():
        exps = await yf.get_options_expirations(symbol)
        return list(exps) if exps else []

    return await get_or_fetch(
        options_expirations_key(symbol), OPTIONS_EXPIRATIONS_TTL, _fetch
    )


async def _fetch_chain(symbol: str, expiry: str) -> dict:
    chain = await yf.get_options_chain(symbol, expiry)
    if chain is None:
        return {"calls": [], "puts": []}

    def process_options(df):
        records = []
        if df is None or df.empty:
            return records
        for _, row in df.iterrows():
            records.append({
                "strike": safe_float(row.get("strike")),
                "lastPrice": safe_float(row.get("lastPrice")),
                "bid": safe_float(row.get("bid")),
                "ask": safe_float(row.get("ask")),
                "change": safe_float(row.get("change")),
                "percentChange": safe_float(row.get("percentChange")),
                "volume": safe_int(row.get("volume")),
                "openInterest": safe_int(row.get("openInterest")),
                "impliedVolatility": safe_float(row.get("impliedVolatility")),
                "inTheMoney": bool(row.get("inTheMoney", False)),
                "contractSymbol": str(row.get("contractSymbol", "")),
            })
        return records

    return {
        "calls": process_options(chain.calls),
        "puts": process_options(chain.puts),
        "expiry": expiry,
    }


async def get_chain(symbol: str, expiry: str) -> dict:
    return await get_or_fetch(
        options_chain_key(symbol, expiry), OPTIONS_CHAIN_TTL,
        lambda: _fetch_chain(symbol, expiry)
    )
