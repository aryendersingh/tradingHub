"use client";
import { useQuery } from "@tanstack/react-query";
import { getMacroIndicators } from "@/lib/api";

export default function MacroIndicators() {
  const { data, isLoading } = useQuery({
    queryKey: ["economic", "macro"],
    queryFn: getMacroIndicators,
    staleTime: 3_600_000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse bg-[var(--bg-secondary)] rounded" />
        ))}
      </div>
    );
  }

  const indicators = data as Record<string, number> | undefined;
  if (!indicators) return null;

  const cards = [
    { label: "Fed Funds Rate", value: indicators["Fed Funds Rate"], unit: "%" },
    { label: "CPI (YoY)", value: indicators["CPI"], unit: "" },
    { label: "Unemployment", value: indicators["Unemployment"], unit: "%" },
    { label: "GDP", value: indicators["GDP"], unit: "B" },
    { label: "10Y-2Y Spread", value: indicators["10Y-2Y Spread"], unit: "%" },
    { label: "PCE", value: indicators["PCE"], unit: "" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-3"
        >
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">
            {card.label}
          </div>
          <div className="text-lg font-mono font-bold">
            {card.value != null ? `${card.value}${card.unit}` : "—"}
          </div>
        </div>
      ))}
    </div>
  );
}
