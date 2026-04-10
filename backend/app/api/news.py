from fastapi import APIRouter

from app.services import news_service

router = APIRouter()


@router.get("/market")
async def get_market_news():
    return await news_service.get_market_news()


@router.get("/stock/{symbol}")
async def get_stock_news(symbol: str):
    return await news_service.get_stock_news(symbol.upper())


@router.get("/filings/{symbol}")
async def get_filings(symbol: str):
    return await news_service.get_filings(symbol.upper())
