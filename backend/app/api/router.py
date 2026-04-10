from fastapi import APIRouter

from app.api import market, stock, options, technicals, news, analyst, economic, screener, holders, websocket

api_router = APIRouter()

api_router.include_router(market.router, prefix="/market", tags=["market"])
api_router.include_router(stock.router, prefix="/stock", tags=["stock"])
api_router.include_router(holders.router, prefix="/stock", tags=["holders"])
api_router.include_router(options.router, prefix="/stock", tags=["options"])
api_router.include_router(technicals.router, prefix="/stock", tags=["technicals"])
api_router.include_router(news.router, prefix="/news", tags=["news"])
api_router.include_router(analyst.router, prefix="/stock", tags=["analyst"])
api_router.include_router(economic.router, prefix="/economic", tags=["economic"])
api_router.include_router(screener.router, prefix="/screener", tags=["screener"])
api_router.include_router(websocket.router, tags=["websocket"])
