// all amounts in the app are stored and displayed in UAE Dirham (AED)
export const CURRENCY = "AED";

export function formatAed(amount: number): string {
  return `${CURRENCY} ${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function formatAedCompact(amount: number): string {
  if (amount >= 1_000_000) return `${CURRENCY} ${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `${CURRENCY} ${(amount / 1_000).toFixed(1)}K`;
  return formatAed(amount);
}

export function formatMoney(value?: number | null): string {
  return value ? formatAed(value) : "-";
}
