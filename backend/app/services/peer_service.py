import asyncio
from app.clients import yfinance_client as yf
from app.cache.redis_cache import get_or_fetch
from app.cache.cache_keys import peer_comparison_key, PEER_COMPARISON_TTL
from app.utils.helpers import safe_float, safe_int

SECTOR_PEERS = {
    "Technology": ["AAPL", "MSFT", "GOOGL", "META", "NVDA", "CRM", "ADBE", "ORCL"],
    "Financials": ["JPM", "BAC", "GS", "MS", "WFC", "C", "BLK", "SCHW"],
    "Healthcare": ["JNJ", "UNH", "PFE", "ABBV", "MRK", "LLY", "TMO", "ABT"],
    "Consumer Discretionary": ["AMZN", "TSLA", "HD", "MCD", "NKE", "SBUX", "TJX", "LOW"],
    "Communication Services": ["GOOGL", "META", "DIS", "NFLX", "CMCSA", "T", "VZ", "TMUS"],
    "Industrials": ["HON", "UPS", "CAT", "BA", "GE", "RTX", "LMT", "DE"],
    "Consumer Staples": ["PG", "KO", "PEP", "COST", "WMT", "PM", "CL", "MDLZ"],
    "Energy": ["XOM", "CVX", "COP", "SLB", "EOG", "MPC", "PSX", "OXY"],
    "Utilities": ["NEE", "DUK", "SO", "D", "AEP", "SRE", "EXC", "XEL"],
    "Real Estate": ["PLD", "AMT", "CCI", "EQIX", "SPG", "O", "WELL", "DLR"],
    "Materials": ["LIN", "APD", "SHW", "ECL", "FCX", "NEM", "NUE", "DOW"],
}

async def _fetch_peers(symbol: str) -> dict:
    # 1. Get profile to find sector
    info = await yf.get_ticker_info(symbol)
    sector = info.get("sector", "")

    # 2. Find peers from the same sector, exclude the symbol itself, take up to 7
    peer_symbols = SECTOR_PEERS.get(sector, [])
    peer_symbols = [s for s in peer_symbols if s != symbol][:7]

    if not peer_symbols:
        return {"symbol": symbol, "sector": sector, "peers": []}

    # 3. Fetch info for all peers concurrently
    infos = await yf.get_multi_ticker_info(peer_symbols)

    peers = []
    for sym, peer_info in zip(peer_symbols, infos):
        if not peer_info:
            continue
        last = safe_float(peer_info.get("regularMarketPrice") or peer_info.get("currentPrice"), 0)
        prev = safe_float(peer_info.get("regularMarketPreviousClose") or peer_info.get("previousClose"), 0)
        change_pct = ((last - prev) / prev * 100) if prev else None
        peers.append({
            "symbol": sym,
            "name": peer_info.get("shortName") or peer_info.get("longName", ""),
            "marketCap": safe_int(peer_info.get("marketCap")),
            "trailingPE": safe_float(peer_info.get("trailingPE")),
            "priceToBook": safe_float(peer_info.get("priceToBook")),
            "grossMargins": safe_float(peer_info.get("grossMargins")),
            "operatingMargins": safe_float(peer_info.get("operatingMargins")),
            "profitMargins": safe_float(peer_info.get("profitMargins")),
            "changePercent": round(change_pct, 2) if change_pct is not None else None,
        })

    return {"symbol": symbol, "sector": sector, "peers": peers}

async def get_peers(symbol: str) -> dict:
    return await get_or_fetch(
        peer_comparison_key(symbol), PEER_COMPARISON_TTL,
        lambda: _fetch_peers(symbol)
    )
