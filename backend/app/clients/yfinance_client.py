import asyncio
from concurrent.futures import ThreadPoolExecutor
from functools import partial

import yfinance as yf
import pandas as pd

_executor = ThreadPoolExecutor(max_workers=4)


async def _run_sync(fn, *args, **kwargs):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, partial(fn, *args, **kwargs))


def _get_ticker_info(symbol: str) -> dict:
    ticker = yf.Ticker(symbol)
    return dict(ticker.info)


def _get_ticker_history(symbol: str, period: str, interval: str) -> pd.DataFrame:
    ticker = yf.Ticker(symbol)
    return ticker.history(period=period, interval=interval)


def _get_ticker_fast_info(symbol: str) -> dict:
    ticker = yf.Ticker(symbol)
    fi = ticker.fast_info
    return {
        "lastPrice": fi.get("lastPrice"),
        "previousClose": fi.get("previousClose"),
        "open": fi.get("open"),
        "dayHigh": fi.get("dayHigh"),
        "dayLow": fi.get("dayLow"),
        "volume": fi.get("lastVolume"),
        "marketCap": fi.get("marketCap"),
        "fiftyDayAverage": fi.get("fiftyDayAverage"),
        "twoHundredDayAverage": fi.get("twoHundredDayAverage"),
    }


def _get_income_stmt(symbol: str) -> tuple[pd.DataFrame, pd.DataFrame]:
    ticker = yf.Ticker(symbol)
    return ticker.income_stmt, ticker.quarterly_income_stmt


def _get_balance_sheet(symbol: str) -> tuple[pd.DataFrame, pd.DataFrame]:
    ticker = yf.Ticker(symbol)
    return ticker.balance_sheet, ticker.quarterly_balance_sheet


def _get_cashflow(symbol: str) -> tuple[pd.DataFrame, pd.DataFrame]:
    ticker = yf.Ticker(symbol)
    return ticker.cashflow, ticker.quarterly_cashflow


def _get_options_expirations(symbol: str) -> tuple[str, ...]:
    ticker = yf.Ticker(symbol)
    return ticker.options


def _get_options_chain(symbol: str, date: str):
    ticker = yf.Ticker(symbol)
    return ticker.option_chain(date)


def _get_institutional_holders(symbol: str) -> pd.DataFrame:
    ticker = yf.Ticker(symbol)
    return ticker.institutional_holders


def _get_mutualfund_holders(symbol: str) -> pd.DataFrame:
    ticker = yf.Ticker(symbol)
    return ticker.mutualfund_holders


def _get_insider_transactions(symbol: str) -> pd.DataFrame:
    ticker = yf.Ticker(symbol)
    return ticker.insider_transactions


def _get_recommendations(symbol: str) -> pd.DataFrame:
    ticker = yf.Ticker(symbol)
    return ticker.recommendations


def _get_analyst_price_targets(symbol: str) -> dict:
    ticker = yf.Ticker(symbol)
    return dict(ticker.analyst_price_targets) if ticker.analyst_price_targets is not None else {}


def _get_earnings_dates(symbol: str) -> pd.DataFrame:
    ticker = yf.Ticker(symbol)
    return ticker.earnings_dates


def _get_dividends(symbol: str) -> pd.Series:
    ticker = yf.Ticker(symbol)
    return ticker.dividends


def _download_tickers(symbols: list[str], period: str = "1d", interval: str = "1d") -> pd.DataFrame:
    return yf.download(symbols, period=period, interval=interval, group_by="ticker", threads=True)


# Async wrappers
async def get_ticker_info(symbol: str) -> dict:
    return await _run_sync(_get_ticker_info, symbol)


async def get_ticker_fast_info(symbol: str) -> dict:
    return await _run_sync(_get_ticker_fast_info, symbol)


async def get_ticker_history(symbol: str, period: str = "1y", interval: str = "1d") -> pd.DataFrame:
    return await _run_sync(_get_ticker_history, symbol, period, interval)


async def get_income_stmt(symbol: str) -> tuple[pd.DataFrame, pd.DataFrame]:
    return await _run_sync(_get_income_stmt, symbol)


async def get_balance_sheet(symbol: str) -> tuple[pd.DataFrame, pd.DataFrame]:
    return await _run_sync(_get_balance_sheet, symbol)


async def get_cashflow(symbol: str) -> tuple[pd.DataFrame, pd.DataFrame]:
    return await _run_sync(_get_cashflow, symbol)


async def get_options_expirations(symbol: str) -> tuple[str, ...]:
    return await _run_sync(_get_options_expirations, symbol)


async def get_options_chain(symbol: str, date: str):
    return await _run_sync(_get_options_chain, symbol, date)


async def get_institutional_holders(symbol: str) -> pd.DataFrame:
    return await _run_sync(_get_institutional_holders, symbol)


async def get_mutualfund_holders(symbol: str) -> pd.DataFrame:
    return await _run_sync(_get_mutualfund_holders, symbol)


async def get_insider_transactions(symbol: str) -> pd.DataFrame:
    return await _run_sync(_get_insider_transactions, symbol)


async def get_recommendations(symbol: str) -> pd.DataFrame:
    return await _run_sync(_get_recommendations, symbol)


async def get_analyst_price_targets(symbol: str) -> dict:
    return await _run_sync(_get_analyst_price_targets, symbol)


async def get_earnings_dates(symbol: str) -> pd.DataFrame:
    return await _run_sync(_get_earnings_dates, symbol)


async def get_dividends(symbol: str) -> pd.Series:
    return await _run_sync(_get_dividends, symbol)


async def download_tickers(symbols: list[str], period: str = "1d", interval: str = "1d") -> pd.DataFrame:
    return await _run_sync(_download_tickers, symbols, period, interval)
