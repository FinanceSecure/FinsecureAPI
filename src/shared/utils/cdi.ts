export function calculateDailyCDI(
  annualRate: number
): number {
  return Math.pow(
    1 + annualRate / 100,
    1 / 252
  ) - 1;
}
