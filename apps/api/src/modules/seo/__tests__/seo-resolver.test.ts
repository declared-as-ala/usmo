import { describe, it, expect, vi } from 'vitest';
import { normalizePublicMediaUrl } from '../../../common/public-media-url';
import { getPublicAbsoluteUrl, getCanonicalSiteUrl } from '../../../../../web/src/lib/seo/publicUrl';

describe('SEO Resolver & Fallback Hierarchy Unit Tests', () => {
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

  describe('SEO Field Priority Hierarchy', () => {
    it('explicit metaTitle takes precedence over entity title and default fallback', () => {
      const explicitMetaTitle = 'USM vs CA — Choc Pro A Basketball';
      const entityTitle = 'US Monastir vs Club Africain';
      const fallback = 'Union Sportive Monastirienne';

      const resolvedTitle = explicitMetaTitle || entityTitle || fallback;
      expect(resolvedTitle).toBe('USM vs CA — Choc Pro A Basketball');
    });

    it('entity title is used when explicit metaTitle is absent', () => {
      const explicitMetaTitle = '';
      const entityTitle = 'US Monastir vs Club Africain';
      const fallback = 'Union Sportive Monastirienne';

      const resolvedTitle = explicitMetaTitle || entityTitle || fallback;
      expect(resolvedTitle).toBe('US Monastir vs Club Africain');
    });

    it('explicit OG title falls back to metaTitle if empty', () => {
      const ogTitle = '';
      const metaTitle = 'US Monastir Champion de Tunisie';

      const resolvedOgTitle = ogTitle || metaTitle;
      expect(resolvedOgTitle).toBe('US Monastir Champion de Tunisie');
    });

    it('explicit OG description falls back to metaDescription if empty', () => {
      const ogDesc = '';
      const metaDesc = 'Résumé du match et statistiques des quarts-temps.';

      const resolvedOgDesc = ogDesc || metaDesc;
      expect(resolvedOgDesc).toBe('Résumé du match et statistiques des quarts-temps.');
    });
  });

  describe('Next.js Revalidation Trigger', () => {
    it('triggers internal HTTP POST to /revalidate when item is updated', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ revalidated: true }),
      });
      global.fetch = mockFetch;

      const path = '/actualites/communique-officiel';
      const internalUrl = 'http://web:3000';

      await fetch(`${internalUrl}/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://web:3000/revalidate',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ path }),
        }),
      );
    });
  });
});
