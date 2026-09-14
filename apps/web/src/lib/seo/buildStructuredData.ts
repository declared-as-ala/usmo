import { getPublicAbsoluteUrl } from './publicUrl';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://www.usmonastir.tn').replace(/\/+$/, '');

export function buildGlobalOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: 'Union Sportive Monastirienne',
    alternateName: 'US Monastir',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.webp`,
    foundingDate: '1923',
    address: {
      '@type': 'PostalAddress',
      streetAddress: "Avenue de l'indépendance",
      addressLocality: 'Monastir',
      postalCode: '5000',
      addressCountry: 'TN',
    },
    sport: ['Soccer', 'Basketball'],
    sameAs: [
      'https://www.facebook.com/USMonastir.officiel',
      'https://www.instagram.com/usmonastir_officiel',
      'https://www.youtube.com/@USMonastir',
    ],
  };
}

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export function buildBreadcrumbsSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: crumb.name,
      item: crumb.item.startsWith('http') ? crumb.item : `${SITE_URL}${crumb.item.startsWith('/') ? '' : '/'}${crumb.item}`,
    })),
  };
}

export interface ProductSchemaInput {
  name: string;
  description: string;
  slug: string;
  image: string;
  sku: string;
  price: number; // millimes or dinars
  inStock: boolean;
  category?: string;
}

export function buildProductSchema(p: ProductSchemaInput) {
  // Price in millimes convert to dinars (e.g. 85000 millimes = 85.000 TND)
  const priceInTnd = p.price > 1000 ? (p.price / 1000).toFixed(3) : p.price.toFixed(3);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    image: getPublicAbsoluteUrl(p.image),
    description: p.description,
    sku: p.sku || p.slug,
    brand: {
      '@type': 'Brand',
      name: 'US Monastir Official',
    },
    category: p.category || 'Boutique Officielle',
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${p.slug}`,
      priceCurrency: 'TND',
      price: priceInTnd,
      availability: p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Union Sportive Monastirienne',
      },
    },
  };
}

export interface ArticleSchemaInput {
  headline: string;
  description: string;
  slug: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
}

export function buildNewsArticleSchema(a: ArticleSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: a.headline,
    description: a.description,
    image: [getPublicAbsoluteUrl(a.image)],
    datePublished: a.datePublished,
    dateModified: a.dateModified || a.datePublished,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/actualites/${a.slug}`,
    },
    author: {
      '@type': 'Person',
      name: a.authorName || 'Rédaction US Monastir',
    },
    publisher: {
      '@type': 'SportsOrganization',
      name: 'Union Sportive Monastirienne',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.webp`,
      },
    },
  };
}

export interface PlayerSchemaInput {
  name: string;
  sport: string;
  position: string;
  slug: string;
  image: string;
  number?: number;
  nationality?: string;
}

export function buildPersonPlayerSchema(pl: PlayerSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: pl.name,
    jobTitle: `Joueur de ${pl.sport === 'football' ? 'Football' : 'Basketball'} (${pl.position})`,
    image: getPublicAbsoluteUrl(pl.image),
    url: `${SITE_URL}/${pl.sport}/joueurs/${pl.slug}`,
    nationality: pl.nationality || 'Tunisienne',
    memberOf: {
      '@type': 'SportsTeam',
      name: `US Monastir ${pl.sport === 'football' ? 'Football' : 'Basketball'}`,
    },
  };
}

export interface MatchSchemaInput {
  homeTeam: string;
  awayTeam: string;
  startDate: string;
  stadiumName?: string;
  competitionName?: string;
  slug?: string;
}

export function buildSportsEventSchema(m: MatchSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${m.homeTeam} vs ${m.awayTeam}`,
    startDate: m.startDate,
    location: {
      '@type': 'Place',
      name: m.stadiumName || 'Stade Mustapha Ben Jannet',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Monastir',
        addressCountry: 'TN',
      },
    },
    competitor: [
      { '@type': 'SportsTeam', name: m.homeTeam },
      { '@type': 'SportsTeam', name: m.awayTeam },
    ],
    description: `Match ${m.competitionName ? `de ${m.competitionName} : ` : ''}${m.homeTeam} vs ${m.awayTeam}`,
  };
}
