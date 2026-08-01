import { describe, expect, it } from 'vitest';
import { isValidPhone, normalizePhone } from '../phone';

describe('normalizePhone', () => {
  it('normalizes common Tunisian input forms to +216XXXXXXXX', () => {
    expect(normalizePhone('22 123 456')).toBe('+21622123456');
    expect(normalizePhone('22123456')).toBe('+21622123456');
    expect(normalizePhone('0021622123456')).toBe('+21622123456');
    expect(normalizePhone('+216 22-123-456')).toBe('+21622123456');
    expect(normalizePhone('21622123456')).toBe('+21622123456');
    expect(normalizePhone('73.462.600')).toBe('+21673462600');
  });

  it('rejects invalid numbers', () => {
    expect(normalizePhone('12345678')).toBeNull(); // leading 1 invalid
    expect(normalizePhone('2212345')).toBeNull(); // too short
    expect(normalizePhone('221234567')).toBeNull(); // too long
    expect(normalizePhone('+3361234567')).toBeNull(); // not Tunisian
    expect(normalizePhone('abcdefgh')).toBeNull();
    expect(normalizePhone('')).toBeNull();
  });

  it('isValidPhone mirrors normalizePhone', () => {
    expect(isValidPhone('22 123 456')).toBe(true);
    expect(isValidPhone('hello')).toBe(false);
  });
});
