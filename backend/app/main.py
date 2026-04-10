from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.dependencies import init_clients, close_clients
from app.api.router import api_router
from app.services.websocket_service import ws_relay


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_clients()
    await ws_relay.start()
    yield
    await ws_relay.stop()
    await close_clients()


app = FastAPI(title="TradingHub API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
