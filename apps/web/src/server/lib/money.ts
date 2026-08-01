/**
 * Money utilities. All amounts are stored and computed as INTEGER MILLIMES
 * (1 TND = 1000 millimes) — never floats, never display strings.
 * See docs/database.md.
 */

export const MILLIMES_PER_TND = 1000;

export function assertMillimes(value: number, label = 'amount'): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer of millimes, got ${value}`);
  }
}

export function tndToMillimes(tnd: number): number {
  const millimes = Math.round(tnd * MILLIMES_PER_TND);
  assertMillimes(millimes);
  return millimes;
}

/** Format millimes for display: 129000 -> "129.000 DT". */
export function formatTND(millimes: number, { withSymbol = true } = {}): string {
  assertMillimes(millimes);
  const dinars = Math.floor(millimes / MILLIMES_PER_TND);
  const rest = millimes % MILLIMES_PER_TND;
  const formatted = `${dinars}.${String(rest).padStart(3, '0')}`;
  return withSymbol ? `${formatted} DT` : formatted;
}

/**
 * Percentage discount in whole percents (1-100), rounded to the nearest
 * millime, clamped to the subtotal.
 */
export function percentageDiscount(subtotal: number, percent: number): number {
  assertMillimes(subtotal, 'subtotal');
  if (!Number.isInteger(percent) || percent < 1 || percent > 100) {
    throw new Error(`percent must be an integer 1-100, got ${percent}`);
  }
  return Math.min(subtotal, Math.round((subtotal * percent) / 100));
}

/** Fixed discount clamped so the total never goes negative. */
export function fixedDiscount(subtotal: number, amount: number): number {
  assertMillimes(subtotal, 'subtotal');
  assertMillimes(amount, 'discount');
  return Math.min(subtotal, amount);
}

export function lineTotal(unitPrice: number, quantity: number): number {
  assertMillimes(unitPrice, 'unitPrice');
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error(`quantity must be a positive integer, got ${quantity}`);
  }
  return unitPrice * quantity;
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
}

export function computeOrderTotals(params: {
  lines: Array<{ unitPrice: number; quantity: number }>;
  discount?: number;
  deliveryFee?: number;
}): OrderTotals {
  const subtotal = params.lines.reduce((sum, l) => sum + lineTotal(l.unitPrice, l.quantity), 0);
  const discount = Math.min(subtotal, params.discount ?? 0);
  const deliveryFee = params.deliveryFee ?? 0;
  assertMillimes(discount, 'discount');
  assertMillimes(deliveryFee, 'deliveryFee');
  return { subtotal, discount, deliveryFee, total: subtotal - discount + deliveryFee };
}
