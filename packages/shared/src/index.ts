// E-commerce Status Types
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod =
  | 'CASH_ON_DELIVERY'
  | 'CASH_ON_PICKUP'
  | 'BANK_TRANSFER'
  | 'MANUAL_ADMIN';

export type PaymentStatus =
  | 'UNPAID'
  | 'PAID'
  | 'REFUNDED';

export type SportType = 'football' | 'basketball' | 'club' | 'academy' | 'fans';

// 1. Product Interfaces
export interface ISharedProductVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  colorHex?: string;
  stock: number;
  price?: number; // override if variant has custom pricing
}

export interface ISharedProduct {
  id: string;
  name: string;
  nameFr?: string;
  nameAr?: string;
  slug: string;
  sku: string;
  description: string;
  descriptionFr?: string;
  descriptionAr?: string;
  shortDescription?: string;
  coverImage: string;
  images: string[];
  price: number; // stored in millimes
  oldPrice?: number;
  costPrice?: number;
  category: string;
  collections: string[];
  sport: SportType;
  season: string;
  variants: ISharedProductVariant[];
  badges: string[];
  tags: string[];
  material?: string;
  careInstructions?: string;
  sizeGuideUrl?: string;
  status: 'draft' | 'published' | 'archived';
  isFeatured?: boolean;
  lowStockThreshold: number;
  views: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

// 2. Category Interfaces
export interface ISharedCategory {
  id: string;
  name: string;
  nameFr?: string;
  nameAr?: string;
  slug: string;
  icon: string;
  description?: string;
  coverImage?: string;
  displayOrder: number;
  active: boolean;
}

// 3. Collection Interfaces
export interface ISharedCollection {
  id: string;
  name: string;
  nameFr?: string;
  nameAr?: string;
  slug: string;
  description?: string;
  coverImage?: string;
  displayOrder: number;
  active: boolean;
}

// 4. Cart Interfaces
export interface ISharedCartItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface ISharedCartCalculationInput {
  items: ISharedCartItem[];
  couponCode?: string;
  deliveryZoneId?: string;
}

export interface ISharedCartCalculationOutput {
  subtotal: number; // in millimes
  discount: number;
  deliveryFee: number;
  total: number;
  items: {
    productId: string;
    variantId: string;
    name: string;
    size: string;
    color: string;
    image: string;
    price: number;
    quantity: number;
    rowTotal: number;
  }[];
  couponApplied?: {
    code: string;
    value: number;
    type: 'percentage' | 'fixed_amount' | 'free_delivery';
  };
}

// 5. Pickup Point Interfaces
export interface ISharedPickupPoint {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  address: string;
  addressAr?: string;
  city: string;
  governorate: string;
  postalCode: string;
  phone: string;
  googleMapsLink?: string;
  openingHours: string;
  notes?: string;
  instructions?: string;
  active: boolean;
  displayOrder: number;
}

// 6. Delivery Zone Interfaces
export interface ISharedDeliveryZone {
  id: string;
  city: string;
  governorate: string;
  deliveryPrice: number; // in millimes
  estimatedTime: string;
  freeDeliveryThreshold?: number; // in millimes
  active: boolean;
  notes?: string;
}

// 7. Order Interfaces
export interface ISharedOrderItem {
  productId: string;
  variantId: string;
  sku: string;
  name: string;
  size: string;
  color: string;
  price: number; // Millimes snapshotted at purchase
  quantity: number;
}

export interface ISharedOrder {
  id: string;
  reference: string; // USM-XXXXXX unique format
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryMethod: 'delivery' | 'pickup';
  deliveryAddress?: {
    address: string;
    city: string;
    governorate: string;
    postalCode: string;
    notes?: string;
  };
  pickupPointId?: string;
  items: ISharedOrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  couponCode?: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  adminNotes?: string;
  customerNotes?: string;
  statusTimeline: {
    status: OrderStatus;
    updatedAt: string;
    note?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

// 8. Coupon Interfaces
export interface ISharedCoupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_delivery';
  value: number;
  minOrderAmount?: number;
  usageLimit?: number;
  usageCount: number;
  startDate?: string;
  endDate?: string;
  active: boolean;
}

// 9. SEO & Metadata Interfaces
export type SeoEntityType =
  | 'page'
  | 'news'
  | 'product'
  | 'category'
  | 'player'
  | 'staff'
  | 'match'
  | 'competition'
  | 'sponsor'
  | 'media'
  | 'legend'
  | 'history'
  | 'palmares'
  | 'trophy'
  | 'stadium'
  | 'downloads'
  | 'legal'
  | 'custom';

export type SeoScoreStatus = 'poor' | 'needs_improvement' | 'good' | 'excellent';

export interface ISharedSeoAuditIssue {
  type: 'error' | 'warning' | 'good';
  code: string;
  message: string;
  messageFr: string;
}

export interface ISharedSeoMetadata {
  id?: string;
  entityType: SeoEntityType;
  entityId: string;
  path: string;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  slug?: string;
  focusKeyword?: string;
  secondaryKeywords?: string[];
  robotsIndex: boolean;
  robotsFollow: boolean;
  // Open Graph
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string; // 1200x630 Social Share Image
  ogImageAlt?: string;
  ogType?: string;
  ogSiteName?: string;
  // Twitter
  twitterCard?: 'summary' | 'summary_large_image';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  // Schema.org
  schemaType?: string;
  customJsonLd?: string;
  // Multilingual & Sitemaps
  hreflang?: Record<string, string>;
  breadcrumbsEnabled?: boolean;
  sitemapEnabled?: boolean;
  priority?: number;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  // Quality & Scoring
  seoScore: number;
  scoreStatus?: SeoScoreStatus;
  seoIssues: ISharedSeoAuditIssue[];
  lastAnalyzedAt?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISharedSeoSettings {
  id?: string;
  siteName: string;
  organizationName: string;
  titleTemplateDefault: string;
  titleTemplateProducts: string;
  titleTemplateNews: string;
  titleTemplatePlayers: string;
  titleTemplateMatches: string;
  defaultMetaDescription: string;
  defaultSocialImage: string; // 1200x630
  twitterHandle: string;
  facebookUrl: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  logoUrl: string;
  canonicalDomain: string;
  defaultLanguage: string;
}

export interface ISharedSeoRedirect {
  id: string;
  sourcePath: string;
  destinationPath: string;
  statusCode: 301 | 302;
  active: boolean;
  hits: number;
  lastHitAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ISharedSeoNotFoundLog {
  id: string;
  path: string;
  hits: number;
  lastSeenAt: string;
  referrers: string[];
  resolved: boolean;
  redirectId?: string;
}

export interface ISharedSeoOverview {
  totalContent: number;
  completeCount: number;
  needsImprovementCount: number;
  missingCount: number;
  excellentCount: number;
  goodCount: number;
  poorCount: number;
  averageScore: number;
  completionRate: number;
  missingSocialImageCount: number;
  missingFocusKeywordCount: number;
  duplicateTitlesCount: number;
  noindexCount: number;
  health: {
    sitemapAccessible: boolean;
    robotsAccessible: boolean;
    canonicalDomainConfigured: boolean;
    defaultSocialImageConfigured: boolean;
    duplicateTitlesCount: number;
    redirectsCount: number;
    unresolved404Count: number;
  };
}
