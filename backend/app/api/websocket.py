import asyncio
import json
import uuid

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.websocket_service import ws_relay

router = APIRouter()


@router.websocket("/ws/prices")
async def websocket_prices(websocket: WebSocket):
    await websocket.accept()
    client_id = str(uuid.uuid4())
    queue = await ws_relay.register_client(client_id)

    async def send_updates():
        while True:
            try:
                update = await asyncio.wait_for(queue.get(), timeout=30)
                await websocket.send_json(update)
            except asyncio.TimeoutError:
                # Send heartbeat
                await websocket.send_json({"type": "heartbeat"})
            except Exception:
                break

    send_task = asyncio.create_task(send_updates())

    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            if "subscribe" in msg:
                symbols = msg["subscribe"]
                if isinstance(symbols, list):
                    await ws_relay.subscribe(client_id, symbols)
    except WebSocketDisconnect:
        pass
    finally:
        send_task.cancel()
        await ws_relay.unregister_client(client_id)
