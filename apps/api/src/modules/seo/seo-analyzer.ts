import { ISharedSeoAuditIssue, SeoScoreStatus } from 'shared';

export interface SeoAnalysisInput {
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  slug?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  schemaType?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  sitemapEnabled?: boolean;
  contentSample?: string;
}

export interface SeoAnalysisResult {
  score: number;
  scoreStatus: SeoScoreStatus;
  issues: ISharedSeoAuditIssue[];
}

export function analyzeSeo(input: SeoAnalysisInput): SeoAnalysisResult {
  const issues: ISharedSeoAuditIssue[] = [];
  let score = 0;

  const effectiveTitle = (input.metaTitle || input.title || '').trim();
  const effectiveDesc = (input.metaDescription || '').trim();
  const focusKeyword = (input.focusKeyword || '').trim().toLowerCase();
  const slug = (input.slug || '').trim().toLowerCase();
  const ogImage = (input.ogImage || '').trim();

  // 1. TITLE ANALYSIS (Max 40 pts)
  if (!effectiveTitle) {
    issues.push({
      type: 'error',
      code: 'TITLE_MISSING',
      message: 'SEO Title is missing. Search engines need a clear headline.',
      messageFr: 'Titre SEO manquant. Les moteurs de recherche ont besoin d’un titre clair.',
    });
  } else {
    score += 15;
    const len = effectiveTitle.length;
    if (len >= 45 && len <= 65) {
      score += 10;
      issues.push({
        type: 'good',
        code: 'TITLE_LENGTH_OPTIMAL',
        message: `Title length (${len} chars) is optimal for Google search results.`,
        messageFr: `Longueur du titre (${len} car.) optimale pour l'affichage Google (~50-60 car.).`,
      });
    } else if (len < 45) {
      score += 4;
      issues.push({
        type: 'warning',
        code: 'TITLE_TOO_SHORT',
        message: `Title length (${len} chars) is relatively short (recommended: 45–65).`,
        messageFr: `Titre un peu court (${len} car. / recommandé : 45–65 car.).`,
      });
    } else {
      score += 4;
      issues.push({
        type: 'warning',
        code: 'TITLE_TOO_LONG',
        message: `Title length (${len} chars) exceeds 65 chars and might be truncated in search results.`,
        messageFr: `Titre trop long (${len} car.), risque d’être tronqué sur Google.`,
      });
    }

    if (focusKeyword) {
      if (effectiveTitle.toLowerCase().includes(focusKeyword)) {
        score += 15;
        issues.push({
          type: 'good',
          code: 'KEYWORD_IN_TITLE',
          message: `Focus keyword "${input.focusKeyword}" is present in the SEO title.`,
          messageFr: `Mot-clé principal "${input.focusKeyword}" présent dans le titre SEO.`,
        });
      } else {
        issues.push({
          type: 'warning',
          code: 'KEYWORD_NOT_IN_TITLE',
          message: `Focus keyword "${input.focusKeyword}" does not appear in the SEO title.`,
          messageFr: `Le mot-clé principal n'apparaît pas dans le titre SEO.`,
        });
      }
    }
  }

  // 2. META DESCRIPTION ANALYSIS (Max 25 pts)
  if (!effectiveDesc) {
    issues.push({
      type: 'error',
      code: 'DESCRIPTION_MISSING',
      message: 'Meta description is missing. Google will auto-generate an excerpt.',
      messageFr: 'Méta description manquante. Google affichera un extrait automatique.',
    });
  } else {
    score += 10;
    const len = effectiveDesc.length;
    if (len >= 120 && len <= 165) {
      score += 10;
      issues.push({
        type: 'good',
        code: 'DESCRIPTION_LENGTH_OPTIMAL',
        message: `Meta description length (${len} chars) is optimal.`,
        messageFr: `Longueur de méta description (${len} car.) idéale (~120–160 car.).`,
      });
    } else if (len < 120) {
      score += 4;
      issues.push({
        type: 'warning',
        code: 'DESCRIPTION_TOO_SHORT',
        message: `Meta description (${len} chars) is short. Aim for 120–160 characters.`,
        messageFr: `Méta description courte (${len} car.). Visez entre 120 et 160 caractères.`,
      });
    } else {
      score += 4;
      issues.push({
        type: 'warning',
        code: 'DESCRIPTION_TOO_LONG',
        message: `Meta description (${len} chars) exceeds 165 chars and may be truncated.`,
        messageFr: `Méta description un peu longue (${len} car.), risque d'être tronquée.`,
      });
    }

    if (focusKeyword) {
      if (effectiveDesc.toLowerCase().includes(focusKeyword)) {
        score += 5;
        issues.push({
          type: 'good',
          code: 'KEYWORD_IN_DESCRIPTION',
          message: `Focus keyword is present in the meta description.`,
          messageFr: `Mot-clé principal présent dans la méta description.`,
        });
      } else {
        issues.push({
          type: 'warning',
          code: 'KEYWORD_NOT_IN_DESCRIPTION',
          message: `Focus keyword does not appear in the meta description.`,
          messageFr: `Le mot-clé principal n'apparaît pas dans la méta description.`,
        });
      }
    }
  }

  // 3. SOCIAL SHARE IMAGE (Max 15 pts)
  if (ogImage) {
    score += 15;
    issues.push({
      type: 'good',
      code: 'SOCIAL_IMAGE_CONFIGURED',
      message: 'Dedicated social share image configured for Facebook/WhatsApp/X/LinkedIn.',
      messageFr: 'Image de partage social dédiée configurée (Facebook, WhatsApp, LinkedIn, X).',
    });
  } else {
    issues.push({
      type: 'warning',
      code: 'SOCIAL_IMAGE_MISSING',
      message: 'No custom social share image. Fallback entity or global USM visual will be used.',
      messageFr: "Pas d'image de partage dédiée. Le visuel par défaut sera utilisé sur les réseaux.",
    });
  }

  // 4. FOCUS KEYWORD & SLUG (Max 10 pts)
  if (!focusKeyword) {
    issues.push({
      type: 'warning',
      code: 'FOCUS_KEYWORD_MISSING',
      message: 'No focus keyword defined. Defining one allows targeted SEO analysis.',
      messageFr: 'Aucun mot-clé principal défini pour guider l’optimisation.',
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
        message: 'Clean and search-engine-friendly URL slug.',
        messageFr: "Slug d'URL propre et bien formaté.",
      });
    } else {
      issues.push({
        type: 'warning',
        code: 'SLUG_IRREGULAR',
        message: 'URL slug contains uppercase letters or non-standard characters.',
        messageFr: "Le slug d'URL contient des majuscules ou caractères non recommandés.",
      });
    }
  }

  // 5. TECHNICAL & STRUCTURED DATA (Max 10 pts)
  if (input.canonicalUrl) {
    score += 3;
    issues.push({
      type: 'good',
      code: 'CANONICAL_SET',
      message: 'Canonical URL explicitly defined to prevent duplicate content.',
      messageFr: 'URL canonique définie pour prévenir le contenu dupliqué.',
    });
  }

  if (input.schemaType && input.schemaType !== 'WebPage') {
    score += 4;
    issues.push({
      type: 'good',
      code: 'SCHEMA_CONFIGURED',
      message: `Rich Schema.org structured data enabled (${input.schemaType}).`,
      messageFr: `Données structurées Schema.org configurées (${input.schemaType}).`,
    });
  }

  if (input.sitemapEnabled !== false && input.robotsIndex !== false) {
    score += 3;
    issues.push({
      type: 'good',
      code: 'INDEX_SITEMAP_ENABLED',
      message: 'Page is configured as indexable and included in sitemap.xml.',
      messageFr: 'Page indexable et incluse dans le sitemap.xml.',
    });
  } else if (input.robotsIndex === false) {
    issues.push({
      type: 'warning',
      code: 'ROBOTS_NOINDEX',
      message: 'Page is marked noindex (excluded from search engine results).',
      messageFr: 'Page marquée noindex (volontairement exclue des résultats de recherche).',
    });
  }

  // Final normalization
  const finalScore = Math.min(100, Math.max(0, score));
  let scoreStatus: SeoScoreStatus = 'poor';
  if (finalScore >= 90) scoreStatus = 'excellent';
  else if (finalScore >= 70) scoreStatus = 'good';
  else if (finalScore >= 50) scoreStatus = 'needs_improvement';

  return {
    score: finalScore,
    scoreStatus,
    issues,
  };
}
