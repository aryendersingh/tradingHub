import redis.asyncio as aioredis
import httpx

from app.config import settings

redis_client: aioredis.Redis | None = None
http_client: httpx.AsyncClient | None = None


async def init_clients():
    global redis_client, http_client
    redis_client = aioredis.from_url(
        settings.redis_url, encoding="utf-8", decode_responses=True
    )
    http_client = httpx.AsyncClient(timeout=10.0)


async def close_clients():
    global redis_client, http_client
    if redis_client:
        await redis_client.close()
    if http_client:
        await http_client.aclose()


def get_redis() -> aioredis.Redis:
    assert redis_client is not None
    return redis_client


def get_http() -> httpx.AsyncClient:
    assert http_client is not None
    return http_client
