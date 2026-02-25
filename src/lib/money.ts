/**
 * Formats a number in cents into a BRL currency string.
 * e.g., 1000 -> R$ 10,00
 */
export function formatMoney(cents: number): string {
  const value = cents / 100;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Converts a BRL float value into an integer of cents.
 * e.g., 10.50 -> 1050
 */
export function brlToCents(brl: number): number {
  return Math.round(brl * 100);
}
