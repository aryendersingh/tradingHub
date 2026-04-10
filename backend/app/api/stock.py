from fastapi import APIRouter

from app.services import stock_service

router = APIRouter()


@router.get("/{symbol}/quote")
async def get_quote(symbol: str):
    return await stock_service.get_quote(symbol.upper())


@router.get("/{symbol}/profile")
async def get_profile(symbol: str):
    return await stock_service.get_profile(symbol.upper())


@router.get("/{symbol}/history")
async def get_history(symbol: str, period: str = "1y", interval: str = "1d"):
    return await stock_service.get_history(symbol.upper(), period, interval)


@router.get("/{symbol}/fundamentals")
async def get_fundamentals(symbol: str):
    return await stock_service.get_fundamentals(symbol.upper())


@router.get("/{symbol}/ratios")
async def get_ratios(symbol: str):
    return await stock_service.get_ratios(symbol.upper())


@router.get("/{symbol}/dividends")
async def get_dividends(symbol: str):
    return await stock_service.get_dividends(symbol.upper())
