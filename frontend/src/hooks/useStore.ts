"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WatchlistItem, PortfolioPosition } from "@/lib/types";

interface LiveQuote {
  price: number;
  volume?: number;
  timestamp?: number;
}

interface AppState {
  // Live quotes from WebSocket
  quotes: Record<string, LiveQuote>;
  updateQuote: (symbol: string, price: number, volume?: number, timestamp?: number) => void;

  // Watchlist
  watchlist: WatchlistItem[];
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (symbol: string) => void;

  // Portfolio
  portfolio: PortfolioPosition[];
  addPosition: (pos: PortfolioPosition) => void;
  removePosition: (symbol: string) => void;
  updatePosition: (symbol: string, updates: Partial<PortfolioPosition>) => void;

  // Active symbol for global context
  activeSymbol: string | null;
  setActiveSymbol: (symbol: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      quotes: {},
      updateQuote: (symbol, price, volume, timestamp) =>
        set((state) => ({
          quotes: {
            ...state.quotes,
            [symbol]: { price, volume, timestamp },
          },
        })),

      watchlist: [
        { symbol: "AAPL", name: "Apple" },
        { symbol: "MSFT", name: "Microsoft" },
        { symbol: "GOOGL", name: "Alphabet" },
        { symbol: "AMZN", name: "Amazon" },
        { symbol: "NVDA", name: "NVIDIA" },
        { symbol: "TSLA", name: "Tesla" },
        { symbol: "META", name: "Meta" },
        { symbol: "JPM", name: "JPMorgan" },
      ],
      addToWatchlist: (item) =>
        set((state) => {
          if (state.watchlist.some((w) => w.symbol === item.symbol)) return state;
          return { watchlist: [...state.watchlist, item] };
        }),
      removeFromWatchlist: (symbol) =>
        set((state) => ({
          watchlist: state.watchlist.filter((w) => w.symbol !== symbol),
        })),

      portfolio: [],
      addPosition: (pos) =>
        set((state) => ({ portfolio: [...state.portfolio, pos] })),
      removePosition: (symbol) =>
        set((state) => ({
          portfolio: state.portfolio.filter((p) => p.symbol !== symbol),
        })),
      updatePosition: (symbol, updates) =>
        set((state) => ({
          portfolio: state.portfolio.map((p) =>
            p.symbol === symbol ? { ...p, ...updates } : p
          ),
        })),

      activeSymbol: null,
      setActiveSymbol: (symbol) => set({ activeSymbol: symbol }),
    }),
    {
      name: "tradinghub-store",
      partialize: (state) => ({ watchlist: state.watchlist, portfolio: state.portfolio }),
    }
  )
);
