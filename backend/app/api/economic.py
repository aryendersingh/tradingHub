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
