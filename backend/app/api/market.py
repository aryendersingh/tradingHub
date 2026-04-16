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


@router.get("/global")
async def get_global_indices():
    return await market_service.get_global_indices()


@router.get("/breadth")
async def get_breadth():
    return await market_service.get_breadth()


@router.get("/putcall")
async def get_putcall():
    return await market_service.get_putcall_ratio()


@router.get("/fear-greed")
async def get_fear_greed():
    return await market_service.get_fear_greed()
