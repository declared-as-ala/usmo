import { describe, it, expect } from 'vitest';
import { analyzeSeo } from '../seo-analyzer';

describe('Yoast-Style SEO Analyzer', () => {
  it('identifies missing title and description and returns a poor score', () => {
    const result = analyzeSeo({
      title: '',
      metaTitle: '',
      metaDescription: '',
    });

    expect(result.score).toBeLessThan(50);
    expect(result.scoreStatus).toBe('poor');
    expect(result.issues.some((i) => i.code === 'TITLE_MISSING')).toBe(true);
    expect(result.issues.some((i) => i.code === 'DESCRIPTION_MISSING')).toBe(true);
  });

  it('recognizes optimal title and description lengths and presence of focus keyword', () => {
    const result = analyzeSeo({
      title: 'Maillot Domicile',
      metaTitle: 'Maillot Domicile 2026/27 | Boutique Officielle US Monastir',
      metaDescription:
        'Achetez le maillot domicile officiel de l’US Monastir pour la saison 2026/27. Flocage disponible, livraison rapide dans toute la Tunisie ou retrait club.',
      focusKeyword: 'US Monastir',
      slug: 'maillot-domicile-us-monastir',
      canonicalUrl: '/product/maillot-domicile-us-monastir',
      ogImage: 'https://www.usmonastir.tn/images/products/maillot-domicile.webp',
      schemaType: 'Product',
      robotsIndex: true,
      robotsFollow: true,
      sitemapEnabled: true,
    });

    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.scoreStatus).toBe('excellent');
    expect(result.issues.some((i) => i.code === 'TITLE_LENGTH_OPTIMAL')).toBe(true);
    expect(result.issues.some((i) => i.code === 'DESCRIPTION_LENGTH_OPTIMAL')).toBe(true);
    expect(result.issues.some((i) => i.code === 'KEYWORD_IN_TITLE')).toBe(true);
    expect(result.issues.some((i) => i.code === 'KEYWORD_IN_DESCRIPTION')).toBe(true);
    expect(result.issues.some((i) => i.code === 'SOCIAL_IMAGE_CONFIGURED')).toBe(true);
  });

  it('warns when title is too long', () => {
    const result = analyzeSeo({
      metaTitle: 'Ceci est un titre extrêmement long qui va très largement dépasser la limite conseillée des soixante caractères sur Google',
      metaDescription: 'Une bonne description de cent quarante caractères pour tester si le titre déclenche bien un avertissement sur la longueur.',
      focusKeyword: 'Google',
    });

    expect(result.issues.some((i) => i.code === 'TITLE_TOO_LONG')).toBe(true);
  });

  it('warns when social share image is missing', () => {
    const result = analyzeSeo({
      metaTitle: 'US Monastir — Site officiel du Club',
      metaDescription: 'Actualités, équipes, boutique et résultats officiels du club omnisports de Monastir.',
    });

    expect(result.issues.some((i) => i.code === 'SOCIAL_IMAGE_MISSING')).toBe(true);
  });
});
