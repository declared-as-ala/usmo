import { describe, it, expect } from 'vitest';
import { getPublicAbsoluteUrl, getCanonicalSiteUrl } from '../publicUrl';

describe('Web Public URL & Open Graph Helpers', () => {
  describe('Canonical Site URL resolution', () => {
    it('always returns canonical HTTPS domain without trailing slash', () => {
      const siteUrl = getCanonicalSiteUrl();
      expect(siteUrl).toBe('https://usmonastir.tn');
      expect(siteUrl.endsWith('/')).toBe(false);
      expect(siteUrl.startsWith('https://')).toBe(true);
    });
  });

  describe('Open Graph Public Image Resolver', () => {
    it('uses explicit OG image if provided', () => {
      const url = getPublicAbsoluteUrl('https://usmonastir.tn/images/custom-og.jpg');
      expect(url).toBe('https://usmonastir.tn/images/custom-og.jpg');
    });

    it('falls back to default social image when none is provided', () => {
      const url = getPublicAbsoluteUrl(undefined);
      expect(url).toBe('https://usmonastir.tn/images/seo/usm-social-share-default.webp');
    });

    it('sanitizes internal minio:9000 URLs to public https://usmonastir.tn paths', () => {
      const url = getPublicAbsoluteUrl('http://minio:9000/usm-media/seo/my-image.webp');
      expect(url).toBe('https://usmonastir.tn/usm-media/seo/my-image.webp');
      expect(url.includes('minio:9000')).toBe(false);
    });

    it('sanitizes localhost:9000 internal MinIO URLs to public HTTPS', () => {
      const url = getPublicAbsoluteUrl('http://localhost:9000/usm-media/news/photo.png');
      expect(url).toBe('https://usmonastir.tn/usm-media/news/photo.png');
    });

    it('converts relative path to absolute public HTTPS URL', () => {
      const url = getPublicAbsoluteUrl('/images/products/jersey-2026.webp');
      expect(url).toBe('https://usmonastir.tn/images/products/jersey-2026.webp');
    });
  });
});
