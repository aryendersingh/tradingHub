from fastapi import APIRouter

from app.services import analyst_service

router = APIRouter()


@router.get("/{symbol}/ratings")
async def get_ratings(symbol: str):
    return await analyst_service.get_ratings(symbol.upper())


@router.get("/{symbol}/price-targets")
async def get_price_targets(symbol: str):
    return await analyst_service.get_price_targets(symbol.upper())


@router.get("/{symbol}/earnings")
async def get_earnings(symbol: str):
    return await analyst_service.get_earnings(symbol.upper())
