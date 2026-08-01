import { describe, expect, it } from 'vitest';
import {
  computeOrderTotals,
  fixedDiscount,
  formatTND,
  lineTotal,
  percentageDiscount,
  tndToMillimes,
} from '../money';

describe('formatTND', () => {
  it('formats whole dinars with 3-decimal millimes', () => {
    expect(formatTND(129_000)).toBe('129.000 DT');
    expect(formatTND(8_500)).toBe('8.500 DT');
    expect(formatTND(0)).toBe('0.000 DT');
    expect(formatTND(999)).toBe('0.999 DT');
  });

  it('omits the symbol when asked', () => {
    expect(formatTND(1_000, { withSymbol: false })).toBe('1.000');
  });

  it('rejects floats and negatives', () => {
    expect(() => formatTND(10.5)).toThrow();
    expect(() => formatTND(-1)).toThrow();
  });
});

describe('tndToMillimes', () => {
  it('converts and rounds', () => {
    expect(tndToMillimes(129)).toBe(129_000);
    expect(tndToMillimes(8.5)).toBe(8_500);
    expect(tndToMillimes(0.001)).toBe(1);
  });
});

describe('discounts', () => {
  it('percentage rounds to nearest millime', () => {
    expect(percentageDiscount(100_000, 10)).toBe(10_000);
    expect(percentageDiscount(99_999, 33)).toBe(33_000); // 32999.67 -> 33000
  });

  it('percentage clamps to subtotal and validates bounds', () => {
    expect(percentageDiscount(1_000, 100)).toBe(1_000);
    expect(() => percentageDiscount(1_000, 0)).toThrow();
    expect(() => percentageDiscount(1_000, 101)).toThrow();
    expect(() => percentageDiscount(1_000, 10.5)).toThrow();
  });

  it('fixed discount clamps to subtotal (total never negative)', () => {
    expect(fixedDiscount(5_000, 20_000)).toBe(5_000);
    expect(fixedDiscount(20_000, 5_000)).toBe(5_000);
  });
});

describe('lineTotal', () => {
  it('multiplies and validates quantity', () => {
    expect(lineTotal(129_000, 2)).toBe(258_000);
    expect(() => lineTotal(129_000, 0)).toThrow();
    expect(() => lineTotal(129_000, 1.5)).toThrow();
  });
});

describe('computeOrderTotals', () => {
  it('sums lines, applies discount and delivery fee', () => {
    const totals = computeOrderTotals({
      lines: [
        { unitPrice: 129_000, quantity: 2 },
        { unitPrice: 45_000, quantity: 1 },
      ],
      discount: 30_000,
      deliveryFee: 8_000,
    });
    expect(totals).toEqual({
      subtotal: 303_000,
      discount: 30_000,
      deliveryFee: 8_000,
      total: 281_000,
    });
  });

  it('clamps discount to subtotal so total is never negative', () => {
    const totals = computeOrderTotals({
      lines: [{ unitPrice: 10_000, quantity: 1 }],
      discount: 50_000,
    });
    expect(totals.total).toBe(0);
  });

  it('defaults discount and fee to zero', () => {
    const totals = computeOrderTotals({ lines: [{ unitPrice: 10_000, quantity: 1 }] });
    expect(totals.total).toBe(10_000);
  });
});
