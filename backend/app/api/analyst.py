from fastapi import APIRouter

from app.services import analyst_service

router = APIRouter()


@router.get("/earnings-calendar")
async def get_earnings_calendar(from_date: str = None, to_date: str = None):
    from datetime import date, timedelta
    if not from_date:
        from_date = date.today().isoformat()
    if not to_date:
        to_date = (date.today() + timedelta(days=14)).isoformat()
    return await analyst_service.get_earnings_calendar(from_date, to_date)


@router.get("/{symbol}/ratings")
async def get_ratings(symbol: str):
    return await analyst_service.get_ratings(symbol.upper())


@router.get("/{symbol}/price-targets")
async def get_price_targets(symbol: str):
    return await analyst_service.get_price_targets(symbol.upper())


@router.get("/{symbol}/earnings")
async def get_earnings(symbol: str):
    return await analyst_service.get_earnings(symbol.upper())
