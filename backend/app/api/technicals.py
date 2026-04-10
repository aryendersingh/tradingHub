from fastapi import APIRouter

from app.services import technicals_service

router = APIRouter()


@router.get("/{symbol}/indicators")
async def get_indicators(
    symbol: str,
    indicator: str = "sma",
    period: int = 14,
    timeframe: str = "1y",
    interval: str = "1d",
):
    return await technicals_service.get_indicators(
        symbol.upper(), indicator, period, timeframe, interval
    )
