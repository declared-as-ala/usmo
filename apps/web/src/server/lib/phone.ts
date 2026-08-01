/**
 * Tunisian phone normalization/validation.
 * Customers are keyed by normalized phone (docs/database.md), so every phone
 * MUST pass through normalizePhone before storage or lookup.
 */

const TN_PHONE = /^\+216[2-9]\d{7}$/;

/**
 * Accepts common user input forms and returns canonical `+216XXXXXXXX`,
 * or null when the input is not a valid Tunisian mobile/landline number:
 *   "22 123 456", "0021622123456", "+216 22-123-456", "21622123456"
 */
export function normalizePhone(input: string): string | null {
  let digits = input.replace(/[\s.\-()]/g, '');
  if (digits.startsWith('00216')) digits = `+216${digits.slice(5)}`;
  else if (digits.startsWith('216') && digits.length === 11) digits = `+${digits}`;
  else if (/^[2-9]\d{7}$/.test(digits)) digits = `+216${digits}`;
  return TN_PHONE.test(digits) ? digits : null;
}

export function isValidPhone(input: string): boolean {
  return normalizePhone(input) !== null;
}
