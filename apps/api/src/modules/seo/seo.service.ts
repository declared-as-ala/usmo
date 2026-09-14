import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SeoMetadata } from './schemas/seo-metadata.schema';
import { SeoSettings } from './schemas/seo-settings.schema';
import { SeoRedirect } from './schemas/seo-redirect.schema';
import { SeoNotFoundLog } from './schemas/seo-not-found-log.schema';
import { SeoHistoryLog } from './schemas/seo-history-log.schema';
import { analyzeSeo } from './seo-analyzer';
import { News } from '../news/news.schema';
import { Product } from '../products/product.schema';
import { Category } from '../categories/category.schema';
import { Player } from '../players/player.schema';
import { Match } from '../matches/match.schema';
import { Sponsor } from '../sponsors/sponsor.schema';
import { MediaItem } from '../media/media.schema';
import { Legend } from '../legends/legend.schema';
import { resolvePublicMediaUrl, normalizePublicMediaUrl } from '../../common/public-media-url';
import { ISharedSeoOverview, SeoEntityType } from 'shared';

export const STATIC_PAGE_DEFS = [
  {
    id: 'home',
    title: 'Accueil — Union Sportive Monastirienne',
    path: '/',
    defaultTitle: "US Monastir — Site officiel de l'Union Sportive Monastirienne",
    defaultDesc: "Actualités, équipes de football et basketball, matchs en direct, boutique officielle et billetterie de l'Union Sportive Monastirienne (USM).",
    schemaType: 'SportsOrganization',
    priority: 1.0,
    changeFrequency: 'daily',
    focusKeyword: 'US Monastir',
  },
  {
    id: 'boutique',
    title: 'Boutique Officielle USM',
    path: '/boutique',
    defaultTitle: 'Boutique Officielle US Monastir | Maillots, Tenues & Accessoires',
    defaultDesc: 'Commandez les maillots officiels 2026/27, survêtements et produits dérivés de l’US Monastir. Livraison partout en Tunisie et retrait club.',
    schemaType: 'CollectionPage',
    priority: 0.9,
    changeFrequency: 'daily',
    focusKeyword: 'Boutique US Monastir',
  },
  {
    id: 'actualites',
    title: 'Actualités & Communiqués',
    path: '/actualites',
    defaultTitle: 'Actualités US Monastir | Toute l’information officielle du Club',
    defaultDesc: 'Suivez en direct les actualités, transferts, conférences de presse et communiqués officiels du club omnisports de Monastir.',
    schemaType: 'CollectionPage',
    priority: 0.8,
    changeFrequency: 'daily',
    focusKeyword: 'Actualités US Monastir',
  },
  {
    id: 'matches',
    title: 'Match Center & Calendrier',
    path: '/matches',
    defaultTitle: 'Match Center US Monastir | Calendrier, Résultats & Classement',
    defaultDesc: 'Calendrier des rencontres, scores en direct, feuilles de match et classement en Ligue 1 tunisienne et basketball.',
    schemaType: 'SportsEvent',
    priority: 0.8,
    changeFrequency: 'daily',
    focusKeyword: 'Match US Monastir',
  },
  {
    id: 'football',
    title: 'Football — Équipe Première',
    path: '/football',
    defaultTitle: 'Équipe Première Football | Union Sportive Monastirienne',
    defaultDesc: 'Découvrez l’effectif pro, les statistiques, le staff technique et les performances de l’équipe de football de l’USM.',
    schemaType: 'SportsTeam',
    priority: 0.8,
    changeFrequency: 'weekly',
    focusKeyword: 'Football US Monastir',
  },
  {
    id: 'basketball',
    title: 'Basketball — Équipe Première',
    path: '/basketball',
    defaultTitle: 'Section Basketball | US Monastir Championne BAL & Pro A',
    defaultDesc: 'L’équipe légendaire de basket de l’USM : effectif, palmarès Basketball Africa League (BAL), calendrier et effectif.',
    schemaType: 'SportsTeam',
    priority: 0.8,
    changeFrequency: 'weekly',
    focusKeyword: 'Basketball US Monastir',
  },
  {
    id: 'fanzone',
    title: 'Fan Zone & Pronostics',
    path: '/fanzone',
    defaultTitle: 'Fan Zone US Monastir | Pronostics, Jeux & Espace Supporters',
    defaultDesc: 'Participez aux pronostics officiels USM, votez pour l’Homme du match et gagnez des cadeaux exclusifs en boutique.',
    schemaType: 'WebPage',
    priority: 0.7,
    changeFrequency: 'weekly',
    focusKeyword: 'Fan Zone USM',
  },
  {
    id: 'sponsors',
    title: 'Partenaires & Sponsors',
    path: '/sponsors',
    defaultTitle: 'Nos Partenaires & Sponsors Officiels | US Monastir',
    defaultDesc: 'Découvrez les entreprises et partenaires qui soutiennent l’Union Sportive Monastirienne dans ses ambitions sportives.',
    schemaType: 'Organization',
    priority: 0.7,
    changeFrequency: 'monthly',
    focusKeyword: 'Sponsors US Monastir',
  },
  {
    id: 'media',
    title: 'Portail Média & Vidéos',
    path: '/media',
    defaultTitle: 'Vidéos, Photos & Replays Officiels | USM Media',
    defaultDesc: 'Revivez les meilleurs moments, résumés de matchs, interviews exclusives et galeries photo en immersion avec les équipes.',
    schemaType: 'CollectionPage',
    priority: 0.7,
    changeFrequency: 'weekly',
    focusKeyword: 'Vidéos US Monastir',
  },
  {
    id: 'histoire',
    title: 'Histoire du Club',
    path: '/histoire',
    defaultTitle: 'Histoire de l’Union Sportive Monastirienne | Depuis 1923',
    defaultDesc: 'Plus d’un siècle de passion, de ferveur populaire et de fierté pour la ville de Monastir. Retour sur les racines de l’USM.',
    schemaType: 'Article',
    priority: 0.7,
    changeFrequency: 'monthly',
    focusKeyword: 'Histoire US Monastir',
  },
  {
    id: 'palmares',
    title: 'Palmarès & Titres',
    path: '/palmares',
    defaultTitle: 'Palmarès de l’US Monastir | Titres Football, Basketball & BAL',
    defaultDesc: 'Tous les trophées remportés par l’USM : Coupe de Tunisie, Supercoupe, Championnat de Basketball et sacre continental BAL.',
    schemaType: 'Article',
    priority: 0.7,
    changeFrequency: 'monthly',
    focusKeyword: 'Palmarès US Monastir',
  },
  {
    id: 'legendes',
    title: 'Légendes du Club',
    path: '/legendes',
    defaultTitle: 'Légendes de l’US Monastir | Joueurs & Figures Historiques',
    defaultDesc: 'Hommage aux joueurs et entraîneurs emblématiques qui ont marqué l’histoire de l’Union Sportive Monastirienne.',
    schemaType: 'CollectionPage',
    priority: 0.6,
    changeFrequency: 'monthly',
    focusKeyword: 'Légendes US Monastir',
  },
  {
    id: 'stadium',
    title: 'Guide du Stade Mustapha Ben Jannet',
    path: '/stadium',
    defaultTitle: 'Stade Mustapha Ben Jannet | Guide & Informations Pratiques',
    defaultDesc: 'Accès, tribunes, billetterie et historique du stade Mustapha Ben Jannet de Monastir.',
    schemaType: 'Place',
    priority: 0.6,
    changeFrequency: 'monthly',
    focusKeyword: 'Stade Mustapha Ben Jannet',
  },
  {
    id: 'telechargements',
    title: 'Centre de Téléchargement',
    path: '/telechargements',
    defaultTitle: 'Téléchargements Officiels | Fonds d’écran, Chartes & Documents USM',
    defaultDesc: 'Téléchargez les wallpapers officiels, kits supporters, chartes graphiques et documents officiels de l’US Monastir.',
    schemaType: 'WebPage',
    priority: 0.5,
    changeFrequency: 'monthly',
    focusKeyword: 'Téléchargements USM',
  },
  {
    id: 'abonnement',
    title: 'Abonnement & Adhésion',
    path: '/abonnement',
    defaultTitle: 'Abonnements Saison 2026/27 | Rejoignez la Famille USM',
    defaultDesc: 'Abonnez-vous pour la saison complète de football et basketball. Tarifs, avantages exclusifs et réservation en ligne.',
    schemaType: 'WebPage',
    priority: 0.8,
    changeFrequency: 'weekly',
    focusKeyword: 'Abonnement US Monastir',
  },
  {
    id: 'contact',
    title: 'Contact & Siège du Club',
    path: '/contact',
    defaultTitle: 'Contacter l’US Monastir | Siège Social, Téléphone & WhatsApp',
    defaultDesc: 'Coordonnées de l’Union Sportive Monastirienne, assistance boutique en ligne, partenariats et formulaire de contact.',
    schemaType: 'ContactPage',
    priority: 0.6,
    changeFrequency: 'monthly',
    focusKeyword: 'Contact US Monastir',
  },
  {
    id: 'conditions-utilisation',
    title: 'Conditions Générales d’Utilisation',
    path: '/conditions-utilisation',
    defaultTitle: 'Conditions Générales d’Utilisation | US Monastir',
    defaultDesc: 'Conditions d’utilisation du portail officiel et de la boutique de l’Union Sportive Monastirienne.',
    schemaType: 'WebPage',
    priority: 0.3,
    changeFrequency: 'yearly',
  },
  {
    id: 'confidentialite',
    title: 'Politique de Confidentialité',
    path: '/confidentialite',
    defaultTitle: 'Politique de Confidentialité & Données Personnelles | USM',
    defaultDesc: 'Gestion et protection de vos données personnelles sur le site de l’Union Sportive Monastirienne.',
    schemaType: 'WebPage',
    priority: 0.3,
    changeFrequency: 'yearly',
  },
  {
    id: 'cookies',
    title: 'Politique des Cookies',
    path: '/cookies',
    defaultTitle: 'Politique de Gestion des Cookies | US Monastir',
    defaultDesc: 'Informations relatives à l’utilisation des cookies sur le site officiel de l’USM.',
    schemaType: 'WebPage',
    priority: 0.3,
    changeFrequency: 'yearly',
  },
];

@Injectable()
export class SeoService implements OnModuleInit {
  private readonly logger = new Logger(SeoService.name);

  constructor(
    @InjectModel(SeoMetadata.name) private readonly seoModel: Model<SeoMetadata>,
    @InjectModel(SeoSettings.name) private readonly settingsModel: Model<SeoSettings>,
    @InjectModel(SeoRedirect.name) private readonly redirectModel: Model<SeoRedirect>,
    @InjectModel(SeoNotFoundLog.name) private readonly notFoundModel: Model<SeoNotFoundLog>,
    @InjectModel(SeoHistoryLog.name) private readonly historyModel: Model<SeoHistoryLog>,
    @InjectModel(News.name) private readonly newsModel: Model<News>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    @InjectModel(Player.name) private readonly playerModel: Model<Player>,
    @InjectModel(Match.name) private readonly matchModel: Model<Match>,
    @InjectModel(Sponsor.name) private readonly sponsorModel: Model<Sponsor>,
    @InjectModel(MediaItem.name) private readonly mediaModel: Model<MediaItem>,
    @InjectModel(Legend.name) private readonly legendModel: Model<Legend>,
  ) {}

  async onModuleInit() {
    await this.ensureSettings();
    await this.syncAllEntities();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. SETTINGS
  // ─────────────────────────────────────────────────────────────────────────────

  async getSettings(): Promise<SeoSettings> {
    let settings = await this.settingsModel.findOne({ key: 'global' });
    if (!settings) {
      settings = await this.settingsModel.create({ key: 'global' });
    }
    return settings;
  }

  async ensureSettings(): Promise<void> {
    const exists = await this.settingsModel.findOne({ key: 'global' });
    if (!exists) {
      await this.settingsModel.create({ key: 'global' });
      this.logger.log('Default global SEO settings initialized.');
    }
  }

  async updateSettings(dto: Partial<SeoSettings>): Promise<SeoSettings> {
    const updated = await this.settingsModel.findOneAndUpdate(
      { key: 'global' },
      { $set: dto },
      { new: true, upsert: true },
    );
    return updated;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. CONTENT SYNC & FALLBACK GENERATION
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Scans MongoDB entities and static pages and ensures a SeoMetadata document exists.
   * Does NOT overwrite manual customizations!
   */
  async syncAllEntities(): Promise<void> {
    try {
      const settings = await this.getSettings();

      // A. Static Pages
      for (const p of STATIC_PAGE_DEFS) {
        await this.upsertInitialSeo({
          entityType: 'page',
          entityId: p.id,
          path: p.path,
          title: p.title,
          defaultTitle: p.defaultTitle,
          defaultDesc: p.defaultDesc,
          schemaType: p.schemaType,
          priority: p.priority,
          changeFrequency: p.changeFrequency,
          focusKeyword: p.focusKeyword,
          ogImage: settings.defaultSocialImage,
        });
      }

      // B. News Articles
      const articles = await this.newsModel.find({ published: true }).select('slug title titleFr summary summaryFr image seoTitle seoDescription').lean();
      for (const a of articles) {
        const title = a.titleFr || a.title;
        const slug = a.slug || a._id.toString();
        const defaultTitle = settings.titleTemplateNews.replace('%s', title);
        const defaultDesc = a.summaryFr || a.summary || '';
        await this.upsertInitialSeo({
          entityType: 'news',
          entityId: a._id.toString(),
          path: `/actualites/${slug}`,
          title,
          slug,
          defaultTitle: a.seoTitle || defaultTitle,
          defaultDesc: a.seoDescription || defaultDesc,
          schemaType: 'NewsArticle',
          priority: 0.7,
          changeFrequency: 'weekly',
          focusKeyword: 'US Monastir',
          fallbackImage: a.image,
        });
      }

      // C. Products
      const products = await this.productModel.find({ isPublished: true }).select('slug name nameFr description descriptionFr coverImage seoTitle seoDescription').lean();
      for (const pr of products) {
        const title = pr.nameFr || pr.name;
        const defaultTitle = settings.titleTemplateProducts.replace('%s', title);
        const defaultDesc = (pr.descriptionFr || pr.description || '').replace(/<[^>]*>/g, '').slice(0, 160);
        await this.upsertInitialSeo({
          entityType: 'product',
          entityId: pr._id.toString(),
          path: `/product/${pr.slug}`,
          title,
          slug: pr.slug,
          defaultTitle: pr.seoTitle || defaultTitle,
          defaultDesc: pr.seoDescription || defaultDesc,
          schemaType: 'Product',
          priority: 0.8,
          changeFrequency: 'weekly',
          focusKeyword: title,
          fallbackImage: pr.coverImage,
        });
      }

      // D. Categories
      const categories = await this.categoryModel.find({ active: true }).select('slug name nameFr description coverImage').lean();
      for (const cat of categories) {
        const title = cat.nameFr || cat.name;
        await this.upsertInitialSeo({
          entityType: 'category',
          entityId: cat._id.toString(),
          path: `/boutique?category=${cat.slug}`,
          title: `Catégorie : ${title}`,
          slug: cat.slug,
          defaultTitle: `${title} | Boutique US Monastir`,
          defaultDesc: cat.description || `Découvrez la collection ${title} officielle de l'Union Sportive Monastirienne.`,
          schemaType: 'CollectionPage',
          priority: 0.7,
          changeFrequency: 'weekly',
          focusKeyword: title,
          fallbackImage: cat.coverImage,
        });
      }

      // E. Players
      const players = await this.playerModel.find().select('slug name sport position image bio').lean();
      for (const pl of players) {
        const sportLabel = pl.sport === 'football' ? 'Football' : 'Basketball';
        const defaultTitle = settings.titleTemplatePlayers.replace('%s', `${pl.name} — ${sportLabel}`);
        await this.upsertInitialSeo({
          entityType: 'player',
          entityId: pl._id.toString(),
          path: `/${pl.sport}/joueurs/${pl.slug}`,
          title: `${pl.name} (${sportLabel})`,
          slug: pl.slug,
          defaultTitle,
          defaultDesc: `Profil officiel, statistiques et parcours de ${pl.name}, joueur de ${sportLabel} à l'Union Sportive Monastirienne.`,
          schemaType: 'Person',
          priority: 0.6,
          changeFrequency: 'monthly',
          focusKeyword: pl.name,
          fallbackImage: pl.image,
        });
      }

      // F. Sponsors
      const sponsors = await this.sponsorModel.find({ active: true }).select('slug name logo category description').lean();
      for (const sp of sponsors) {
        await this.upsertInitialSeo({
          entityType: 'sponsor',
          entityId: sp._id.toString(),
          path: `/sponsors#${sp.slug || sp._id.toString()}`,
          title: sp.name,
          slug: sp.slug,
          defaultTitle: `${sp.name} — Partenaire Officiel US Monastir`,
          defaultDesc: sp.description || `Partenariat officiel entre ${sp.name} et l'Union Sportive Monastirienne.`,
          schemaType: 'Organization',
          priority: 0.5,
          changeFrequency: 'monthly',
          focusKeyword: sp.name,
          fallbackImage: sp.logo,
        });
      }

      // G. Media
      const mediaItems = await this.mediaModel.find({ isActive: true }).select('title description coverImage videoUrl type').lean();
      for (const med of mediaItems) {
        await this.upsertInitialSeo({
          entityType: 'media',
          entityId: med._id.toString(),
          path: `/media#${med._id.toString()}`,
          title: med.title,
          defaultTitle: `${med.title} | USM Media`,
          defaultDesc: med.description || `Vidéo et photos officielles de l'Union Sportive Monastirienne.`,
          schemaType: med.type === 'video' ? 'VideoObject' : 'ImageGallery',
          priority: 0.6,
          changeFrequency: 'weekly',
          focusKeyword: med.title,
          fallbackImage: med.coverImage,
        });
      }

      this.logger.log('All entities synchronized into SEO metadata system.');
    } catch (err) {
      this.logger.error('Failed to sync entities into SEO:', err);
    }
  }

  private async upsertInitialSeo(params: {
    entityType: SeoEntityType;
    entityId: string;
    path: string;
    title: string;
    slug?: string;
    defaultTitle: string;
    defaultDesc: string;
    schemaType?: string;
    priority?: number;
    changeFrequency?: string;
    focusKeyword?: string;
    ogImage?: string;
    fallbackImage?: string;
  }): Promise<void> {
    const existing = await this.seoModel.findOne({
      entityType: params.entityType,
      entityId: params.entityId,
    });

    if (!existing) {
      const initialImage = params.ogImage || params.fallbackImage || '';
      const analysis = analyzeSeo({
        title: params.title,
        metaTitle: params.defaultTitle,
        metaDescription: params.defaultDesc,
        focusKeyword: params.focusKeyword,
        slug: params.slug || params.path,
        canonicalUrl: params.path,
        ogImage: initialImage,
        schemaType: params.schemaType || 'WebPage',
        robotsIndex: true,
        robotsFollow: true,
        sitemapEnabled: true,
      });

      await this.seoModel.create({
        entityType: params.entityType,
        entityId: params.entityId,
        path: params.path,
        title: params.title,
        metaTitle: params.defaultTitle,
        metaDescription: params.defaultDesc,
        canonicalUrl: params.path,
        slug: params.slug,
        focusKeyword: params.focusKeyword,
        ogImage: initialImage,
        ogTitle: params.defaultTitle,
        ogDescription: params.defaultDesc,
        schemaType: params.schemaType || 'WebPage',
        priority: params.priority ?? 0.7,
        changeFrequency: params.changeFrequency ?? 'weekly',
        robotsIndex: true,
        robotsFollow: true,
        sitemapEnabled: true,
        seoScore: analysis.score,
        scoreStatus: analysis.scoreStatus,
        seoIssues: analysis.issues,
        lastAnalyzedAt: new Date(),
      });
    } else {
      // Update path/title if changed, but keep custom SEO fields intact
      let changed = false;
      if (existing.path !== params.path) {
        existing.path = params.path;
        changed = true;
      }
      if (existing.title !== params.title) {
        existing.title = params.title;
        changed = true;
      }
      if (changed) {
        await existing.save();
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. OVERVIEW & HEALTH METRICS
  // ─────────────────────────────────────────────────────────────────────────────

  async getOverview(): Promise<ISharedSeoOverview> {
    const all = await this.seoModel.find().lean();
    const redirects = await this.redirectModel.countDocuments({ active: true });
    const unresolved404 = await this.notFoundModel.countDocuments({ resolved: false });
    const settings = await this.getSettings();

    let completeCount = 0;
    let needsImprovementCount = 0;
    let missingCount = 0;
    let excellentCount = 0;
    let goodCount = 0;
    let poorCount = 0;
    let totalScore = 0;
    let missingSocialImage = 0;
    let missingFocusKeyword = 0;
    let noindexCount = 0;

    const titleMap = new Map<string, number>();

    for (const item of all) {
      totalScore += item.seoScore || 0;
      if (item.scoreStatus === 'excellent') excellentCount++;
      else if (item.scoreStatus === 'good') goodCount++;
      else if (item.scoreStatus === 'needs_improvement') needsImprovementCount++;
      else poorCount++;

      if (item.metaTitle && item.metaDescription) {
        completeCount++;
      } else {
        missingCount++;
      }

      if (!item.ogImage) missingSocialImage++;
      if (!item.focusKeyword) missingFocusKeyword++;
      if (item.robotsIndex === false) noindexCount++;

      if (item.metaTitle) {
        const norm = item.metaTitle.trim().toLowerCase();
        titleMap.set(norm, (titleMap.get(norm) || 0) + 1);
      }
    }

    let duplicateTitles = 0;
    for (const count of titleMap.values()) {
      if (count > 1) duplicateTitles += count;
    }

    const total = all.length || 1;
    const averageScore = Math.round(totalScore / total);
    const completionRate = Math.round((completeCount / total) * 100);

    return {
      totalContent: all.length,
      completeCount,
      needsImprovementCount,
      missingCount,
      excellentCount,
      goodCount,
      poorCount,
      averageScore,
      completionRate,
      missingSocialImageCount: missingSocialImage,
      missingFocusKeywordCount: missingFocusKeyword,
      duplicateTitlesCount: duplicateTitles,
      noindexCount,
      health: {
        sitemapAccessible: true,
        robotsAccessible: true,
        canonicalDomainConfigured: Boolean(settings.canonicalDomain),
        defaultSocialImageConfigured: Boolean(settings.defaultSocialImage),
        duplicateTitlesCount: duplicateTitles,
        redirectsCount: redirects,
        unresolved404Count: unresolved404,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. CONTENT LIST & CRUD
  // ─────────────────────────────────────────────────────────────────────────────

  async getContentList(query: {
    type?: string;
    status?: string;
    missing?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: SeoMetadata[]; total: number; duplicates: Record<string, number> }> {
    const filter: Record<string, any> = {};

    if (query.type && query.type !== 'all') {
      filter.entityType = query.type;
    }

    if (query.status && query.status !== 'all') {
      filter.scoreStatus = query.status;
    }

    if (query.missing) {
      switch (query.missing) {
        case 'title':
          filter.$or = [{ metaTitle: { $exists: false } }, { metaTitle: '' }];
          break;
        case 'description':
          filter.$or = [{ metaDescription: { $exists: false } }, { metaDescription: '' }];
          break;
        case 'social_image':
          filter.$or = [{ ogImage: { $exists: false } }, { ogImage: '' }];
          break;
        case 'focus_keyword':
          filter.$or = [{ focusKeyword: { $exists: false } }, { focusKeyword: '' }];
          break;
        case 'noindex':
          filter.robotsIndex = false;
          break;
        case 'low_score':
          filter.seoScore = { $lt: 50 };
          break;
      }
    }

    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.$or = [
        { title: regex },
        { metaTitle: regex },
        { path: regex },
        { focusKeyword: regex },
      ];
    }

    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 50));
    const skip = (page - 1) * limit;

    const [items, total, allTitles] = await Promise.all([
      this.seoModel.find(filter as any).sort({ seoScore: 1, updatedAt: -1 }).skip(skip).limit(limit),
      this.seoModel.countDocuments(filter as any),
      this.seoModel.find().select('metaTitle').lean(),
    ]);

    // Compute duplicates map for titles
    const duplicates: Record<string, number> = {};
    for (const doc of allTitles) {
      if (doc.metaTitle) {
        const k = doc.metaTitle.trim();
        duplicates[k] = (duplicates[k] || 0) + 1;
      }
    }

    return { items, total, duplicates };
  }

  async getContentItem(entityType: string, entityId: string): Promise<SeoMetadata> {
    const item = await this.seoModel.findOne({ entityType: entityType as SeoEntityType, entityId });
    if (!item) {
      throw new Error(`SEO metadata not found for ${entityType}/${entityId}`);
    }
    return item;
  }

  async updateContentItem(
    entityType: string,
    entityId: string,
    dto: Partial<SeoMetadata>,
    adminEmail = 'system',
  ): Promise<SeoMetadata> {
    const item = await this.getContentItem(entityType, entityId);

    // Track changelog
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];
    for (const [key, val] of Object.entries(dto)) {
      if ((item as any)[key] !== val) {
        changes.push({
          field: key,
          oldValue: (item as any)[key],
          newValue: val,
        });
      }
    }

    // Slug change detection -> auto redirect suggestion
    if (dto.slug && item.slug && dto.slug !== item.slug && item.entityType === 'product') {
      const oldPath = `/product/${item.slug}`;
      const newPath = `/product/${dto.slug}`;
      await this.redirectModel.findOneAndUpdate(
        { sourcePath: oldPath },
        {
          sourcePath: oldPath,
          destinationPath: newPath,
          statusCode: 301,
          active: true,
          notes: `Auto-générée suite à la modification du slug produit : ${item.title}`,
        },
        { upsert: true },
      );
    }

    Object.assign(item, dto);

    // Normalize image URL
    if (item.ogImage) {
      item.ogImage = normalizePublicMediaUrl(item.ogImage);
    }

    // Run Yoast-style analyzer
    const analysis = analyzeSeo({
      title: item.title,
      metaTitle: item.metaTitle,
      metaDescription: item.metaDescription,
      focusKeyword: item.focusKeyword,
      slug: item.slug || item.path,
      canonicalUrl: item.canonicalUrl || item.path,
      ogImage: item.ogImage,
      ogTitle: item.ogTitle,
      ogDescription: item.ogDescription,
      schemaType: item.schemaType,
      robotsIndex: item.robotsIndex,
      robotsFollow: item.robotsFollow,
      sitemapEnabled: item.sitemapEnabled,
    });

    item.seoScore = analysis.score;
    item.scoreStatus = analysis.scoreStatus;
    item.seoIssues = analysis.issues;
    item.lastAnalyzedAt = new Date();
    item.updatedBy = adminEmail;

    const saved = await item.save();

    // Log history
    if (changes.length > 0) {
      await this.historyModel.create({
        entityType,
        entityId,
        path: item.path,
        adminEmail,
        changes,
      });
    }

    // Keep backwards compatibility with News and Products
    if (entityType === 'news') {
      await this.newsModel.findByIdAndUpdate(entityId, {
        seoTitle: item.metaTitle,
        seoDescription: item.metaDescription,
      });
    } else if (entityType === 'product') {
      await this.productModel.findByIdAndUpdate(entityId, {
        seoTitle: item.metaTitle,
        seoDescription: item.metaDescription,
      });
    }

    return saved;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. BULK ACTIONS & AUTO-GENERATION
  // ─────────────────────────────────────────────────────────────────────────────

  async bulkAction(action: string, ids: string[]): Promise<{ count: number }> {
    const settings = await this.getSettings();
    const filter = ids.length ? { _id: { $in: ids } } : {};
    const items = await this.seoModel.find(filter);
    let count = 0;

    for (const item of items) {
      let modified = false;

      if (action === 'generate_missing_titles' && !item.metaTitle) {
        let template = settings.titleTemplateDefault;
        if (item.entityType === 'product') template = settings.titleTemplateProducts;
        else if (item.entityType === 'news') template = settings.titleTemplateNews;
        else if (item.entityType === 'player') template = settings.titleTemplatePlayers;
        item.metaTitle = template.replace('%s', item.title);
        modified = true;
      } else if (action === 'generate_missing_descriptions' && !item.metaDescription) {
        item.metaDescription = `Retrouvez les détails, photos et informations officielles de l’Union Sportive Monastirienne pour : ${item.title}.`;
        modified = true;
      } else if (action === 'apply_default_social_image' && !item.ogImage) {
        item.ogImage = settings.defaultSocialImage;
        modified = true;
      } else if (action === 'enable_sitemap') {
        item.sitemapEnabled = true;
        item.robotsIndex = true;
        modified = true;
      } else if (action === 'reanalyze') {
        modified = true;
      }

      if (modified) {
        const analysis = analyzeSeo({
          title: item.title,
          metaTitle: item.metaTitle,
          metaDescription: item.metaDescription,
          focusKeyword: item.focusKeyword,
          slug: item.slug || item.path,
          canonicalUrl: item.canonicalUrl || item.path,
          ogImage: item.ogImage,
          schemaType: item.schemaType,
          robotsIndex: item.robotsIndex,
          robotsFollow: item.robotsFollow,
          sitemapEnabled: item.sitemapEnabled,
        });
        item.seoScore = analysis.score;
        item.scoreStatus = analysis.scoreStatus;
        item.seoIssues = analysis.issues;
        item.lastAnalyzedAt = new Date();
        await item.save();
        count++;
      }
    }

    return { count };
  }

  async analyzeAll(): Promise<{ analyzed: number }> {
    const items = await this.seoModel.find();
    for (const item of items) {
      const analysis = analyzeSeo({
        title: item.title,
        metaTitle: item.metaTitle,
        metaDescription: item.metaDescription,
        focusKeyword: item.focusKeyword,
        slug: item.slug || item.path,
        canonicalUrl: item.canonicalUrl || item.path,
        ogImage: item.ogImage,
        schemaType: item.schemaType,
        robotsIndex: item.robotsIndex,
        robotsFollow: item.robotsFollow,
        sitemapEnabled: item.sitemapEnabled,
      });
      item.seoScore = analysis.score;
      item.scoreStatus = analysis.scoreStatus;
      item.seoIssues = analysis.issues;
      item.lastAnalyzedAt = new Date();
      await item.save();
    }
    return { analyzed: items.length };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. REDIRECTS (301 / 302)
  // ─────────────────────────────────────────────────────────────────────────────

  async getRedirects(): Promise<SeoRedirect[]> {
    return this.redirectModel.find().sort({ createdAt: -1 });
  }

  async createRedirect(dto: Partial<SeoRedirect>, user = 'admin'): Promise<SeoRedirect> {
    let source = dto.sourcePath?.trim() || '';
    if (!source.startsWith('/')) source = `/${source}`;

    let dest = dto.destinationPath?.trim() || '';
    if (!dest.startsWith('/') && !dest.startsWith('http')) dest = `/${dest}`;

    const redirect = await this.redirectModel.findOneAndUpdate(
      { sourcePath: source },
      {
        sourcePath: source,
        destinationPath: dest,
        statusCode: dto.statusCode || 301,
        active: dto.active !== false,
        notes: dto.notes || '',
        createdBy: user,
      },
      { upsert: true, new: true },
    );

    // Mark corresponding 404 as resolved
    await this.notFoundModel.updateMany(
      { path: source },
      { $set: { resolved: true, redirectId: redirect._id.toString() } },
    );

    return redirect;
  }

  async updateRedirect(id: string, dto: Partial<SeoRedirect>): Promise<SeoRedirect | null> {
    return this.redirectModel.findByIdAndUpdate(id, { $set: dto }, { new: true });
  }

  async deleteRedirect(id: string): Promise<boolean> {
    const res = await this.redirectModel.findByIdAndDelete(id);
    return Boolean(res);
  }

  async resolveRedirect(path: string): Promise<SeoRedirect | null> {
    const cleanPath = path.split('?')[0].replace(/\/+$/, '') || '/';
    const redirect = await this.redirectModel.findOne({ sourcePath: cleanPath, active: true });
    if (redirect) {
      redirect.hits = (redirect.hits || 0) + 1;
      redirect.lastHitAt = new Date();
      await redirect.save();
    }
    return redirect;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. 404 ERROR TRACKING
  // ─────────────────────────────────────────────────────────────────────────────

  async logNotFound(path: string, referrer?: string): Promise<void> {
    const cleanPath = path.split('?')[0];
    if (cleanPath.startsWith('/_next') || cleanPath.startsWith('/favicon') || cleanPath.startsWith('/api')) {
      return;
    }

    await this.notFoundModel.findOneAndUpdate(
      { path: cleanPath },
      {
        $inc: { hits: 1 },
        $set: { lastSeenAt: new Date() },
        $addToSet: { referrers: referrer || 'direct' },
      },
      { upsert: true },
    );
  }

  async getNotFoundLogs(): Promise<SeoNotFoundLog[]> {
    return this.notFoundModel.find().sort({ hits: -1, lastSeenAt: -1 }).limit(200);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 8. PUBLIC RESOLVER FOR NEXT.JS METADATA & SITEMAP
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Resolves full SEO metadata for a given path with public absolute URLs
   */
  async resolveMetadataForPath(path: string): Promise<any> {
    const clean = path.split('?')[0].replace(/\/+$/, '') || '/';
    const settings = await this.getSettings();

    let meta = await this.seoModel.findOne({ path: clean }).lean();
    if (!meta) {
      // Try entity prefix match (e.g. /actualites/my-slug)
      meta = await this.seoModel.findOne({ path: { $regex: new RegExp(`^${clean}`, 'i') } }).lean();
    }

    const fallbackImage = settings.defaultSocialImage || '/images/seo/usm-social-share-default.webp';
    const chosenImage = meta?.ogImage || fallbackImage;

    const rawDomain = settings.canonicalDomain || process.env.SITE_URL || 'https://usmonastir.tn';
    const domain = rawDomain.replace(/\/+$/, '').replace(/^https?:\/\/www\./, 'https://');
    let absoluteOgImage = chosenImage;

    if (chosenImage.startsWith('http://') || chosenImage.startsWith('https://')) {
      absoluteOgImage = chosenImage;
    } else {
      absoluteOgImage = `${domain.replace(/\/+$/, '')}${chosenImage.startsWith('/') ? '' : '/'}${chosenImage}`;
    }

    return {
      title: meta?.metaTitle || `${meta?.title || 'US Monastir'} | ${settings.siteName}`,
      description: meta?.metaDescription || settings.defaultMetaDescription,
      canonical: meta?.canonicalUrl ? `${domain}${meta.canonicalUrl.startsWith('/') ? '' : '/'}${meta.canonicalUrl}` : `${domain}${clean}`,
      robots: {
        index: meta ? meta.robotsIndex : true,
        follow: meta ? meta.robotsFollow : true,
      },
      openGraph: {
        title: meta?.ogTitle || meta?.metaTitle || meta?.title || settings.siteName,
        description: meta?.ogDescription || meta?.metaDescription || settings.defaultMetaDescription,
        url: `${domain}${clean}`,
        siteName: meta?.ogSiteName || settings.siteName,
        image: absoluteOgImage,
        imageAlt: meta?.ogImageAlt || meta?.title || settings.siteName,
        type: meta?.ogType || 'website',
      },
      twitter: {
        card: meta?.twitterCard || 'summary_large_image',
        title: meta?.twitterTitle || meta?.ogTitle || meta?.metaTitle || settings.siteName,
        description: meta?.twitterDescription || meta?.ogDescription || meta?.metaDescription || settings.defaultMetaDescription,
        image: absoluteOgImage,
      },
      schemaType: meta?.schemaType || 'WebPage',
      customJsonLd: meta?.customJsonLd,
      settings: {
        siteName: settings.siteName,
        organizationName: settings.organizationName,
        twitterHandle: settings.twitterHandle,
        facebookUrl: settings.facebookUrl,
        logoUrl: `${domain}${settings.logoUrl}`,
      },
    };
  }

  /**
   * Retrieves all entries for sitemap.xml
   */
  async getSitemapEntries(): Promise<Array<{ url: string; lastModified: Date; changeFrequency: string; priority: number }>> {
    const items = await this.seoModel.find({
      sitemapEnabled: true,
      robotsIndex: true,
    }).lean();

    return items.map((i) => ({
      url: i.path,
      lastModified: (i as any).updatedAt || new Date(),
      changeFrequency: i.changeFrequency || 'weekly',
      priority: i.priority || 0.7,
    }));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 9. EXPORT AS CSV
  // ─────────────────────────────────────────────────────────────────────────────

  async exportCsv(): Promise<string> {
    const items = await this.seoModel.find().sort({ path: 1 }).lean();
    const headers = [
      'Type',
      'Path',
      'Titre Entité',
      'SEO Title',
      'Meta Description',
      'Mot-clé principal',
      'Score SEO',
      'Statut Score',
      'Image Sociale (OG)',
      'Indexation',
      'Sitemap',
      'Schema Type',
      'Dernière analyse',
    ];

    const escape = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const rows = items.map((i) => [
      escape(i.entityType),
      escape(i.path),
      escape(i.title),
      escape(i.metaTitle || ''),
      escape(i.metaDescription || ''),
      escape(i.focusKeyword || ''),
      escape(i.seoScore),
      escape(i.scoreStatus),
      escape(i.ogImage || ''),
      escape(i.robotsIndex ? 'Index' : 'Noindex'),
      escape(i.sitemapEnabled ? 'Oui' : 'Non'),
      escape(i.schemaType || 'WebPage'),
      escape(i.lastAnalyzedAt ? new Date(i.lastAnalyzedAt).toISOString() : ''),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
