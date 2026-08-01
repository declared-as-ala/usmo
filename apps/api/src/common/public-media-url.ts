const DEFAULT_MEDIA_BUCKET = 'usm-media';
const DEFAULT_PUBLIC_MEDIA_URL = `/${DEFAULT_MEDIA_BUCKET}`;

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function legacyMediaBases(bucket: string, minioEndpoint?: string): string[] {
  const hosts = new Set(['localhost', '127.0.0.1', 'minio', 'usm-minio']);
  if (minioEndpoint && !minioEndpoint.includes('/') && !minioEndpoint.includes(':')) {
    hosts.add(minioEndpoint);
  }

  return [...hosts].flatMap((host) => [
    `http://${host}:9000/${bucket}`,
    `https://${host}:9000/${bucket}`,
  ]);
}

export interface PublicMediaUrlOptions {
  bucket?: string;
  publicUrl?: string;
  minioEndpoint?: string;
  nodeEnv?: string;
}

export function resolvePublicMediaUrl(options: PublicMediaUrlOptions = {}): string {
  const bucket = options.bucket || DEFAULT_MEDIA_BUCKET;
  const fallback = `/${bucket}`;
  const configured = trimTrailingSlash(options.publicUrl || fallback);

  if (options.nodeEnv !== 'production' || configured.startsWith('/')) return configured;

  try {
    const hostname = new URL(configured).hostname.toLowerCase();
    const internalHosts = new Set([
      'localhost',
      '127.0.0.1',
      '[::1]',
      'minio',
      'usm-minio',
      options.minioEndpoint?.toLowerCase(),
    ].filter((host): host is string => Boolean(host)));

    // Browsers cannot reach loopback or Docker DNS names on the VPS. Production
    // must send those requests through the same-origin Nginx media route.
    if (internalHosts.has(hostname)) return fallback;
  } catch {
    return fallback;
  }

  return configured;
}

/**
 * Converts MinIO URLs that are only meaningful on the server or uploader's
 * machine into the public media route exposed by Nginx.
 */
export function normalizePublicMediaUrl(
  value: string,
  options: PublicMediaUrlOptions = {},
): string {
  const bucket = options.bucket || DEFAULT_MEDIA_BUCKET;
  const publicUrl = resolvePublicMediaUrl(options) || DEFAULT_PUBLIC_MEDIA_URL;

  for (const legacyBase of legacyMediaBases(bucket, options.minioEndpoint)) {
    if (value === legacyBase) return publicUrl;
    if (value.startsWith(`${legacyBase}/`)) {
      return `${publicUrl}${value.slice(legacyBase.length)}`;
    }
  }

  return value;
}

function isMongooseDocument(value: object): value is { toObject: () => unknown } {
  return '$__' in value && typeof (value as { toObject?: unknown }).toObject === 'function';
}

/** Recursively normalizes media URLs in an API response without mutating it. */
export function normalizePublicMediaUrls<T>(
  value: T,
  options: PublicMediaUrlOptions = {},
  seen = new WeakMap<object, unknown>(),
): T {
  if (typeof value === 'string') {
    return normalizePublicMediaUrl(value, options) as T;
  }

  if (value === null || typeof value !== 'object') return value;

  if (isMongooseDocument(value)) {
    return normalizePublicMediaUrls(value.toObject(), options, seen) as T;
  }

  if (value instanceof Date || Buffer.isBuffer(value)) return value;

  const existing = seen.get(value);
  if (existing) return existing as T;

  if (Array.isArray(value)) {
    const normalized: unknown[] = [];
    seen.set(value, normalized);
    for (const item of value) normalized.push(normalizePublicMediaUrls(item, options, seen));
    return normalized as T;
  }

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return value;

  const normalized: Record<string, unknown> = {};
  seen.set(value, normalized);
  for (const [key, item] of Object.entries(value)) {
    normalized[key] = normalizePublicMediaUrls(item, options, seen);
  }
  return normalized as T;
}
