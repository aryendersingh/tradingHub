from fastapi import APIRouter

from app.services import holders_service

router = APIRouter()


@router.get("/{symbol}/institutional")
async def get_institutional(symbol: str):
    return await holders_service.get_institutional(symbol.upper())


@router.get("/{symbol}/insiders")
async def get_insiders(symbol: str):
    return await holders_service.get_insiders(symbol.upper())
