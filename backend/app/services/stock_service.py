import asyncio
from concurrent.futures import ThreadPoolExecutor
from functools import partial

from app.clients import yfinance_client as yf
from app.clients import finnhub_client as fh
from app.cache.redis_cache import get_or_fetch
from app.cache.cache_keys import (
    stock_quote_key, STOCK_QUOTE_TTL,
    stock_profile_key, STOCK_PROFILE_TTL,
    stock_history_key, STOCK_HISTORY_INTRADAY_TTL, STOCK_HISTORY_DAILY_TTL,
    stock_fundamentals_key, STOCK_FUNDAMENTALS_TTL,
    stock_ratios_key, STOCK_RATIOS_TTL,
    stock_dividends_key, STOCK_DIVIDENDS_TTL,
    short_interest_key, SHORT_INTEREST_TTL,
    stock_comparison_key, STOCK_COMPARISON_TTL,
)
from app.utils.helpers import safe_float, safe_int, df_to_records

_executor = ThreadPoolExecutor(max_workers=2)


async def _fetch_quote(symbol: str) -> dict:
    try:
        loop = asyncio.get_event_loop()
        fh_quote = await loop.run_in_executor(_executor, partial(fh.stock_quote, symbol))
        result = {
            "symbol": symbol,
            "price": safe_float(fh_quote.get("c")),
            "change": safe_float(fh_quote.get("d")),
            "changePercent": safe_float(fh_quote.get("dp")),
            "high": safe_float(fh_quote.get("h")),
            "low": safe_float(fh_quote.get("l")),
            "open": safe_float(fh_quote.get("o")),
            "previousClose": safe_float(fh_quote.get("pc")),
            "timestamp": fh_quote.get("t"),
        }
    except Exception:
        # Fallback to yfinance
        info = await yf.get_ticker_fast_info(symbol)
        last = safe_float(info.get("lastPrice"), 0)
        prev = safe_float(info.get("previousClose"), 0)
        result = {
            "symbol": symbol,
            "price": last,
            "change": round(last - prev, 2) if last and prev else None,
            "changePercent": round((last - prev) / prev * 100, 2) if prev else None,
            "high": safe_float(info.get("dayHigh")),
            "low": safe_float(info.get("dayLow")),
            "open": safe_float(info.get("open")),
            "previousClose": prev,
            "timestamp": None,
        }

    # Supplement with extended hours data
    try:
        info = await yf.get_ticker_info(symbol)
        result["preMarketPrice"] = safe_float(info.get("preMarketPrice"))
        result["preMarketChange"] = safe_float(info.get("preMarketChange"))
        result["preMarketChangePercent"] = safe_float(info.get("preMarketChangePercent"))
        result["postMarketPrice"] = safe_float(info.get("postMarketPrice"))
        result["postMarketChange"] = safe_float(info.get("postMarketChange"))
        result["postMarketChangePercent"] = safe_float(info.get("postMarketChangePercent"))
    except Exception:
        result["preMarketPrice"] = None
        result["preMarketChange"] = None
        result["preMarketChangePercent"] = None
        result["postMarketPrice"] = None
        result["postMarketChange"] = None
        result["postMarketChangePercent"] = None

    return result


async def get_quote(symbol: str) -> dict:
    return await get_or_fetch(
        stock_quote_key(symbol), STOCK_QUOTE_TTL,
        lambda: _fetch_quote(symbol)
    )


async def _fetch_profile(symbol: str) -> dict:
    info = await yf.get_ticker_info(symbol)
    return {
        "symbol": symbol,
        "name": info.get("longName") or info.get("shortName", ""),
        "sector": info.get("sector", ""),
        "industry": info.get("industry", ""),
        "exchange": info.get("exchange", ""),
        "currency": info.get("currency", "USD"),
        "marketCap": safe_int(info.get("marketCap")),
        "enterpriseValue": safe_int(info.get("enterpriseValue")),
        "employees": safe_int(info.get("fullTimeEmployees")),
        "website": info.get("website", ""),
        "description": info.get("longBusinessSummary", ""),
        "country": info.get("country", ""),
        "city": info.get("city", ""),
        "state": info.get("state", ""),
        "fiftyTwoWeekHigh": safe_float(info.get("fiftyTwoWeekHigh")),
        "fiftyTwoWeekLow": safe_float(info.get("fiftyTwoWeekLow")),
        "avgVolume": safe_int(info.get("averageVolume")),
        "avgVolume10Day": safe_int(info.get("averageDailyVolume10Day")),
        "sharesOutstanding": safe_int(info.get("sharesOutstanding")),
        "floatShares": safe_int(info.get("floatShares")),
        "shortRatio": safe_float(info.get("shortRatio")),
        "beta": safe_float(info.get("beta")),
    }


async def get_profile(symbol: str) -> dict:
    return await get_or_fetch(
        stock_profile_key(symbol), STOCK_PROFILE_TTL,
        lambda: _fetch_profile(symbol)
    )


async def _fetch_history(symbol: str, period: str, interval: str) -> list[dict]:
    df = await yf.get_ticker_history(symbol, period=period, interval=interval)
    if df is None or df.empty:
        return []
    records = []
    for idx, row in df.iterrows():
        records.append({
            "time": idx.strftime("%Y-%m-%d") if interval in ("1d", "1wk", "1mo") else idx.isoformat(),
            "open": safe_float(row.get("Open")),
            "high": safe_float(row.get("High")),
            "low": safe_float(row.get("Low")),
            "close": safe_float(row.get("Close")),
            "volume": safe_int(row.get("Volume")),
        })
    return records


async def get_history(symbol: str, period: str = "1y", interval: str = "1d") -> list[dict]:
    ttl = STOCK_HISTORY_INTRADAY_TTL if interval in ("1m", "2m", "5m", "15m", "30m", "60m", "90m") else STOCK_HISTORY_DAILY_TTL
    return await get_or_fetch(
        stock_history_key(symbol, period, interval), ttl,
        lambda: _fetch_history(symbol, period, interval)
    )


async def _fetch_fundamentals(symbol: str) -> dict:
    income, q_income = await yf.get_income_stmt(symbol)
    balance, q_balance = await yf.get_balance_sheet(symbol)
    cashflow, q_cashflow = await yf.get_cashflow(symbol)

    return {
        "incomeStatement": {"annual": df_to_records(income), "quarterly": df_to_records(q_income)},
        "balanceSheet": {"annual": df_to_records(balance), "quarterly": df_to_records(q_balance)},
        "cashFlow": {"annual": df_to_records(cashflow), "quarterly": df_to_records(q_cashflow)},
    }


async def get_fundamentals(symbol: str) -> dict:
    return await get_or_fetch(
        stock_fundamentals_key(symbol), STOCK_FUNDAMENTALS_TTL,
        lambda: _fetch_fundamentals(symbol)
    )


async def _fetch_ratios(symbol: str) -> dict:
    info = await yf.get_ticker_info(symbol)
    return {
        "symbol": symbol,
        "trailingPE": safe_float(info.get("trailingPE")),
        "forwardPE": safe_float(info.get("forwardPE")),
        "priceToBook": safe_float(info.get("priceToBook")),
        "priceToSales": safe_float(info.get("priceToSalesTrailing12Months")),
        "enterpriseToEbitda": safe_float(info.get("enterpriseToEbitda")),
        "enterpriseToRevenue": safe_float(info.get("enterpriseToRevenue")),
        "pegRatio": safe_float(info.get("pegRatio")),
        "trailingEps": safe_float(info.get("trailingEps")),
        "forwardEps": safe_float(info.get("forwardEps")),
        "bookValue": safe_float(info.get("bookValue")),
        "revenuePerShare": safe_float(info.get("revenuePerShare")),
        "returnOnEquity": safe_float(info.get("returnOnEquity")),
        "returnOnAssets": safe_float(info.get("returnOnAssets")),
        "grossMargins": safe_float(info.get("grossMargins")),
        "operatingMargins": safe_float(info.get("operatingMargins")),
        "profitMargins": safe_float(info.get("profitMargins")),
        "debtToEquity": safe_float(info.get("debtToEquity")),
        "currentRatio": safe_float(info.get("currentRatio")),
        "quickRatio": safe_float(info.get("quickRatio")),
        "revenueGrowth": safe_float(info.get("revenueGrowth")),
        "earningsGrowth": safe_float(info.get("earningsGrowth")),
        "dividendYield": safe_float(info.get("dividendYield")),
        "payoutRatio": safe_float(info.get("payoutRatio")),
    }


async def get_ratios(symbol: str) -> dict:
    return await get_or_fetch(
        stock_ratios_key(symbol), STOCK_RATIOS_TTL,
        lambda: _fetch_ratios(symbol)
    )


async def _fetch_dividends(symbol: str) -> dict:
    divs = await yf.get_dividends(symbol)
    info = await yf.get_ticker_info(symbol)
    history = []
    if divs is not None and len(divs) > 0:
        for date, amount in divs.items():
            history.append({
                "date": date.strftime("%Y-%m-%d"),
                "amount": round(float(amount), 4),
            })

    return {
        "symbol": symbol,
        "dividendYield": safe_float(info.get("dividendYield")),
        "dividendRate": safe_float(info.get("dividendRate")),
        "payoutRatio": safe_float(info.get("payoutRatio")),
        "exDividendDate": info.get("exDividendDate"),
        "fiveYearAvgDividendYield": safe_float(info.get("fiveYearAvgDividendYield")),
        "history": history[-20:],  # Last 20 dividends
    }


async def get_dividends(symbol: str) -> dict:
    return await get_or_fetch(
        stock_dividends_key(symbol), STOCK_DIVIDENDS_TTL,
        lambda: _fetch_dividends(symbol)
    )


async def _fetch_short_interest(symbol: str) -> dict:
    info = await yf.get_ticker_info(symbol)
    return {
        "symbol": symbol,
        "shortPercentOfFloat": safe_float(info.get("shortPercentOfFloat")),
        "shortRatio": safe_float(info.get("shortRatio")),
        "sharesShort": safe_int(info.get("sharesShort")),
        "sharesShortPriorMonth": safe_int(info.get("sharesShortPriorMonth")),
        "dateShortInterest": info.get("dateShortInterest"),
    }


async def get_short_interest(symbol: str) -> dict:
    return await get_or_fetch(
        short_interest_key(symbol), SHORT_INTEREST_TTL,
        lambda: _fetch_short_interest(symbol)
    )


async def _fetch_comparison(symbols: list[str], period: str, interval: str) -> dict:
    tasks = [yf.get_ticker_history(s, period=period, interval=interval) for s in symbols]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    series = {}
    for symbol, result in zip(symbols, results):
        if isinstance(result, Exception) or result is None or result.empty:
            continue
        closes = result["Close"]
        base = float(closes.iloc[0])
        if base == 0:
            continue
        points = []
        for idx, val in closes.items():
            time_str = idx.strftime("%Y-%m-%d") if interval in ("1d", "1wk", "1mo") else idx.isoformat()
            pct = (float(val) - base) / base * 100
            points.append({"time": time_str, "value": round(pct, 2)})
        series[symbol] = points

    return {"symbols": list(series.keys()), "series": series}


async def get_comparison(symbols: list[str], period: str = "1y", interval: str = "1d") -> dict:
    symbols_hash = ",".join(sorted(symbols))
    return await get_or_fetch(
        stock_comparison_key(symbols_hash, period), STOCK_COMPARISON_TTL,
        lambda: _fetch_comparison(symbols, period, interval)
    )
