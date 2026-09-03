'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Match, MatchEvent, matchesData, sponsorsList, Sponsor, CatalogItem, News,
  MediaItem, mediaItems,
  PressRelease, pressReleases, AccreditationRequest, accreditationRequests,
  AdminNotification, adminNotifications,
  ClubSettings, defaultClubSettings,
  HomepageSection, defaultHomepageSections,
  AuditLogEntry, AdminTeamUser, defaultTeamUsers,
} from '../data/mockData';
import {
  MediaPhoto, MediaAlbum, MediaVideo, MediaCategory, MediaTag, Photographer, MediaArchive, MediaSettings,
  defaultMediaSettings, mediaCategories, mockPhotographers, mockMediaPhotos, mockMediaAlbums, mockMediaVideos, mockMediaArchive
} from '../data/mediaMockData';
import { useRouter } from 'next/navigation';
import { tr } from '../utils/i18n';
import { api } from '../lib/api-client';

type Language = 'en' | 'fr' | 'ar';

/** Map API product (Mongoose doc) to frontend CatalogItem */
function mapApiProductToCatalogItem(p: any): CatalogItem {
  const totalStock = (p.variants || []).reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
  const sizes: string[] = [...new Set<string>((p.variants || []).map((v: any) => v.size))];
  return {
    id: p._id || p.id,
    slug: p.slug || p._id || p.id,
    name: p.name || '',
    nameAr: p.nameAr || '',
    nameFr: p.nameFr || '',
    price: p.price != null ? `${Math.round(p.price / 1000)} TND` : '0 TND',
    oldPrice: p.oldPrice != null ? `${Math.round(p.oldPrice / 1000)} TND` : undefined,
    image: p.coverImage || p.images?.[0] || '/logo.webp',
    images: p.images || [],
    sizes,
    colors: (p.variants || []).reduce((acc: any[], v: any) => {
      if (!acc.find((c) => c.hex === v.colorHex)) {
        acc.push({ name: v.color, nameAr: v.color, nameFr: v.color, hex: v.colorHex || '#000' });
      }
      return acc;
    }, []),
    available: totalStock > 0 && p.status === 'published',
    category: p.category || 'Accessories',
    collection: p.collections?.[0] || 'accessories',
    badges: p.badges || [],
    stock: totalStock,
    reference: p.sku || '',
    description: p.description || '',
    descriptionAr: p.descriptionAr || '',
    descriptionFr: p.descriptionFr || '',
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
  };
}

/** Map API category to frontend-friendly shape */
function mapApiCategory(c: any) {
  return { id: c._id || c.id, name: c.name, nameFr: c.nameFr, nameAr: c.nameAr, slug: c.slug, icon: c.icon, displayOrder: c.displayOrder };
}
type ActiveScreen =
  | 'home'
  | 'matches'
  | 'news'
  | 'media'
  | 'fanzone'
  | 'sponsors'
  | 'catalog'
  | 'stadium'
  | 'press'
  | 'admin'
  | 'boutique'
  | 'football'
  | 'basketball'
  | 'histoire'
  | 'palmares'
  | 'legendes'
  | 'telechargements'
  | 'contact';

export interface CartItem {
  product: CatalogItem;
  size: string;
  quantity: number;
}

export interface Order {
  id: string;
  clientName: string;
  phone: string;
  city: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  timestamp: string;
}

interface AppContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  
  // Live Match State (Simulated Admin updates)
  matches: Match[];
  updateMatchScore: (matchId: string, team: 'home' | 'away', amount: number) => void;
  addMatchEvent: (matchId: string, event: Omit<MatchEvent, 'id'>) => void;
  updateMatchStatus: (matchId: string, status: 'upcoming' | 'live' | 'finished') => void;
  
  // Fan Zone State
  bluePoints: number;
  addBluePoints: (amount: number) => void;
  predictions: { [matchId: string]: string }; // e.g. { m1: "2-1" }
  submitPrediction: (matchId: string, prediction: string) => void;
  completedQuizzes: string[]; // Quiz ID array
  completeQuiz: (quizId: string) => void;
  fanBadges: string[];
  unlockBadge: (badge: string) => void;
  preferredLineup: { [position: string]: string }; // e.g. { GK: "Sadok Yeddes" }
  savePreferredLineup: (lineup: { [position: string]: string }) => void;
  
  // Sponsors Dashboard State
  sponsors: Sponsor[];
  simulateSponsorClick: (sponsorId: string) => void;
  addSponsor: (sponsor: Sponsor) => void;
  updateSponsor: (id: string, updates: Partial<Sponsor>) => void;
  deleteSponsor: (id: string) => void;

  // Boutique products — admin-editable
  products: CatalogItem[];
  categories: any[];
  addProduct: (product: CatalogItem) => void;
  updateProduct: (id: string, updates: Partial<CatalogItem>) => void;
  deleteProduct: (id: string) => void;

  // Newsroom — admin-editable
  newsList: News[];
  addNewsArticle: (article: News) => void;
  updateNewsArticle: (id: string, updates: Partial<News>) => void;
  deleteNewsArticle: (id: string) => void;

  // Match roster — admin create/delete (score/status/events already covered below)
  addMatch: (match: Match) => void;
  deleteMatch: (matchId: string) => void;

  // Media library — admin-editable
  mediaLibrary: MediaItem[];
  addMediaItem: (item: MediaItem) => void;
  deleteMediaItem: (id: string) => void;

  // Press Center — admin-editable
  releases: PressRelease[];
  addPressRelease: (release: PressRelease) => void;
  updatePressRelease: (id: string, updates: Partial<PressRelease>) => void;
  deletePressRelease: (id: string) => void;
  accreditations: AccreditationRequest[];
  updateAccreditationStatus: (id: string, status: AccreditationRequest['status'], notes?: string) => void;

  // Notifications — admin-editable
  notifications: AdminNotification[];
  sendNotification: (notification: AdminNotification) => void;

  // Club settings — admin-editable
  clubSettings: ClubSettings;
  updateClubSettings: (updates: Partial<ClubSettings>) => void;

  // Homepage sections — admin-editable, consumed by Home.tsx
  homepageSections: HomepageSection[];
  toggleHomepageSection: (key: string) => void;
  isSectionVisible: (key: string) => boolean;

  // Team / users — admin-editable reference list (no real backend auth)
  teamUsers: AdminTeamUser[];
  addTeamUser: (user: AdminTeamUser) => void;
  updateTeamUser: (id: string, updates: Partial<AdminTeamUser>) => void;
  deleteTeamUser: (id: string) => void;

  // Audit log — real entries pushed from admin actions
  auditLog: AuditLogEntry[];
  logActivity: (action: string, entity: string) => void;

  // Product Reservations
  reservations: { itemId: string; size: string; timestamp: Date }[];
  addReservation: (itemId: string, size: string) => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;

  // Site content — admin-editable
  boutiqueHeroImage: string;
  setBoutiqueHeroImage: (url: string) => void;

  // Cart Management
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: CatalogItem, size: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateCartQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;

  // Orders / Boutique Checkout
  orders: Order[];
  placeOrder: (clientName: string, phone: string, city: string) => void;
  updateOrderStatus: (orderId: string, status: 'pending' | 'confirmed' | 'cancelled') => void;
  
  // Toast notifications
  toast: { message: string; type: 'success' | 'info' | 'error'; visible: boolean };
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  hideToast: () => void;

  // Extended Media Portal State & CRUD
  mediaAlbums: MediaAlbum[];
  mediaVideos: MediaVideo[];
  mediaPhotos: MediaPhoto[];
  mediaCategories: MediaCategory[];
  mediaArchive: MediaArchive[];
  mediaSettings: MediaSettings;
  addMediaAlbum: (album: MediaAlbum) => void;
  updateMediaAlbum: (id: string, updates: Partial<MediaAlbum>) => void;
  deleteMediaAlbum: (id: string) => void;
  addMediaVideo: (video: MediaVideo) => void;
  updateMediaVideo: (id: string, updates: Partial<MediaVideo>) => void;
  deleteMediaVideo: (id: string) => void;
  addMediaPhoto: (photo: MediaPhoto) => void;
  updateMediaPhoto: (id: string, updates: Partial<MediaPhoto>) => void;
  deleteMediaPhoto: (id: string) => void;
  bulkUpdatePhotos: (photos: MediaPhoto[]) => void;
  addMediaCategory: (category: MediaCategory) => void;
  updateMediaCategory: (id: string, updates: Partial<MediaCategory>) => void;
  deleteMediaCategory: (id: string) => void;
  addMediaArchive: (archive: MediaArchive) => void;
  updateMediaArchive: (id: string, updates: Partial<MediaArchive>) => void;
  deleteMediaArchive: (id: string) => void;
  updateMediaSettings: (settings: Partial<MediaSettings>) => void;

  // Localization translator
  t: (key: string) => string;

  // Auth & RBAC Permissions
  userRole: 'guest' | 'supporter' | 'admin';
  adminRole: string;
  customPermissions: string[];
  isSuperAdmin: boolean;
  isOrderManager: boolean;
  hasPermission: (permission: string) => boolean;
  isLoggedIn: boolean;
  username: string;
  logout: () => void;
  fan: any | null;
  refreshMe: () => Promise<any>;
  loginFan: (email: string, pass: string) => Promise<any>;
  logoutFan: () => Promise<void>;
}

const translations: { [lang: string]: { [key: string]: string } } = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.matches': 'Matches',
    'nav.news': 'News',
    'nav.more': 'More',
    'nav.media': 'USM Media',
    'nav.fanzone': 'Fan Zone',
    'nav.club': 'Club History',
    'nav.partners': 'Sponsors',
    'nav.catalog': 'Shop',
    'nav.boutique': 'Shop',
    'nav.contact': 'Contact',
    'nav.admin': 'Admin',
    'nav.nextMatch': 'Next Match',
    'nav.football': 'Football',
    'nav.basketball': 'Basketball',
    'nav.history': 'History',
    'nav.palmares': 'Palmarès',
    'nav.legendes': 'Legends',
    'nav.downloads': 'Downloads',
    'nav.stadium': 'Stadium Guide',
    
    // Header/Search/Buttons
    'btn.discover': 'Discover the Club',
    'btn.nextMatch': 'Match Details',
    'btn.allNews': 'View All News',
    'btn.readMore': 'Read Article',
    'btn.allStandings': 'Full Standings',
    'btn.playerProfile': 'Player Profile',
    'btn.becomePartner': 'Become a Partner',
    'btn.inStore': 'Available in Store',
    'btn.submit': 'Submit',
    'search.placeholder': 'Search players, news, matches...',
    
    // Live / Match center
    'match.live': 'LIVE',
    'match.countdown': 'MATCH COUNTDOWN',
    'match.presentedBy': 'Presented by',
    'match.venue': 'Venue',
    'match.timeline': 'Match Timeline',
    'match.stats': 'Match Statistics',
    'match.lineup': 'Expected Lineups',
    'match.h2h': 'Head to Head',
    'match.prediction': 'Score Prediction',
    'match.predictBtn': 'Predict Score',
    'match.votePlayer': 'Vote Player of the Match',
    
    // USM Today
    'today.title': 'USM TODAY',
    'today.training': 'Training Session',
    'today.birthday': 'Player Birthday',
    'today.daysLeft': 'days until next match',
    'today.ranking': 'Current Ligue 1 Ranking',
    'today.history': 'On This Day',
    'today.poll': 'Supporter Poll of the Day',
    
    // Page Sections
    'home.heroTitle': 'Union Sportive Monastirienne',
    'home.heroSub': 'One City. One Heart. One Club.',
    'home.today': 'USM Today',
    'home.news': 'Latest News',
    'home.spotlight': 'Player Spotlight',
    'home.spotlightSub': 'Player of the Week',
    'home.historyTitle': 'Palmarès & Heritage',
    'home.sponsorsTitle': 'Sponsorship Showcase',
    'home.storeTitle': 'Boutique',
    
    // Stadium
    'stadium.title': 'Stadium & Arena Guide',
    'press.title': 'Press Room',
    
    // Standings headings
    'table.pos': 'Pos',
    'table.team': 'Team',
    'table.played': 'Pld',
    'table.won': 'W',
    'table.drawn': 'D',
    'table.lost': 'L',
    'table.points': 'Pts',
    'table.diff': 'GD',
    
    // Admin & Fan Zone
    'fanzone.points': 'Blue Points',
    'fanzone.badges': 'Unlocked Badges',
    'fanzone.lineupBuilder': 'Build Your Lineup',
    'admin.dashboard': 'Admin Control Panel',
    'admin.liveMatchSim': 'Live Match Event Simulator'
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.matches': 'Matchs',
    'nav.news': 'Actualités',
    'nav.more': 'Plus',
    'nav.media': 'USM Media',
    'nav.fanzone': 'Zone Fans',
    'nav.club': 'Histoire',
    'nav.partners': 'Sponsors',
    'nav.catalog': 'Boutique',
    'nav.boutique': 'Boutique',
    'nav.contact': 'Contact',
    'nav.admin': 'Admin',
    'nav.nextMatch': 'Prochain Match',
    'nav.football': 'Football',
    'nav.basketball': 'Basketball',
    'nav.history': 'Histoire',
    'nav.palmares': 'Palmarès',
    'nav.legendes': 'Légendes',
    'nav.downloads': 'Téléchargements',
    'nav.stadium': 'Stade',
    
    // Header/Search/Buttons
    'btn.discover': 'Découvrir le Club',
    'btn.nextMatch': 'Détails du Match',
    'btn.allNews': 'Toutes les Actualités',
    'btn.readMore': 'Lire l\'Article',
    'btn.allStandings': 'Classement Complet',
    'btn.playerProfile': 'Profil du Joueur',
    'btn.becomePartner': 'Devenir Partenaire',
    'btn.inStore': 'Disponible en Boutique',
    'btn.submit': 'Soumettre',
    'search.placeholder': 'Rechercher joueurs, actualités...',
    
    // Live / Match center
    'match.live': 'EN DIRECT',
    'match.countdown': 'COMPTE À REBOURS',
    'match.presentedBy': 'Présenté par',
    'match.venue': 'Stade',
    'match.timeline': 'Chronologie du Match',
    'match.stats': 'Statistiques',
    'match.lineup': 'Compositions Attendues',
    'match.h2h': 'Face à Face',
    'match.prediction': 'Pronostiquer le score',
    'match.predictBtn': 'Pronostiquer',
    'match.votePlayer': 'Voter pour l\'homme du match',
    
    // USM Today
    'today.title': 'AUJOURD\'HUI À L\'USM',
    'today.training': 'Entraînement',
    'today.birthday': 'Anniversaire Joueur',
    'today.daysLeft': 'jours avant le match',
    'today.ranking': 'Classement en Ligue 1',
    'today.history': 'Ce Jour-là',
    'today.poll': 'Sondage du Jour',
    
    // Page Sections
    'home.heroTitle': 'Union Sportive Monastirienne',
    'home.heroSub': 'Une Ville. Un Cœur. Un Club.',
    'home.today': 'USM Aujourd\'hui',
    'home.news': 'Dernières Nouvelles',
    'home.spotlight': 'Focus Joueur',
    'home.spotlightSub': 'Joueur de la Semaine',
    'home.historyTitle': 'Palmarès & Héritage',
    'home.sponsorsTitle': 'Nos Partenaires',
    'home.storeTitle': 'Boutique Officielle',
    
    // Stadium
    'stadium.title': 'Guide Stade & Salle',
    'press.title': 'Espace Presse',
    
    // Standings headings
    'table.pos': 'Pos',
    'table.team': 'Équipe',
    'table.played': 'MJ',
    'table.won': 'G',
    'table.drawn': 'N',
    'table.lost': 'P',
    'table.points': 'Pts',
    'table.diff': 'Diff',
    
    // Admin & Fan Zone
    'fanzone.points': 'Points Bleus',
    'fanzone.badges': 'Badges Débloqués',
    'fanzone.lineupBuilder': 'Votre Composition',
    'admin.dashboard': 'Panneau de Contrôle Admin',
    'admin.liveMatchSim': 'Simulateur de Match en Direct'
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.matches': 'المباريات',
    'nav.news': 'الأخبار',
    'nav.more': 'المزيد',
    'nav.media': 'إعلام الاتحاد',
    'nav.fanzone': 'منطقة الأحباء',
    'nav.club': 'تاريخ النادي',
    'nav.partners': 'المستشهرون',
    'nav.catalog': 'المغازة',
    'nav.boutique': 'المغازة',
    'nav.contact': 'اتصل بنا',
    'nav.admin': 'لوحة التحكم',
    'nav.nextMatch': 'المباراة القادمة',
    'nav.football': 'كرة القدم',
    'nav.basketball': 'كرة السلة',
    'nav.history': 'تاريخنا',
    'nav.palmares': 'التتويجات',
    'nav.legendes': 'الأساطير',
    'nav.downloads': 'التنزيلات',
    'nav.stadium': 'دليل الملعب',
    
    // Header/Search/Buttons
    'btn.discover': 'اكتشف النادي',
    'btn.nextMatch': 'تفاصيل المباراة',
    'btn.allNews': 'كل الأخبار',
    'btn.readMore': 'اقرأ المزيد',
    'btn.allStandings': 'الترتيب الكامل',
    'btn.playerProfile': 'ملف اللاعب',
    'btn.becomePartner': 'كن شريكاً معنا',
    'btn.inStore': 'متوفر في المغازة',
    'btn.submit': 'إرسال',
    'search.placeholder': 'ابحث عن لاعبين، أخبار، مباريات...',
    
    // Live / Match center
    'match.live': 'مباشر',
    'match.countdown': 'العد التنازلي للمباراة',
    'match.presentedBy': 'مقدمة من طرف',
    'match.venue': 'الملعب',
    'match.timeline': 'أحداث المباراة',
    'match.stats': 'إحصائيات المباراة',
    'match.lineup': 'التشكيلة المتوقعة',
    'match.h2h': 'المواجهات المباشرة',
    'match.prediction': 'توقع نتيجة المباراة',
    'match.predictBtn': 'توقع النتيجة',
    'match.votePlayer': 'صوّت لأفضل لاعب في المباراة',
    
    // USM Today
    'today.title': 'اليوم في الاتحاد',
    'today.training': 'الحصة التدريبية اليوم',
    'today.birthday': 'عيد ميلاد لاعب',
    'today.daysLeft': 'أيام قبل المباراة القادمة',
    'today.ranking': 'الترتيب الحالي في الرابطة الأولى',
    'today.history': 'في مثل هذا اليوم',
    'today.poll': 'استطلاع أحباء الاتحاد اليومي',
    
    // Page Sections
    'home.heroTitle': 'الاتحاد الرياضي المنستيري',
    'home.heroSub': 'مدينة واحدة. قلب واحد. نادٍ واحد.',
    'home.today': 'الاتحاد اليوم',
    'home.news': 'آخر الأخبار',
    'home.spotlight': 'نجم الأسبوع',
    'home.spotlightSub': 'لاعب الأسبوع المميز',
    'home.historyTitle': 'الألقاب والتقاليد الموروثة',
    'home.sponsorsTitle': 'شركاء النجاح والمستشهرين',
    'home.storeTitle': 'البوتيك الرسمي للاتحاد',
    
    // Stadium
    'stadium.title': 'دليل الملعب والقاعة الرياضية',
    'press.title': 'الفضاء الصحفي',
    
    // Standings headings
    'table.pos': 'المركز',
    'table.team': 'الفريق',
    'table.played': 'لعب',
    'table.won': 'فاز',
    'table.drawn': 'تعادل',
    'table.lost': 'خسر',
    'table.points': 'نقاط',
    'table.diff': 'الفارق',
    
    // Admin & Fan Zone
    'fanzone.points': 'النقاط الزرقاء',
    'fanzone.badges': 'الشارات المفتوحة',
    'fanzone.lineupBuilder': 'صمم تشكيلة فريقك',
    'admin.dashboard': 'لوحة تحكم المشرفين للاتحاد',
    'admin.liveMatchSim': 'محاكي مباريات الاتحاد المباشرة'
  }
};

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('fr');
  const router = useRouter();
  const [activeScreen, setActiveScreenState] = useState<ActiveScreen>('home');

  const setActiveScreen = (screen: ActiveScreen) => {
    setActiveScreenState(screen);
    if (typeof window !== 'undefined') {
      // 'news' is backed by /actualites — /news is a redirect-only shim, so pushing
      // to it here would bounce straight back and fight the pathname sync effect
      // in AppLayout, causing an infinite /news <-> /actualites redirect loop.
      const path = screen === 'home' ? '/' : screen === 'news' ? '/actualites' : '/' + screen;
      const currentPath = window.location.pathname;
      const isCurrentSection = path === '/'
        ? currentPath === '/'
        : currentPath === path || currentPath.startsWith(`${path}/`);
      if (!isCurrentSection) {
        router.push(path);
      }
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Core Mock States that admins can edit
  const [matches, setMatches] = useState<Match[]>(matchesData);
  const [sponsors, setSponsors] = useState<Sponsor[]>(sponsorsList);
  const [products, setProducts] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [newsList, setNewsList] = useState<News[]>([]);
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>(mediaItems);
  const [mediaAlbums, setMediaAlbums] = useState<MediaAlbum[]>(mockMediaAlbums);
  const [mediaVideos, setMediaVideos] = useState<MediaVideo[]>(mockMediaVideos);
  const [mediaPhotos, setMediaPhotos] = useState<MediaPhoto[]>(mockMediaPhotos);
  const [mediaCategoriesState, setMediaCategoriesState] = useState<MediaCategory[]>(mediaCategories);
  const [mediaArchiveState, setMediaArchiveState] = useState<MediaArchive[]>(mockMediaArchive);
  const [mediaSettings, setMediaSettings] = useState<MediaSettings>(defaultMediaSettings);
  const [releases, setReleases] = useState<PressRelease[]>(pressReleases);
  const [accreditations, setAccreditations] = useState<AccreditationRequest[]>(accreditationRequests);
  const [notifications, setNotifications] = useState<AdminNotification[]>(adminNotifications);
  const [clubSettings, setClubSettings] = useState<ClubSettings>(defaultClubSettings);
  const [homepageSections, setHomepageSections] = useState<HomepageSection[]>(defaultHomepageSections);
  const [teamUsers, setTeamUsers] = useState<AdminTeamUser[]>(defaultTeamUsers);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);

  // Supporter States
  const [bluePoints, setBluePoints] = useState(150); // Initial welcome points
  const [predictions, setPredictions] = useState<{ [matchId: string]: string }>({});
  const [completedQuizzes, setCompletedQuizzes] = useState<string[]>([]);
  const [fanBadges, setFanBadges] = useState<string[]>(['Welcome Fan']);
  const [preferredLineup, setPreferredLineup] = useState<{ [position: string]: string }>({});
  const [reservations, setReservations] = useState<{ itemId: string; size: string; timestamp: Date }[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Site content — editable from Admin Dashboard
  const [boutiqueHeroImage, setBoutiqueHeroImageState] = useState('/brand/boutique-hero.png');

  // Auth States
  const [userRole, setUserRole] = useState<'guest' | 'supporter' | 'admin'>('guest');
  const [adminRole, setAdminRole] = useState<string>('USER');
  const [customPermissions, setCustomPermissions] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [fan, setFan] = useState<any | null>(null);

  // Cart and Order States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  // Toast State
  const [toast, setToastState] = useState({ message: '', type: 'success' as 'success' | 'info' | 'error', visible: false });

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastState({ message, type, visible: true });
  };

  const hideToast = () => {
    setToastState(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToastState(prev => ({ ...prev, visible: false }));
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast.visible, toast.message]);

  const addToCart = (product: CatalogItem, size: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.size === size);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, size, quantity: 1 }];
    });
    setIsCartOpen(true);
    showToast(`${product.name} (${size}) ajouté au panier !`, 'success');
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.size === size)));
  };

  const updateCartQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCart(prev => prev.map(item => 
      item.product.id === productId && item.size === size
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => setCart([]);

  const placeOrder = (clientName: string, phone: string, city: string) => {
    if (cart.length === 0) return;
    const totalSum = cart.reduce((sum, item) => {
      const priceNum = parseFloat(item.product.price.replace(/[^\d.]/g, '')) || 0;
      return sum + (priceNum * item.quantity);
    }, 0);

    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 8999 + 1000)}`,
      clientName,
      phone,
      city,
      items: [...cart],
      total: totalSum,
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    showToast('Commande passée avec succès !', 'success');
  };

  const updateOrderStatus = (orderId: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status } : order));
    logActivity(`Marked order as ${status}`, orderId);
  };

  const setBoutiqueHeroImage = (url: string) => {
    setBoutiqueHeroImageState(url);
    logActivity('Updated boutique hero banner', url);
  };

  const normalizedRole = (adminRole || fan?.role || '').toUpperCase().replace(/[\s_]+/g, '_');
  const isSuperAdmin =
    isLoggedIn &&
    (normalizedRole === 'SUPER_ADMIN' ||
      adminRole === 'Super Admin' ||
      fan?.role === 'SUPER_ADMIN' ||
      fan?.role === 'Super Admin');

  const isOrderManager = isLoggedIn && normalizedRole === 'GESTIONNAIRE_COMMANDES';

  const hasPermission = (permission: string): boolean => {
    if (!isLoggedIn) return false;
    if (isSuperAdmin) return true;
    if (normalizedRole === 'ADMIN') {
      // Normal admin has everything EXCEPT administrator management and system audit logs
      if (permission.startsWith('admins.') || permission.startsWith('security.')) {
        return false;
      }
      return true;
    }
    if (normalizedRole === 'GESTIONNAIRE_COMMANDES') {
      return (
        permission.startsWith('orders.') ||
        permission === 'discount_codes.view'
      );
    }
    return customPermissions.includes(permission);
  };

  const refreshMe = async () => {
    try {
      const data = await api.getMe();
      if (data && (data._id || data.id || data.email)) {
        setFan(data);
        setIsLoggedIn(true);
        setUsername(data.displayName || data.firstName || data.name || data.email);
        const resolvedRole = data.role || 'USER';
        setAdminRole(resolvedRole);
        setCustomPermissions(data.customPermissions && data.customPermissions.length > 0 ? data.customPermissions : []);
        setUserRole(
          resolvedRole && resolvedRole !== 'USER' && resolvedRole !== 'Customer' && resolvedRole !== 'Fan'
            ? 'admin'
            : 'supporter'
        );
        return data;
      } else {
        setFan(null);
        setIsLoggedIn(false);
        setUsername('');
        setAdminRole('USER');
        setCustomPermissions([]);
        setUserRole('guest');
        return null;
      }
    } catch {
      setFan(null);
      setIsLoggedIn(false);
      setUsername('');
      setAdminRole('USER');
      setCustomPermissions([]);
      setUserRole('guest');
      return null;
    }
  };

  const loginFan = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    await refreshMe();
    return res;
  };

  const logoutFan = async () => {
    await api.logout();
    setFan(null);
    setIsLoggedIn(false);
    setUsername('');
    setAdminRole('USER');
    setCustomPermissions([]);
    setUserRole('guest');
    router.push('/');
  };

  const logout = () => {
    logoutFan();
  };

  // Load Initial states
  useEffect(() => {
    refreshMe();
    // Load local storage preferences if browser environments exist
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('usm-lang') as Language;
      if (savedLang) {
        setLanguageState(savedLang);
        document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
      } else {
        document.documentElement.dir = 'ltr';
      }
    }
  }, []);

  // Sync wishlist from backend once a fan session is confirmed
  useEffect(() => {
    if (isLoggedIn) {
      api.getMyWishlist()
        .then((items: any[]) => setWishlist((items || []).map((i: any) => i.productId)))
        .catch(() => {});
    } else {
      setWishlist([]);
    }
  }, [isLoggedIn]);

  // Fetch published news from backend API on mount (used by Home + Newsroom public pages)
  useEffect(() => {
    api.getNews({ limit: 50 })
      .then((data: any) => {
        if (data && Array.isArray(data.news)) {
          // Map MongoDB _id to id so existing public pages work without changes
          setNewsList(data.news.map((n: any) => ({ ...n, id: n._id })));
        }
      })
      .catch(() => {
        // Silently fall back to empty list — AdminNews.tsx uses its own fetch
        setNewsList([]);
      });
  }, []);

  // Fetch products & categories from backend API on mount
  useEffect(() => {
    Promise.allSettled([api.getProducts(), api.getCategories()])
      .then(([productsRes, categoriesRes]) => {
        if (productsRes.status === 'fulfilled') {
          const raw = productsRes.value;
          const list = Array.isArray(raw?.products) ? raw.products : Array.isArray(raw) ? raw : [];
          setProducts(list.map(mapApiProductToCatalogItem));
        }
        if (categoriesRes.status === 'fulfilled') {
          const raw = categoriesRes.value;
          const list = Array.isArray(raw) ? raw : [];
          setCategories(list.map(mapApiCategory));
        }
      })
      .catch(() => {
        setProducts([]);
        setCategories([]);
      });
  }, []);

  // Fetch club settings (social links, contact info) from backend API on mount
  useEffect(() => {
    api.getClubSettings()
      .then((data: any) => {
        if (data) {
          setClubSettings({
            clubName: data.clubName || defaultClubSettings.clubName,
            logoUrl: data.logoUrl || defaultClubSettings.logoUrl,
            contactEmail: data.contactEmail || defaultClubSettings.contactEmail,
            contactPhone: data.contactPhone || defaultClubSettings.contactPhone,
            address: data.address || defaultClubSettings.address,
            facebook: data.facebook || defaultClubSettings.facebook,
            instagram: data.instagram || defaultClubSettings.instagram,
            youtube: data.youtube || defaultClubSettings.youtube,
            twitter: data.twitter || defaultClubSettings.twitter,
            tiktok: data.tiktok || defaultClubSettings.tiktok,
          });
        }
      })
      .catch(() => {});
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('usm-lang', lang);
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  };

  // Live Match Modifiers (Admin Tool hooks)
  const updateMatchScore = (matchId: string, team: 'home' | 'away', amount: number) => {
    setMatches(prevMatches => 
      prevMatches.map(m => {
        if (m.id === matchId) {
          const nextScore = { ...m.score };
          nextScore[team] = Math.max(0, nextScore[team] + amount);
          return { ...m, score: nextScore };
        }
        return m;
      })
    );
  };

  const addMatchEvent = (matchId: string, event: Omit<MatchEvent, 'id'>) => {
    const newEvent: MatchEvent = {
      ...event,
      id: `e-${Date.now()}`
    };
    
    setMatches(prevMatches => 
      prevMatches.map(m => {
        if (m.id === matchId) {
          return {
            ...m,
            timeline: [newEvent, ...m.timeline] // display newest first in listing
          };
        }
        return m;
      })
    );
  };

  const updateMatchStatus = (matchId: string, status: 'upcoming' | 'live' | 'finished') => {
    setMatches(prevMatches => 
      prevMatches.map(m => {
        if (m.id === matchId) {
          return { ...m, status };
        }
        return m;
      })
    );
  };

  // Supporters methods
  const addBluePoints = (amount: number) => {
    setBluePoints(prev => prev + amount);
  };

  const submitPrediction = (matchId: string, prediction: string) => {
    setPredictions(prev => ({ ...prev, [matchId]: prediction }));
    addBluePoints(50); // reward prediction participation
  };

  const completeQuiz = (quizId: string) => {
    if (!completedQuizzes.includes(quizId)) {
      setCompletedQuizzes(prev => [...prev, quizId]);
      addBluePoints(100); // reward quiz completion
      
      if (completedQuizzes.length + 1 === 3) {
        unlockBadge('Quiz Master');
      }
    }
  };

  const unlockBadge = (badge: string) => {
    if (!fanBadges.includes(badge)) {
      setFanBadges(prev => [...prev, badge]);
      addBluePoints(200); // reward badge unlock
    }
  };

  const savePreferredLineup = (lineup: { [position: string]: string }) => {
    setPreferredLineup(lineup);
    addBluePoints(75);
    unlockBadge('Squad Builder');
  };

  const addReservation = (itemId: string, size: string) => {
    setReservations(prev => [...prev, { itemId, size, timestamp: new Date() }]);
    addBluePoints(30);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const has = prev.includes(productId);
      if (isLoggedIn) {
        if (has) {
          api.removeFromWishlist(productId).catch(() => {});
        } else {
          api.addToWishlist(productId).catch(() => {});
        }
      }
      return has ? prev.filter(id => id !== productId) : [...prev, productId];
    });
  };

  // Sponsor metrics click simulation
  const simulateSponsorClick = (sponsorId: string) => {
    setSponsors(prevSponsors => 
      prevSponsors.map(s => {
        if (s.id === sponsorId) {
          const clicks = s.metrics.clicks + 1;
          const impressions = s.metrics.impressions + Math.floor(Math.random() * 5 + 1);
          return {
            ...s,
            metrics: {
              impressions,
              clicks,
              ctr: parseFloat(((clicks / impressions) * 100).toFixed(2))
            }
          };
        }
        return s;
      })
    );
  };

  // Audit log
  const logActivity = (action: string, entity: string) => {
    setAuditLog(prev => [
      { id: `log-${Date.now()}`, actor: username || 'USM Administrator', action, entity, timestamp: new Date().toISOString() },
      ...prev
    ].slice(0, 50));
  };

  // Sponsors — admin CRUD
  const addSponsor = (sponsor: Sponsor) => {
    setSponsors(prev => [sponsor, ...prev]);
    logActivity('Created sponsor', sponsor.name);
  };
  const updateSponsor = (id: string, updates: Partial<Sponsor>) => {
    setSponsors(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    logActivity('Updated sponsor', updates.name ?? id);
  };
  const deleteSponsor = (id: string) => {
    setSponsors(prev => prev.filter(s => s.id !== id));
    logActivity('Removed sponsor', id);
  };

  // Boutique products — admin CRUD
  const addProduct = (product: CatalogItem) => {
    setProducts(prev => [product, ...prev]);
    logActivity('Added product', product.name);
  };
  const updateProduct = (id: string, updates: Partial<CatalogItem>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    logActivity('Updated product', updates.name ?? id);
  };
  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    logActivity('Deleted product', id);
  };

  // Newsroom — admin CRUD (proxied through real API; local state updated for immediate UI feedback)
  const addNewsArticle = async (article: News) => {
    try {
      const created = await api.createNews(article as any);
      setNewsList(prev => [{ ...created, id: created._id }, ...prev]);
      logActivity('Published article', article.title);
    } catch {
      setNewsList(prev => [article, ...prev]);
    }
  };
  const updateNewsArticle = async (id: string, updates: Partial<News>) => {
    try {
      const updated = await api.updateNews(id, updates as any);
      setNewsList(prev => prev.map(n => (n.id === id ? { ...n, ...updated, id } : n)));
      logActivity('Updated article', updates.title ?? id);
    } catch {
      setNewsList(prev => prev.map(n => (n.id === id ? { ...n, ...updates } : n)));
    }
  };
  const deleteNewsArticle = async (id: string) => {
    try {
      await api.deleteNews(id);
    } catch { /* ignore */ }
    setNewsList(prev => prev.filter(n => n.id !== id));
    logActivity('Deleted article', id);
  };

  // Match roster — admin create/delete
  const addMatch = (match: Match) => {
    setMatches(prev => [match, ...prev]);
    logActivity('Scheduled match', `${match.homeTeam} vs ${match.awayTeam}`);
  };
  const deleteMatch = (matchId: string) => {
    setMatches(prev => prev.filter(m => m.id !== matchId));
    logActivity('Deleted match', matchId);
  };

  // Media library — admin CRUD
  const addMediaItem = (item: MediaItem) => {
    setMediaLibrary(prev => [item, ...prev]);
    logActivity('Uploaded media', item.caption);
  };
  const deleteMediaItem = (id: string) => {
    setMediaLibrary(prev => prev.filter(m => m.id !== id));
    logActivity('Deleted media', id);
  };

  const addMediaAlbum = (album: MediaAlbum) => {
    setMediaAlbums(prev => [album, ...prev]);
    logActivity('Created Media Album', album.title);
  };
  const updateMediaAlbum = (id: string, updates: Partial<MediaAlbum>) => {
    setMediaAlbums(prev => prev.map(a => (a.id === id ? { ...a, ...updates } : a)));
    logActivity('Updated Media Album', updates.title ?? id);
  };
  const deleteMediaAlbum = (id: string) => {
    setMediaAlbums(prev => prev.filter(a => a.id !== id));
    logActivity('Deleted Media Album', id);
  };

  const addMediaVideo = (video: MediaVideo) => {
    setMediaVideos(prev => [video, ...prev]);
    logActivity('Added Media Video', video.title);
  };
  const updateMediaVideo = (id: string, updates: Partial<MediaVideo>) => {
    setMediaVideos(prev => prev.map(v => (v.id === id ? { ...v, ...updates } : v)));
    logActivity('Updated Media Video', updates.title ?? id);
  };
  const deleteMediaVideo = (id: string) => {
    setMediaVideos(prev => prev.filter(v => v.id !== id));
    logActivity('Deleted Media Video', id);
  };

  const addMediaPhoto = (photo: MediaPhoto) => {
    setMediaPhotos(prev => [photo, ...prev]);
    if (photo.albumId) {
      setMediaAlbums(prev => prev.map(a => {
        if (a.id === photo.albumId) {
          const exists = a.photos.some(p => p.id === photo.id);
          const updatedPhotos = exists ? a.photos.map(p => p.id === photo.id ? photo : p) : [...a.photos, photo];
          return { ...a, photos: updatedPhotos };
        }
        return a;
      }));
    }
    logActivity('Uploaded Photo', photo.caption);
  };
  const updateMediaPhoto = (id: string, updates: Partial<MediaPhoto>) => {
    setMediaPhotos(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    setMediaAlbums(prev => prev.map(a => ({
      ...a,
      photos: a.photos.map(p => (p.id === id ? { ...p, ...updates } : p))
    })));
    logActivity('Updated Photo Metadata', id);
  };
  const deleteMediaPhoto = (id: string) => {
    setMediaPhotos(prev => prev.filter(p => p.id !== id));
    setMediaAlbums(prev => prev.map(a => ({
      ...a,
      photos: a.photos.filter(p => p.id !== id)
    })));
    logActivity('Deleted Photo', id);
  };
  const bulkUpdatePhotos = (updatedPhotos: MediaPhoto[]) => {
    setMediaPhotos(prev => {
      const map = new Map(updatedPhotos.map(p => [p.id, p]));
      return prev.map(p => map.get(p.id) || p);
    });
    setMediaAlbums(prev => prev.map(a => {
      const photoMap = new Map(updatedPhotos.filter(p => p.albumId === a.id).map(p => [p.id, p]));
      if (photoMap.size === 0) return a;
      return {
        ...a,
        photos: a.photos.map(p => photoMap.get(p.id) || p).sort((x, y) => x.displayOrder - y.displayOrder)
      };
    }));
    logActivity('Bulk Updated Photos', `${updatedPhotos.length} photos`);
  };

  const addMediaCategory = (category: MediaCategory) => {
    setMediaCategoriesState(prev => [...prev, category].sort((x, y) => x.displayOrder - y.displayOrder));
    logActivity('Created Media Category', category.name);
  };
  const updateMediaCategory = (id: string, updates: Partial<MediaCategory>) => {
    setMediaCategoriesState(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)).sort((x, y) => x.displayOrder - y.displayOrder));
    logActivity('Updated Media Category', updates.name ?? id);
  };
  const deleteMediaCategory = (id: string) => {
    setMediaCategoriesState(prev => prev.filter(c => c.id !== id));
    logActivity('Deleted Media Category', id);
  };

  const addMediaArchive = (archive: MediaArchive) => {
    setMediaArchiveState(prev => [archive, ...prev]);
    logActivity('Created Media Archive Entry', archive.title);
  };
  const updateMediaArchive = (id: string, updates: Partial<MediaArchive>) => {
    setMediaArchiveState(prev => prev.map(a => (a.id === id ? { ...a, ...updates } : a)));
    logActivity('Updated Media Archive Entry', updates.title ?? id);
  };
  const deleteMediaArchive = (id: string) => {
    setMediaArchiveState(prev => prev.filter(a => a.id !== id));
    logActivity('Deleted Media Archive Entry', id);
  };

  const updateMediaSettings = (updates: Partial<MediaSettings>) => {
    setMediaSettings(prev => ({ ...prev, ...updates }));
    logActivity('Updated Media Settings', 'General Settings');
  };

  // Press Center — admin CRUD
  const addPressRelease = (release: PressRelease) => {
    setReleases(prev => [release, ...prev]);
    logActivity('Published press release', release.title);
  };
  const updatePressRelease = (id: string, updates: Partial<PressRelease>) => {
    setReleases(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
    logActivity('Updated press release', updates.title ?? id);
  };
  const deletePressRelease = (id: string) => {
    setReleases(prev => prev.filter(r => r.id !== id));
    logActivity('Deleted press release', id);
  };
  const updateAccreditationStatus = (id: string, status: AccreditationRequest['status'], notes?: string) => {
    setAccreditations(prev =>
      prev.map(a => (a.id === id ? { ...a, status, notes: notes ?? a.notes } : a))
    );
    logActivity(`Marked accreditation request as ${status}`, id);
  };

  // Notifications — admin send
  const sendNotification = (notification: AdminNotification) => {
    setNotifications(prev => [notification, ...prev]);
    logActivity('Sent notification', notification.title);

    // Broadcast via localStorage for cross-tab notification delivery
    if (typeof window !== 'undefined') {
      localStorage.setItem('usm_broadcast_notification', JSON.stringify({
        title: notification.title,
        message: notification.message,
        timestamp: Date.now()
      }));
    }
  };

  // Club settings — admin update
  const updateClubSettings = (updates: Partial<ClubSettings>) => {
    setClubSettings(prev => ({ ...prev, ...updates }));
    logActivity('Updated club settings', 'General');
  };

  // Homepage sections — admin toggle, consumed by Home.tsx
  const toggleHomepageSection = (key: string) => {
    setHomepageSections(prev => prev.map(s => (s.key === key ? { ...s, visible: !s.visible } : s)));
    logActivity('Toggled homepage section', key);
  };
  const isSectionVisible = (key: string) => homepageSections.find(s => s.key === key)?.visible !== false;

  // Team / users — admin CRUD (reference list, no real backend auth)
  const addTeamUser = (user: AdminTeamUser) => {
    setTeamUsers(prev => [user, ...prev]);
    logActivity('Added team member', user.name);
  };
  const updateTeamUser = (id: string, updates: Partial<AdminTeamUser>) => {
    setTeamUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));
    logActivity('Updated team member', updates.name ?? id);
  };
  const deleteTeamUser = (id: string) => {
    setTeamUsers(prev => prev.filter(u => u.id !== id));
    logActivity('Removed team member', id);
  };

  // Translate helper function
  const t = (key: string): string => {
    const text = translations[language]?.[key] || translations['en']?.[key] || key;
    return text;
  };

  return (
    <AppContext.Provider value={{
      language,
      setLanguage,
      activeScreen,
      setActiveScreen,
      searchQuery,
      setSearchQuery,
      isSearchOpen,
      setIsSearchOpen,
      matches,
      updateMatchScore,
      addMatchEvent,
      updateMatchStatus,
      bluePoints,
      addBluePoints,
      predictions,
      submitPrediction,
      completedQuizzes,
      completeQuiz,
      fanBadges,
      unlockBadge,
      preferredLineup,
      savePreferredLineup,
      sponsors,
      simulateSponsorClick,
      addSponsor,
      updateSponsor,
      deleteSponsor,
      products,
      categories,
      addProduct,
      updateProduct,
      deleteProduct,
      newsList,
      addNewsArticle,
      updateNewsArticle,
      deleteNewsArticle,
      addMatch,
      deleteMatch,
      mediaLibrary,
      addMediaItem,
      deleteMediaItem,
      mediaAlbums,
      mediaVideos,
      mediaPhotos,
      mediaCategories: mediaCategoriesState,
      mediaArchive: mediaArchiveState,
      mediaSettings,
      addMediaAlbum,
      updateMediaAlbum,
      deleteMediaAlbum,
      addMediaVideo,
      updateMediaVideo,
      deleteMediaVideo,
      addMediaPhoto,
      updateMediaPhoto,
      deleteMediaPhoto,
      bulkUpdatePhotos,
      addMediaCategory,
      updateMediaCategory,
      deleteMediaCategory,
      addMediaArchive,
      updateMediaArchive,
      deleteMediaArchive,
      updateMediaSettings,
      releases,
      addPressRelease,
      updatePressRelease,
      deletePressRelease,
      accreditations,
      updateAccreditationStatus,
      notifications,
      sendNotification,
      clubSettings,
      updateClubSettings,
      homepageSections,
      toggleHomepageSection,
      isSectionVisible,
      teamUsers,
      addTeamUser,
      updateTeamUser,
      deleteTeamUser,
      auditLog,
      logActivity,
      reservations,
      addReservation,
      wishlist,
      toggleWishlist,
      boutiqueHeroImage,
      setBoutiqueHeroImage,
      t,
      userRole,
      adminRole,
      customPermissions,
      isSuperAdmin,
      isOrderManager,
      hasPermission,
      isLoggedIn,
      username,
      logout,
      fan,
      refreshMe,
      loginFan,
      logoutFan,
      cart,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      orders,
      placeOrder,
      updateOrderStatus,
      toast,
      showToast,
      hideToast
    }}>
      <div className="dark text-usm-blue-dark usm-premium-bg min-h-screen font-sans">
        {children}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
