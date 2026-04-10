"use client";
import { useEffect, useRef, useCallback } from "react";
import { WS_URL } from "@/lib/constants";
import { useStore } from "@/hooks/useStore";

export function useWebSocket(symbols: string[]) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const updateQuote = useStore((s) => s.updateQuote);

  const connect = useCallback(() => {
    const ws = new WebSocket(`${WS_URL}/ws/prices`);
    wsRef.current = ws;

    ws.onopen = () => {
      if (symbols.length > 0) {
        ws.send(JSON.stringify({ subscribe: symbols }));
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "heartbeat") return;
      if (data.symbol && data.price) {
        updateQuote(data.symbol, data.price, data.volume, data.timestamp);
      }
    };

    ws.onclose = () => {
      reconnectTimeout.current = setTimeout(connect, 5000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [symbols, updateQuote]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimeout.current);
      wsRef.current?.close();
    };
  }, [connect]);

  // Subscribe to new symbols when they change
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && symbols.length > 0) {
      wsRef.current.send(JSON.stringify({ subscribe: symbols }));
    }
  }, [symbols]);
}
