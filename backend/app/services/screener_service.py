import asyncio
from concurrent.futures import ThreadPoolExecutor
from functools import partial

_executor = ThreadPoolExecutor(max_workers=2)


def _run_screen(filters: dict) -> list[dict]:
    try:
        import yfinance as _yf

        body = {}
        query_parts = []

        if filters.get("minMarketCap") or filters.get("maxMarketCap"):
            query_parts.append({
                "operator": "btwn" if (filters.get("minMarketCap") and filters.get("maxMarketCap")) else "gt",
                "operands": ["intradaymarketcap",
                             filters.get("minMarketCap", 0),
                             filters.get("maxMarketCap", 1e15)],
            })

        if filters.get("minPE") or filters.get("maxPE"):
            query_parts.append({
                "operator": "btwn",
                "operands": ["peratio.lasttwelvemonths",
                             filters.get("minPE", 0),
                             filters.get("maxPE", 1000)],
            })

        if filters.get("sector"):
            query_parts.append({
                "operator": "eq",
                "operands": ["sector", filters["sector"]],
            })

        if filters.get("minDividendYield"):
            query_parts.append({
                "operator": "gt",
                "operands": ["dividendyield.trailing", filters["minDividendYield"]],
            })

        if filters.get("minPrice") or filters.get("maxPrice"):
            query_parts.append({
                "operator": "btwn",
                "operands": ["intradayprice",
                             filters.get("minPrice", 0),
                             filters.get("maxPrice", 100000)],
            })

        if not query_parts:
            # Default: large cap stocks
            query_parts.append({
                "operator": "gt",
                "operands": ["intradaymarketcap", 10_000_000_000],
            })

        if len(query_parts) == 1:
            body = {
                "offset": 0,
                "size": filters.get("limit", 25),
                "sortField": filters.get("sortBy", "intradaymarketcap"),
                "sortType": filters.get("sortOrder", "DESC"),
                "quoteType": "EQUITY",
                "query": query_parts[0],
            }
        else:
            body = {
                "offset": 0,
                "size": filters.get("limit", 25),
                "sortField": filters.get("sortBy", "intradaymarketcap"),
                "sortType": filters.get("sortOrder", "DESC"),
                "quoteType": "EQUITY",
                "query": {
                    "operator": "and",
                    "operands": query_parts,
                },
            }

        sc = _yf.Screener()
        sc.set_body(body)
        response = sc.response
        quotes = response.get("quotes", [])

        results = []
        for q in quotes:
            results.append({
                "symbol": q.get("symbol", ""),
                "name": q.get("shortName", q.get("longName", "")),
                "price": q.get("regularMarketPrice"),
                "change": q.get("regularMarketChange"),
                "changePercent": q.get("regularMarketChangePercent"),
                "volume": q.get("regularMarketVolume"),
                "marketCap": q.get("marketCap"),
                "pe": q.get("trailingPE"),
                "dividendYield": q.get("dividendYield"),
                "sector": q.get("sector", ""),
            })
        return results

    except Exception as e:
        return [{"error": str(e)}]


async def scan(filters: dict) -> list[dict]:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, partial(_run_screen, filters))
