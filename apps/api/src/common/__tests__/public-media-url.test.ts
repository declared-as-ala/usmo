import { describe, expect, it } from 'vitest';
import {
  normalizePublicMediaUrl,
  normalizePublicMediaUrls,
  resolvePublicMediaUrl,
} from '../public-media-url';

const options = {
  bucket: 'usm-media',
  publicUrl: '/usm-media',
  minioEndpoint: 'usm-minio',
};

describe('public media URL normalization', () => {
  it('rewrites legacy browser-local MinIO URLs', () => {
    expect(
      normalizePublicMediaUrl(
        'http://localhost:9000/usm-media/banners/banner-id/original.webp',
        options,
      ),
    ).toBe('/usm-media/banners/banner-id/original.webp');
  });

  it('overrides an unsafe production MINIO_PUBLIC_URL from the server environment', () => {
    const productionOptions = {
      ...options,
      nodeEnv: 'production',
      publicUrl: 'http://localhost:9000/usm-media',
    };

    expect(resolvePublicMediaUrl(productionOptions)).toBe('/usm-media');
    expect(
      normalizePublicMediaUrl(
        'http://localhost:9000/usm-media/banners/new-upload/original.webp',
        productionOptions,
      ),
    ).toBe('/usm-media/banners/new-upload/original.webp');
  });

  it('keeps an explicit external production media URL', () => {
    expect(resolvePublicMediaUrl({
      ...options,
      nodeEnv: 'production',
      publicUrl: 'https://media.example.com/usm-media/',
    })).toBe('https://media.example.com/usm-media');
  });

  it('rewrites Docker-only MinIO URLs', () => {
    expect(
      normalizePublicMediaUrl('http://usm-minio:9000/usm-media/products/item.webp', options),
    ).toBe('/usm-media/products/item.webp');
  });

  it('does not rewrite unrelated external URLs or deceptive prefixes', () => {
    expect(normalizePublicMediaUrl('https://cdn.example.com/image.webp', options)).toBe(
      'https://cdn.example.com/image.webp',
    );
    expect(normalizePublicMediaUrl('http://localhost:9000/usm-media-copy/image.webp', options)).toBe(
      'http://localhost:9000/usm-media-copy/image.webp',
    );
  });

  it('normalizes nested API payloads without mutating the source', () => {
    const source = {
      banner: { imageUrl: 'http://127.0.0.1:9000/usm-media/banners/hero.webp' },
      items: ['http://minio:9000/usm-media/photos/team.webp'],
    };

    const result = normalizePublicMediaUrls(source, options);

    expect(result).toEqual({
      banner: { imageUrl: '/usm-media/banners/hero.webp' },
      items: ['/usm-media/photos/team.webp'],
    });
    expect(source.banner.imageUrl).toContain('127.0.0.1');
  });
});
