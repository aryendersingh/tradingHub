import asyncio
from concurrent.futures import ThreadPoolExecutor
from functools import partial

import pandas as pd
import pandas_ta as ta

from app.clients import yfinance_client as yf
from app.cache.redis_cache import get_or_fetch
from app.cache.cache_keys import indicators_key, INDICATORS_TTL

_executor = ThreadPoolExecutor(max_workers=2)


def _compute_indicators(df: pd.DataFrame, indicator: str, period: int) -> list[dict]:
    if df is None or df.empty:
        return []

    result_series = None

    if indicator == "sma":
        result_series = ta.sma(df["Close"], length=period)
    elif indicator == "ema":
        result_series = ta.ema(df["Close"], length=period)
    elif indicator == "rsi":
        result_series = ta.rsi(df["Close"], length=period)
    elif indicator == "macd":
        macd = ta.macd(df["Close"])
        if macd is not None:
            records = []
            for idx, row in macd.iterrows():
                records.append({
                    "time": idx.strftime("%Y-%m-%d") if hasattr(idx, "strftime") else str(idx),
                    "macd": round(float(row.iloc[0]), 4) if pd.notna(row.iloc[0]) else None,
                    "signal": round(float(row.iloc[1]), 4) if pd.notna(row.iloc[1]) else None,
                    "histogram": round(float(row.iloc[2]), 4) if pd.notna(row.iloc[2]) else None,
                })
            return records
    elif indicator == "bbands":
        bbands = ta.bbands(df["Close"], length=period)
        if bbands is not None:
            records = []
            for idx, row in bbands.iterrows():
                records.append({
                    "time": idx.strftime("%Y-%m-%d") if hasattr(idx, "strftime") else str(idx),
                    "lower": round(float(row.iloc[0]), 4) if pd.notna(row.iloc[0]) else None,
                    "mid": round(float(row.iloc[1]), 4) if pd.notna(row.iloc[1]) else None,
                    "upper": round(float(row.iloc[2]), 4) if pd.notna(row.iloc[2]) else None,
                })
            return records
    elif indicator == "atr":
        result_series = ta.atr(df["High"], df["Low"], df["Close"], length=period)
    elif indicator == "vwap":
        result_series = ta.vwap(df["High"], df["Low"], df["Close"], df["Volume"])
    elif indicator == "obv":
        result_series = ta.obv(df["Close"], df["Volume"])
    elif indicator == "stoch":
        stoch = ta.stoch(df["High"], df["Low"], df["Close"])
        if stoch is not None:
            records = []
            for idx, row in stoch.iterrows():
                records.append({
                    "time": idx.strftime("%Y-%m-%d") if hasattr(idx, "strftime") else str(idx),
                    "k": round(float(row.iloc[0]), 4) if pd.notna(row.iloc[0]) else None,
                    "d": round(float(row.iloc[1]), 4) if pd.notna(row.iloc[1]) else None,
                })
            return records

    if result_series is not None:
        records = []
        for idx, val in result_series.items():
            if pd.notna(val):
                records.append({
                    "time": idx.strftime("%Y-%m-%d") if hasattr(idx, "strftime") else str(idx),
                    "value": round(float(val), 4),
                })
        return records

    return []


async def get_indicators(
    symbol: str, indicator: str, period: int = 14, timeframe: str = "1y", interval: str = "1d"
) -> list[dict]:
    async def _fetch():
        df = await yf.get_ticker_history(symbol, period=timeframe, interval=interval)
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            _executor, partial(_compute_indicators, df, indicator, period)
        )

    return await get_or_fetch(
        indicators_key(symbol, indicator, str(period), interval), INDICATORS_TTL, _fetch
    )
