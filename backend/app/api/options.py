from fastapi import APIRouter

from app.services import options_service

router = APIRouter()


@router.get("/{symbol}/options/expirations")
async def get_expirations(symbol: str):
    return await options_service.get_expirations(symbol.upper())


@router.get("/{symbol}/options/chain")
async def get_chain(symbol: str, expiry: str):
    return await options_service.get_chain(symbol.upper(), expiry)
