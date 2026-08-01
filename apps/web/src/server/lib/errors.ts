/**
 * Typed application errors + Result wrapper.
 * Server actions never throw raw errors to the client: they return
 * `Result<T>` so the UI always receives a safe, typed `{ code, message }`.
 * Error message translations (FR/AR/EN) live client-side, keyed by `code`.
 */

export const ERROR_CODES = [
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'VALIDATION_ERROR',
  'RATE_LIMITED',
  'OUT_OF_STOCK',
  'VARIANT_INACTIVE',
  'PICKUP_POINT_INACTIVE',
  'NO_DELIVERY_ZONE',
  'COUPON_INVALID',
  'COUPON_EXPIRED',
  'COUPON_MIN_ORDER',
  'COUPON_LIMIT_REACHED',
  'INVALID_STATUS_TRANSITION',
  'DUPLICATE_SLUG',
  'DUPLICATE_SKU',
  'LOCKED_ACCOUNT',
  'INTERNAL',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export class AppError extends Error {
  readonly code: ErrorCode;
  /** Optional machine-readable details safe to send to the client (e.g. per-line stock issues). */
  readonly details?: unknown;

  constructor(code: ErrorCode, message?: string, details?: unknown) {
    super(message ?? code);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ErrorCode; message: string; details?: unknown } };

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function fail<T = never>(code: ErrorCode, message?: string, details?: unknown): Result<T> {
  return { ok: false, error: { code, message: message ?? code, details } };
}

/**
 * Wrap a service call for a server action: AppError becomes a typed failure,
 * anything unexpected is logged server-side and surfaced as INTERNAL only.
 */
export async function toResult<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (err) {
    if (err instanceof AppError) {
      return fail(err.code, err.message, err.details);
    }
    console.error('[usm] unexpected error:', err);
    return fail('INTERNAL', 'Une erreur est survenue. Veuillez réessayer.');
  }
}
