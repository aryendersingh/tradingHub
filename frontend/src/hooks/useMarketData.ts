"use client";
import { useQuery } from "@tanstack/react-query";
import {
  getMarketOverview,
  getMarketSectors,
  getMarketMovers,
  getMarketNews,
  getYields,
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
