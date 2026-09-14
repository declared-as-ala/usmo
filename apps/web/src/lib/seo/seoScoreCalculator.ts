import { ISharedSeoAuditIssue, SeoScoreStatus } from 'shared';

export interface SeoAnalysisParams {
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  slug?: string;
  canonicalUrl?: string;
  ogImage?: string;
  schemaType?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  sitemapEnabled?: boolean;
}

export interface SeoScoreResult {
  score: number;
  scoreStatus: SeoScoreStatus;
  issues: ISharedSeoAuditIssue[];
  titleLength: number;
  titleStatus: 'too_short' | 'optimal' | 'too_long' | 'empty';
  descLength: number;
  descStatus: 'too_short' | 'optimal' | 'too_long' | 'empty';
}

export function computeSeoScore(params: SeoAnalysisParams): SeoScoreResult {
  const issues: ISharedSeoAuditIssue[] = [];
  let score = 0;

  const effectiveTitle = (params.metaTitle || params.title || '').trim();
  const effectiveDesc = (params.metaDescription || '').trim();
  const focusKeyword = (params.focusKeyword || '').trim().toLowerCase();
  const slug = (params.slug || '').trim().toLowerCase();
  const ogImage = (params.ogImage || '').trim();

  // 1. Title
  const titleLength = effectiveTitle.length;
  let titleStatus: 'too_short' | 'optimal' | 'too_long' | 'empty' = 'empty';

  if (!effectiveTitle) {
    issues.push({
      type: 'error',
      code: 'TITLE_MISSING',
      message: 'SEO Title is missing.',
      messageFr: 'Titre SEO manquant.',
    });
  } else {
    score += 15;
    if (titleLength >= 45 && titleLength <= 65) {
      score += 10;
      titleStatus = 'optimal';
      issues.push({
        type: 'good',
        code: 'TITLE_LENGTH_OPTIMAL',
        message: `Title length (${titleLength} chars) is optimal.`,
        messageFr: `Longueur du titre (${titleLength} car.) optimale (~50-60 car.).`,
      });
    } else if (titleLength < 45) {
      score += 4;
      titleStatus = 'too_short';
      issues.push({
        type: 'warning',
        code: 'TITLE_TOO_SHORT',
        message: `Title length (${titleLength} chars) is short. Recommended: 45–65.`,
        messageFr: `Titre court (${titleLength} car. / conseillé : 45–65 car.).`,
      });
    } else {
      score += 4;
      titleStatus = 'too_long';
      issues.push({
        type: 'warning',
        code: 'TITLE_TOO_LONG',
        message: `Title length (${titleLength} chars) exceeds 65 chars.`,
        messageFr: `Titre trop long (${titleLength} car.), risque d'être tronqué.`,
      });
    }

    if (focusKeyword) {
      if (effectiveTitle.toLowerCase().includes(focusKeyword)) {
        score += 15;
        issues.push({
          type: 'good',
          code: 'KEYWORD_IN_TITLE',
          message: `Focus keyword "${params.focusKeyword}" found in title.`,
          messageFr: `Mot-clé "${params.focusKeyword}" présent dans le titre SEO.`,
        });
      } else {
        issues.push({
          type: 'warning',
          code: 'KEYWORD_NOT_IN_TITLE',
          message: `Focus keyword "${params.focusKeyword}" is missing from title.`,
          messageFr: `Le mot-clé principal n'apparaît pas dans le titre SEO.`,
        });
      }
    }
  }

  // 2. Description
  const descLength = effectiveDesc.length;
  let descStatus: 'too_short' | 'optimal' | 'too_long' | 'empty' = 'empty';

  if (!effectiveDesc) {
    issues.push({
      type: 'error',
      code: 'DESCRIPTION_MISSING',
      message: 'Meta description is missing.',
      messageFr: 'Méta description manquante.',
    });
  } else {
    score += 10;
    if (descLength >= 120 && descLength <= 165) {
      score += 10;
      descStatus = 'optimal';
      issues.push({
        type: 'good',
        code: 'DESCRIPTION_LENGTH_OPTIMAL',
        message: `Meta description length (${descLength} chars) is optimal.`,
        messageFr: `Longueur de description (${descLength} car.) idéale (~120–160 car.).`,
      });
    } else if (descLength < 120) {
      score += 4;
      descStatus = 'too_short';
      issues.push({
        type: 'warning',
        code: 'DESCRIPTION_TOO_SHORT',
        message: `Meta description (${descLength} chars) is too short. Target 120–160.`,
        messageFr: `Méta description un peu courte (${descLength} car. / visez 120–160 car.).`,
      });
    } else {
      score += 4;
      descStatus = 'too_long';
      issues.push({
        type: 'warning',
        code: 'DESCRIPTION_TOO_LONG',
        message: `Meta description (${descLength} chars) exceeds 165 chars.`,
        messageFr: `Méta description longue (${descLength} car.), risque d'être coupée.`,
      });
    }

    if (focusKeyword) {
      if (effectiveDesc.toLowerCase().includes(focusKeyword)) {
        score += 5;
        issues.push({
          type: 'good',
          code: 'KEYWORD_IN_DESCRIPTION',
          message: `Focus keyword is present in description.`,
          messageFr: `Mot-clé principal présent dans la méta description.`,
        });
      } else {
        issues.push({
          type: 'warning',
          code: 'KEYWORD_NOT_IN_DESCRIPTION',
          message: `Focus keyword does not appear in description.`,
          messageFr: `Le mot-clé principal n'apparaît pas dans la méta description.`,
        });
      }
    }
  }

  // 3. Social Share Image
  if (ogImage) {
    score += 15;
    issues.push({
      type: 'good',
      code: 'SOCIAL_IMAGE_CONFIGURED',
      message: 'Dedicated social share image configured for Facebook/WhatsApp/X.',
      messageFr: 'Image de partage social dédiée (1200×630) configurée.',
    });
  } else {
    issues.push({
      type: 'warning',
      code: 'SOCIAL_IMAGE_MISSING',
      message: 'No custom social share image. Fallback image will be used.',
      messageFr: "Pas d'image de partage dédiée. L'image par défaut sera utilisée.",
    });
  }

  // 4. Focus Keyword & Slug
  if (!focusKeyword) {
    issues.push({
      type: 'warning',
      code: 'FOCUS_KEYWORD_MISSING',
      message: 'No focus keyword defined.',
      messageFr: 'Aucun mot-clé principal défini.',
    });
  } else {
    if (slug && slug.includes(focusKeyword.replace(/\s+/g, '-'))) {
      score += 5;
      issues.push({
        type: 'good',
        code: 'KEYWORD_IN_SLUG',
        message: 'Focus keyword found in URL slug.',
        messageFr: "Mot-clé principal présent dans l'URL (slug).",
      });
    }
  }

  if (slug) {
    if (/^[a-z0-9\-/]+$/.test(slug)) {
      score += 5;
      issues.push({
        type: 'good',
        code: 'SLUG_VALID',
        message: 'Valid search-friendly slug.',
        messageFr: "Slug d'URL valide et lisible.",
      });
    }
  }

  // 5. Technical & Structured Data
  if (params.canonicalUrl) {
    score += 3;
    issues.push({
      type: 'good',
      code: 'CANONICAL_SET',
      message: 'Canonical URL explicitly defined.',
      messageFr: 'URL canonique explicite définie.',
    });
  }

  if (params.schemaType && params.schemaType !== 'WebPage') {
    score += 4;
    issues.push({
      type: 'good',
      code: 'SCHEMA_CONFIGURED',
      message: `Schema.org structured data enabled (${params.schemaType}).`,
      messageFr: `Données structurées activées (${params.schemaType}).`,
    });
  }

  if (params.sitemapEnabled !== false && params.robotsIndex !== false) {
    score += 3;
    issues.push({
      type: 'good',
      code: 'INDEX_SITEMAP_ENABLED',
      message: 'Page indexable and included in sitemap.',
      messageFr: 'Page indexable et incluse dans le sitemap.',
    });
  } else if (params.robotsIndex === false) {
    issues.push({
      type: 'warning',
      code: 'ROBOTS_NOINDEX',
      message: 'Page is marked noindex.',
      messageFr: 'Page configurée en noindex.',
    });
  }

  const finalScore = Math.min(100, Math.max(0, score));
  let scoreStatus: SeoScoreStatus = 'poor';
  if (finalScore >= 90) scoreStatus = 'excellent';
  else if (finalScore >= 70) scoreStatus = 'good';
  else if (finalScore >= 50) scoreStatus = 'needs_improvement';

  return {
    score: finalScore,
    scoreStatus,
    issues,
    titleLength,
    titleStatus,
    descLength,
    descStatus,
  };
}
