export function calculateDailyCDI(cdiAnual: number): number {
  return Math.pow(1 + cdiAnual / 100, 1 / 252) - 1;
}
