"use client";
import { useQuery } from "@tanstack/react-query";
import {
  getStockQuote,
  getStockProfile,
  getStockHistory,
  getStockFundamentals,
  getStockRatios,
  getStockDividends,
  getRatings,
  getPriceTargets,
  getEarnings,
  getStockNews,
  getFilings,
  getInstitutional,
  getInsiders,
  getPeers,
  getShortInterest,
} from "@/lib/api";
import { REFRESH_INTERVALS } from "@/lib/constants";

export function useStockQuote(symbol: string) {
  return useQuery({
    queryKey: ["stock", symbol, "quote"],
    queryFn: () => getStockQuote(symbol),
    refetchInterval: REFRESH_INTERVALS.quote,
    enabled: !!symbol,
  });
}

export function useStockProfile(symbol: string) {
  return useQuery({
    queryKey: ["stock", symbol, "profile"],
    queryFn: () => getStockProfile(symbol),
    staleTime: 86_400_000,
    enabled: !!symbol,
  });
}

export function useStockHistory(symbol: string, period = "1y", interval = "1d") {
  return useQuery({
    queryKey: ["stock", symbol, "history", period, interval],
    queryFn: () => getStockHistory(symbol, period, interval),
    staleTime: interval.includes("m") ? 300_000 : 3_600_000,
    enabled: !!symbol,
  });
}

export function useStockFundamentals(symbol: string) {
  return useQuery({
    queryKey: ["stock", symbol, "fundamentals"],
    queryFn: () => getStockFundamentals(symbol),
    staleTime: REFRESH_INTERVALS.fundamentals,
    enabled: !!symbol,
  });
}

export function useStockRatios(symbol: string) {
  return useQuery({
    queryKey: ["stock", symbol, "ratios"],
    queryFn: () => getStockRatios(symbol),
    staleTime: REFRESH_INTERVALS.fundamentals,
    enabled: !!symbol,
  });
}

export function useStockDividends(symbol: string) {
  return useQuery({
    queryKey: ["stock", symbol, "dividends"],
    queryFn: () => getStockDividends(symbol),
    staleTime: REFRESH_INTERVALS.fundamentals,
    enabled: !!symbol,
  });
}

export function useRatings(symbol: string) {
  return useQuery({
    queryKey: ["stock", symbol, "ratings"],
    queryFn: () => getRatings(symbol),
    staleTime: REFRESH_INTERVALS.fundamentals,
    enabled: !!symbol,
  });
}

export function usePriceTargets(symbol: string) {
  return useQuery({
    queryKey: ["stock", symbol, "price-targets"],
    queryFn: () => getPriceTargets(symbol),
    staleTime: REFRESH_INTERVALS.fundamentals,
    enabled: !!symbol,
  });
}

export function useEarnings(symbol: string) {
  return useQuery({
    queryKey: ["stock", symbol, "earnings"],
    queryFn: () => getEarnings(symbol),
    staleTime: REFRESH_INTERVALS.fundamentals,
    enabled: !!symbol,
  });
}

export function useStockNews(symbol: string) {
  return useQuery({
    queryKey: ["news", symbol],
    queryFn: () => getStockNews(symbol),
    refetchInterval: REFRESH_INTERVALS.news,
    enabled: !!symbol,
  });
}

export function useFilings(symbol: string) {
  return useQuery({
    queryKey: ["filings", symbol],
    queryFn: () => getFilings(symbol),
    staleTime: REFRESH_INTERVALS.fundamentals,
    enabled: !!symbol,
  });
}

export function useInstitutional(symbol: string) {
  return useQuery({
    queryKey: ["stock", symbol, "institutional"],
    queryFn: () => getInstitutional(symbol),
    staleTime: 86_400_000,
    enabled: !!symbol,
  });
}

export function useInsiders(symbol: string) {
  return useQuery({
    queryKey: ["stock", symbol, "insiders"],
    queryFn: () => getInsiders(symbol),
    staleTime: REFRESH_INTERVALS.fundamentals,
    enabled: !!symbol,
  });
}

export function usePeers(symbol: string) {
  return useQuery({
    queryKey: ["stock", symbol, "peers"],
    queryFn: () => getPeers(symbol),
    staleTime: REFRESH_INTERVALS.fundamentals,
    enabled: !!symbol,
  });
}

export function useShortInterest(symbol: string) {
  return useQuery({
    queryKey: ["stock", symbol, "short-interest"],
    queryFn: () => getShortInterest(symbol),
    staleTime: REFRESH_INTERVALS.fundamentals,
    enabled: !!symbol,
  });
}
