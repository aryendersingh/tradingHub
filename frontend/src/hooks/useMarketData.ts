"use client";
import { useQuery } from "@tanstack/react-query";
import {
  getMarketOverview,
  getMarketSectors,
  getMarketMovers,
  getMarketNews,
  getYields,
  getMarketBreadth,
  getPutCallRatio,
  getGlobalIndices,
  getFearGreed,
  getEarningsCalendar,
  getIPOCalendar,
  getCommodities,
  getStockComparison,
} from "@/lib/api";
import { REFRESH_INTERVALS } from "@/lib/constants";

export function useMarketOverview() {
  return useQuery({
    queryKey: ["market", "overview"],
    queryFn: getMarketOverview,
    refetchInterval: REFRESH_INTERVALS.marketOverview,
    staleTime: REFRESH_INTERVALS.marketOverview,
  });
}

export function useMarketSectors() {
  return useQuery({
    queryKey: ["market", "sectors"],
    queryFn: getMarketSectors,
    refetchInterval: REFRESH_INTERVALS.sectors,
    staleTime: REFRESH_INTERVALS.sectors,
  });
}

export function useMarketMovers(category: string) {
  return useQuery({
    queryKey: ["market", "movers", category],
    queryFn: () => getMarketMovers(category),
    refetchInterval: REFRESH_INTERVALS.sectors,
    staleTime: REFRESH_INTERVALS.sectors,
  });
}

export function useMarketNews() {
  return useQuery({
    queryKey: ["news", "market"],
    queryFn: getMarketNews,
    refetchInterval: REFRESH_INTERVALS.news,
    staleTime: REFRESH_INTERVALS.news,
  });
}

export function useYields() {
  return useQuery({
    queryKey: ["economic", "yields"],
    queryFn: getYields,
    refetchInterval: REFRESH_INTERVALS.fundamentals,
    staleTime: REFRESH_INTERVALS.fundamentals,
  });
}

export function useMarketBreadth() {
  return useQuery({
    queryKey: ["market", "breadth"],
    queryFn: getMarketBreadth,
    refetchInterval: REFRESH_INTERVALS.sectors,
    staleTime: REFRESH_INTERVALS.sectors,
  });
}

export function usePutCallRatio() {
  return useQuery({
    queryKey: ["market", "putcall"],
    queryFn: getPutCallRatio,
    refetchInterval: REFRESH_INTERVALS.news,
    staleTime: REFRESH_INTERVALS.news,
  });
}

export function useGlobalIndices() {
  return useQuery({
    queryKey: ["market", "global"],
    queryFn: getGlobalIndices,
    refetchInterval: REFRESH_INTERVALS.sectors,
    staleTime: REFRESH_INTERVALS.sectors,
  });
}

export function useFearGreed() {
  return useQuery({
    queryKey: ["market", "fear-greed"],
    queryFn: getFearGreed,
    refetchInterval: REFRESH_INTERVALS.news,
    staleTime: REFRESH_INTERVALS.news,
  });
}

export function useEarningsCalendar(fromDate?: string, toDate?: string) {
  return useQuery({
    queryKey: ["earnings", "calendar", fromDate, toDate],
    queryFn: () => getEarningsCalendar(fromDate, toDate),
    staleTime: REFRESH_INTERVALS.fundamentals,
  });
}

export function useIPOCalendar(fromDate?: string, toDate?: string) {
  return useQuery({
    queryKey: ["ipo", "calendar", fromDate, toDate],
    queryFn: () => getIPOCalendar(fromDate, toDate),
    staleTime: REFRESH_INTERVALS.fundamentals,
  });
}

export function useCommodities() {
  return useQuery({
    queryKey: ["economic", "commodities"],
    queryFn: getCommodities,
    refetchInterval: REFRESH_INTERVALS.news,
    staleTime: REFRESH_INTERVALS.news,
  });
}

export function useStockComparison(symbols: string[], period = "1y", interval = "1d") {
  return useQuery({
    queryKey: ["compare", [...symbols].sort().join(","), period, interval],
    queryFn: () => getStockComparison(symbols, period, interval),
    staleTime: REFRESH_INTERVALS.fundamentals,
    enabled: symbols.length >= 2,
  });
}
