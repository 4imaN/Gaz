export function normalizePlateNumber(plateNumber: string): string {
  return plateNumber.trim().replace(/\s+/g, ' ').toLocaleUpperCase();
}
