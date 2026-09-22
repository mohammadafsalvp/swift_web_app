export const USD_TO_AED_RATE = 3.6725;

export function usdToAed(usdAmount: number): number {
  return usdAmount * USD_TO_AED_RATE;
}

export function formatAed(usdAmount: number): string {
  const aed = usdToAed(usdAmount);
  return `AED ${aed.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
