export function formatPrice(value: number | null | undefined, decimals = 2): string {
  if (value == null) return "—";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatChange(value: number | null | undefined): string {
  if (value == null) return "—";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}`;
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null) return "—";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatLargeNumber(value: number | null | undefined): string {
  if (value == null) return "—";
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toLocaleString();
}

export function formatVolume(value: number | null | undefined): string {
  return formatLargeNumber(value);
}

export function formatRatio(value: number | null | undefined): string {
  if (value == null) return "—";
  return value.toFixed(2);
}

export function formatMarginPercent(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

export function changeColor(value: number | null | undefined): string {
  if (value == null || value === 0) return "text-[var(--text-secondary)]";
  return value > 0 ? "text-[var(--positive)]" : "text-[var(--negative)]";
}

export function formatTimestamp(ts: number | null | undefined): string {
  if (ts == null) return "";
  const date = new Date(ts * 1000);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
