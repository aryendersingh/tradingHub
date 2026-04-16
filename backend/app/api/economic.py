from fastapi import APIRouter

from app.services import economic_service

router = APIRouter()


@router.get("/yields")
async def get_yields():
    return await economic_service.get_yields()


@router.get("/calendar")
async def get_calendar():
    return await economic_service.get_calendar()


@router.get("/indicators/{series_id}")
async def get_series(series_id: str, limit: int = 252):
    return await economic_service.get_series(series_id, limit)


@router.get("/macro")
async def get_macro():
    return await economic_service.get_macro_indicators()


@router.get("/forex")
async def get_forex():
    return await economic_service.get_forex()


@router.get("/commodities")
async def get_commodities():
    return await economic_service.get_commodities()


@router.get("/ipo-calendar")
async def get_ipo_calendar(from_date: str = None, to_date: str = None):
    from datetime import date, timedelta
    if not from_date:
        from_date = (date.today() - timedelta(days=30)).isoformat()
    if not to_date:
        to_date = (date.today() + timedelta(days=90)).isoformat()
    from app.services import ipo_service
    return await ipo_service.get_ipo_calendar(from_date, to_date)
