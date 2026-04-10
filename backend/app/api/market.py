from fastapi import APIRouter

from app.services import market_service

router = APIRouter()


@router.get("/overview")
async def get_overview():
    return await market_service.get_overview()


@router.get("/sectors")
async def get_sectors():
    return await market_service.get_sectors()


@router.get("/movers")
async def get_movers(category: str = "gainers"):
    return await market_service.get_movers(category)
