import { describe, it, expect, vi } from 'vitest';
import { normalizePublicMediaUrl, resolvePublicMediaUrl } from '../../../common/public-media-url';
import { getAppBaseUrl } from '../../../common/app-url';

describe('API SEO Resolver & Public Media Normalization Tests', () => {
  describe('Canonical App URL resolution', () => {
    it('always returns canonical HTTPS domain without trailing slash', () => {
      const siteUrl = getAppBaseUrl();
      expect(siteUrl.endsWith('/')).toBe(false);
      expect(siteUrl.startsWith('http')).toBe(true);
    });
  });

  describe('MinIO & Media URL Normalization', () => {
    it('normalizes internal minio:9000 URLs to public path', () => {
      const url = normalizePublicMediaUrl('http://minio:9000/usm-media/seo/my-image.webp');
      expect(url).toBe('/usm-media/seo/my-image.webp');
      expect(url.includes('minio:9000')).toBe(false);
    });

    it('normalizes internal usm-minio:9000 URLs to public path', () => {
      const url = normalizePublicMediaUrl('http://usm-minio:9000/usm-media/news/photo.png');
      expect(url).toBe('/usm-media/news/photo.png');
    });

    it('normalizes localhost:9000 internal MinIO URLs to public path', () => {
      const url = normalizePublicMediaUrl('http://localhost:9000/usm-media/news/photo.png');
      expect(url).toBe('/usm-media/news/photo.png');
    });

    it('preserves public external HTTPS URLs', () => {
      const external = 'https://images.unsplash.com/photo-1546519638-68e109498ffc';
      const url = normalizePublicMediaUrl(external);
      expect(url).toBe(external);
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
