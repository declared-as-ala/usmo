/**
 * Utilities for application URL resolution and sanitization.
 * Prevents exposing raw server IP addresses (e.g. 54.37.226.228) in emails and links.
 */

/**
 * Checks if a string contains a raw IPv4 address (e.g. 54.37.226.228).
 */
export function containsRawIp(str: string): boolean {
  if (!str) return false;
  return /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(str);
}

/**
 * Resolves the primary base URL for the web application (e.g. "https://usmonastir.tn").
 * Priority order:
 * 1. process.env.APP_URL (if not a raw server IP)
 * 2. process.env.APP_DOMAIN (e.g. "usmonastir.tn" -> "https://usmonastir.tn")
 * 3. First origin from process.env.CLIENT_URL (if not a raw IP or localhost in production)
 * 4. In development, allows localhost if specified in CLIENT_URL
 * 5. Default fallback: "https://usmonastir.tn"
 */
export function getAppBaseUrl(): string {
  const appUrl = (process.env.APP_URL || '').trim();
  if (appUrl && !containsRawIp(appUrl)) {
    return appUrl.replace(/\/+$/, '');
  }

  const appDomain = (process.env.APP_DOMAIN || '').trim();
  if (appDomain && !containsRawIp(appDomain)) {
    const proto = appDomain.includes('localhost') ? 'http' : 'https';
    return `${proto}://${appDomain}`.replace(/\/+$/, '');
  }

  const clientUrls = (process.env.CLIENT_URL || '')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);

  for (const candidate of clientUrls) {
    if (!containsRawIp(candidate) && !candidate.includes('localhost')) {
      return candidate.replace(/\/+$/, '');
    }
  }

  if (process.env.NODE_ENV !== 'production' && clientUrls[0]?.includes('localhost')) {
    return clientUrls[0].replace(/\/+$/, '');
  }

  return 'https://usmonastir.tn';
}

/**
 * Sanitizes URLs to ensure that raw server IPs are replaced with the official domain.
 */
export function sanitizeDomainUrl(url: string): string {
  if (!url) return url;
  return url.replace(/https?:\/\/54\.37\.226\.228(?::\d+)?/g, 'https://usmonastir.tn');
}
