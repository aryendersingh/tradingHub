import json
from typing import Any, Callable, Awaitable

from app.dependencies import get_redis


async def get_cached(key: str) -> Any | None:
    redis = get_redis()
    data = await redis.get(key)
    if data is None:
        return None
    return json.loads(data)


async def set_cached(key: str, data: Any, ttl: int = 60):
    redis = get_redis()
    await redis.set(key, json.dumps(data, default=str), ex=ttl)


async def get_or_fetch(
    key: str, ttl: int, fetcher: Callable[[], Awaitable[Any]]
) -> Any:
    cached = await get_cached(key)
    if cached is not None:
        return cached
    data = await fetcher()
    if data is not None:
        await set_cached(key, data, ttl)
    return data
