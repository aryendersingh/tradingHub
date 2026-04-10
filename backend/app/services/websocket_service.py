import asyncio
import json
import logging

import websockets

from app.config import settings

logger = logging.getLogger(__name__)


class FinnhubWSRelay:
    def __init__(self):
        self._ws = None
        self._clients: dict[str, asyncio.Queue] = {}  # client_id -> queue
        self._subscriptions: dict[str, set[str]] = {}  # client_id -> set of symbols
        self._all_symbols: set[str] = set()
        self._running = False
        self._task = None

    async def start(self):
        if not settings.finnhub_api_key:
            logger.warning("No Finnhub API key, WebSocket relay disabled")
            return
        self._running = True
        self._task = asyncio.create_task(self._connect_loop())

    async def stop(self):
        self._running = False
        if self._ws:
            await self._ws.close()
        if self._task:
            self._task.cancel()

    async def _connect_loop(self):
        while self._running:
            try:
                uri = f"wss://ws.finnhub.io?token={settings.finnhub_api_key}"
                async with websockets.connect(uri) as ws:
                    self._ws = ws
                    # Resubscribe existing symbols
                    for symbol in self._all_symbols:
                        await ws.send(json.dumps({"type": "subscribe", "symbol": symbol}))

                    async for message in ws:
                        data = json.loads(message)
                        if data.get("type") == "trade":
                            await self._broadcast(data)
            except Exception as e:
                logger.error(f"Finnhub WS error: {e}")
                await asyncio.sleep(5)

    async def _broadcast(self, data: dict):
        trades = data.get("data", [])
        # Group by symbol
        by_symbol: dict[str, dict] = {}
        for trade in trades:
            sym = trade.get("s", "")
            by_symbol[sym] = {
                "symbol": sym,
                "price": trade.get("p"),
                "volume": trade.get("v"),
                "timestamp": trade.get("t"),
            }

        for client_id, queue in list(self._clients.items()):
            client_symbols = self._subscriptions.get(client_id, set())
            for sym, update in by_symbol.items():
                if sym in client_symbols:
                    try:
                        queue.put_nowait(update)
                    except asyncio.QueueFull:
                        pass  # Drop old data if client is slow

    async def register_client(self, client_id: str) -> asyncio.Queue:
        queue = asyncio.Queue(maxsize=100)
        self._clients[client_id] = queue
        self._subscriptions[client_id] = set()
        return queue

    async def unregister_client(self, client_id: str):
        self._clients.pop(client_id, None)
        removed = self._subscriptions.pop(client_id, set())
        # Unsubscribe symbols no longer needed
        still_needed = set()
        for syms in self._subscriptions.values():
            still_needed.update(syms)
        for sym in removed - still_needed:
            self._all_symbols.discard(sym)
            if self._ws:
                try:
                    await self._ws.send(json.dumps({"type": "unsubscribe", "symbol": sym}))
                except Exception:
                    pass

    async def subscribe(self, client_id: str, symbols: list[str]):
        if client_id not in self._subscriptions:
            return
        new_symbols = set(symbols) - self._all_symbols
        self._subscriptions[client_id].update(symbols)
        self._all_symbols.update(symbols)
        if self._ws:
            for sym in new_symbols:
                try:
                    await self._ws.send(json.dumps({"type": "subscribe", "symbol": sym}))
                except Exception:
                    pass


# Singleton
ws_relay = FinnhubWSRelay()
