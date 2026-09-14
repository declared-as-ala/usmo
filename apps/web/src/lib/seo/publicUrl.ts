/**
 * Returns the canonical public domain of the platform, normalized without trailing slash or redundant 'www.'
 */
export function getCanonicalSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://usmonastir.tn';
  return raw.replace(/\/+$/, '').replace(/^https?:\/\/www\./, 'https://');
}

/**
 * Resolves any image URL (local, MinIO, relative) into an absolute public URL
 * that external social crawlers (Facebook, WhatsApp, LinkedIn, X, Discord) can fetch.
 */
export function getPublicAbsoluteUrl(pathOrUrl?: string): string {
  const siteUrl = getCanonicalSiteUrl();

  if (!pathOrUrl) {
    return `${siteUrl}/images/seo/usm-social-share-default.webp`;
  }

  const trimmed = pathOrUrl.trim();

  // Already a public HTTPS or HTTP URL that is not localhost or internal docker
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    try {
      const parsed = new URL(trimmed);
      const host = parsed.hostname.toLowerCase();
      const isInternal =
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host === 'minio' ||
        host === 'usm-minio' ||
        host.includes('internal');

      if (!isInternal) {
        return trimmed;
      }

      // Convert internal MinIO/Docker URL into public route
      return `${siteUrl}${parsed.pathname}`;
    } catch {
      // ignore
    }
  }

  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${siteUrl}${cleanPath}`;
}

