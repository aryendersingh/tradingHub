from fastapi import APIRouter
from pydantic import BaseModel

from app.services import screener_service

router = APIRouter()


class ScreenerFilters(BaseModel):
    minMarketCap: int | None = None
    maxMarketCap: int | None = None
    minPE: float | None = None
    maxPE: float | None = None
    sector: str | None = None
    minDividendYield: float | None = None
    minPrice: float | None = None
    maxPrice: float | None = None
    sortBy: str = "intradaymarketcap"
    sortOrder: str = "DESC"
    limit: int = 25


@router.post("/scan")
async def scan(filters: ScreenerFilters):
    return await screener_service.scan(filters.model_dump(exclude_none=True))
