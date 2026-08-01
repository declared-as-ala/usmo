export interface MediaPhoto {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  caption: string;
  altText: string;
  albumId?: string;
  category: string;
  sport: 'football' | 'basketball' | 'club' | 'academy' | 'fans';
  season: string;
  photographer: string;
  date: string;
  downloadEnabled: boolean;
  displayOrder: number;
  status: 'draft' | 'published' | 'archived';
  views: number;
  downloads: number;
}

export interface MediaAlbum {
  id: string;
  title: string;
  titleFr: string;
  titleAr: string;
  slug: string;
  description: string;
  descriptionFr: string;
  descriptionAr: string;
  coverImage: string;
  category: string;
  sport: 'football' | 'basketball' | 'club' | 'academy' | 'fans';
  season: string;
  relatedMatch?: string;
  relatedPlayers?: string[];
  relatedArticle?: string;
  photographer: string;
  date: string;
  location: string;
  locationAr?: string;
  tags: string[];
  photos: MediaPhoto[];
  views: number;
  isFeatured: boolean;
  downloadsEnabled: boolean;
  status: 'draft' | 'published' | 'archived';
  seoTitle?: string;
  seoDescription?: string;
}

export interface MediaVideo {
  id: string;
  title: string;
  titleFr: string;
  titleAr: string;
  slug: string;
  description: string;
  descriptionFr: string;
  descriptionAr: string;
  thumbnail: string;
  sourceType: 'youtube' | 'facebook' | 'uploaded' | 'external';
  videoUrl: string;
  duration: string;
  category: string;
  sport: 'football' | 'basketball' | 'club' | 'academy' | 'fans';
  season: string;
  relatedMatch?: string;
  relatedPlayers?: string[];
  relatedAlbum?: string;
  sponsor?: { name: string; logo?: string };
  tags: string[];
  views: number;
  isFeatured: boolean;
  status: 'draft' | 'published' | 'archived';
  seoTitle?: string;
  seoDescription?: string;
  date: string;
}

export interface MediaCategory {
  id: string;
  name: string;
  nameFr: string;
  nameAr: string;
  slug: string;
  icon: string;
  description: string;
  coverImage: string;
  displayOrder: number;
  active: boolean;
}

export interface MediaTag {
  name: string;
  slug: string;
  usageCount: number;
}

export interface Photographer {
  id: string;
  name: string;
  avatar?: string;
  role: string;
}

export interface MediaArchive {
  id: string;
  year: string;
  season: string;
  title: string;
  titleFr: string;
  titleAr: string;
  description: string;
  descriptionFr: string;
  descriptionAr: string;
  photoCount: number;
  videoCount: number;
  coverImage: string;
  notes?: string;
  status: 'draft' | 'published' | 'archived';
}

export interface MediaSettings {
  allowPublicDownloads: boolean;
  defaultDownloadPermission: boolean;
  maxPhotoUploadSize: number; // in MB
  maxVideoUploadSize: number; // in MB
  allowedFileTypes: string[];
  autoImageOptimization: boolean;
  watermarkOption: boolean;
  defaultPhotographer: string;
  defaultSeason: string;
  defaultMediaStatus: 'draft' | 'published';
  showViewsPublicly: boolean;
  showDatesPublicly: boolean;
  enableVideoModal: boolean;
  enableRelatedMedia: boolean;
}

// ----------------------------------------------------
// INITIAL RICH MOCK DATA
// ----------------------------------------------------

export const defaultMediaSettings: MediaSettings = {
  allowPublicDownloads: true,
  defaultDownloadPermission: true,
  maxPhotoUploadSize: 10,
  maxVideoUploadSize: 100,
  allowedFileTypes: ['.jpg', '.jpeg', '.png', '.webp', '.mp4'],
  autoImageOptimization: true,
  watermarkOption: true,
  defaultPhotographer: 'USM Media Team',
  defaultSeason: '2025/26',
  defaultMediaStatus: 'published',
  showViewsPublicly: true,
  showDatesPublicly: true,
  enableVideoModal: true,
  enableRelatedMedia: true,
};

export const mediaCategories: MediaCategory[] = [
  { id: 'cat1', name: 'Football', nameFr: 'Football', nameAr: 'كرة القدم', slug: 'football', icon: '⚽', description: 'Match action, squads, and tactical updates.', coverImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=400&q=80', displayOrder: 1, active: true },
  { id: 'cat2', name: 'Basketball', nameFr: 'Basketball', nameAr: 'كرة السلة', slug: 'basketball', icon: '🏀', description: 'BAL Champions league highlights and domestic games.', coverImage: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&w=400&q=80', displayOrder: 2, active: true },
  { id: 'cat3', name: 'Matchday', nameFr: 'Matchday', nameAr: 'أيام المباريات', slug: 'matchday', icon: '🏟️', description: 'Stadium atmosphere, arrivals, and matches.', coverImage: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=400&q=80', displayOrder: 3, active: true },
  { id: 'cat4', name: 'Training', nameFr: 'Entraînements', nameAr: 'التمارين', slug: 'training', icon: '🏃‍♂️', description: 'Behind the scenes drills and physical workouts.', coverImage: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=400&q=80', displayOrder: 4, active: true },
  { id: 'cat5', name: 'Behind the scenes', nameFr: 'Coulisses', nameAr: 'الكواليس', slug: 'behind-the-scenes', icon: '🎬', description: 'Inside locker rooms and travel diaries.', coverImage: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=400&q=80', displayOrder: 5, active: true },
  { id: 'cat6', name: 'Supporters', nameFr: 'Supporters', nameAr: 'الأحباء', slug: 'supporters', icon: '🗣️', description: 'Chants, flags, and ultras choreographies.', coverImage: '/fans.png', displayOrder: 6, active: true },
  { id: 'cat7', name: 'Press conferences', nameFr: 'Conférences', nameAr: 'المؤتمرات الصحفية', slug: 'press-conferences', icon: '🎙️', description: 'Coach comments, post-match briefings, declarations.', coverImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80', displayOrder: 7, active: true },
  { id: 'cat8', name: 'Interviews', nameFr: 'Interviews', nameAr: 'حوارات', slug: 'interviews', icon: '🎤', description: 'Exclusive talks with players and management.', coverImage: 'https://images.unsplash.com/photo-1489985548304-9b8192760145?auto=format&fit=crop&w=400&q=80', displayOrder: 8, active: true },
  { id: 'cat9', name: 'Academy', nameFr: 'Académie', nameAr: 'الأكاديمية', slug: 'academy', icon: '🎓', description: 'Youth squad matches, trials, and future stars.', coverImage: 'https://images.unsplash.com/photo-1522778034537-20a2486be803?auto=format&fit=crop&w=400&q=80', displayOrder: 9, active: true },
  { id: 'cat10', name: 'Palmarès', nameFr: 'Palmarès', nameAr: 'تتويجات النادي', slug: 'palmares', icon: '🏆', description: 'Historic championship runs and trophy showcases.', coverImage: 'https://images.unsplash.com/photo-1505666287802-931dc83948e9?auto=format&fit=crop&w=400&q=80', displayOrder: 10, active: true },
  { id: 'cat11', name: 'Historical archive', nameFr: 'Historique', nameAr: 'أرشيف تاريخي', slug: 'historical-archive', icon: '📜', description: 'Vintage records, retro jerseys, and legendary squads.', coverImage: 'https://images.unsplash.com/photo-1529254479751-faeedc59e78f?auto=format&fit=crop&w=400&q=80', displayOrder: 11, active: true },
];

export const mockPhotographers: Photographer[] = [
  { id: 'pht1', name: 'Karim Jbeli', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80', role: 'Official Club Photographer' },
  { id: 'pht2', name: 'Sophie Martin', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', role: 'Boutique Media Specialist' },
  { id: 'pht3', name: 'USM Media Team', role: 'Communication Office' },
];

export const mockMediaPhotos: MediaPhoto[] = [
  // Album 1 (USM vs ES Tunis) photos
  { id: 'ph1', imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80', thumbnailUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=400&q=80', caption: 'Derby kickoff at Ben Jannet Stadium', altText: 'Match kickoff', category: 'Matchday', sport: 'football', season: '2025/26', photographer: 'Karim Jbeli', date: '2026-07-12', downloadEnabled: true, displayOrder: 1, status: 'published', views: 320, downloads: 45 },
  { id: 'ph2', imageUrl: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&w=1200&q=80', thumbnailUrl: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&w=400&q=80', caption: 'Sadok Yeddes makes a spectacular reflex save', altText: 'Goalkeeper save', category: 'Matchday', sport: 'football', season: '2025/26', photographer: 'Karim Jbeli', date: '2026-07-12', downloadEnabled: true, displayOrder: 2, status: 'published', views: 480, downloads: 92 },
  { id: 'ph3', imageUrl: 'https://images.unsplash.com/photo-1489985548304-9b8192760145?auto=format&fit=crop&w=1200&q=80', thumbnailUrl: 'https://images.unsplash.com/photo-1489985548304-9b8192760145?auto=format&fit=crop&w=400&q=80', caption: 'Adem Alimi celebrates the opening goal', altText: 'Goal celebration', category: 'Matchday', sport: 'football', season: '2025/26', photographer: 'Karim Jbeli', date: '2026-07-12', downloadEnabled: true, displayOrder: 3, status: 'published', views: 610, downloads: 140 },
  { id: 'ph4', imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80', thumbnailUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80', caption: 'Riot of blue flares in the Curva Sud', altText: 'Flared fans', category: 'Supporters', sport: 'fans', season: '2025/26', photographer: 'Karim Jbeli', date: '2026-07-12', downloadEnabled: true, displayOrder: 4, status: 'published', views: 800, downloads: 220 },
  
  // Album 2 (Training session) photos
  { id: 'ph5', imageUrl: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a27?auto=format&fit=crop&w=1200&q=80', thumbnailUrl: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a27?auto=format&fit=crop&w=400&q=80', caption: 'Tactical analysis whiteboard briefing', altText: 'Tactics board', category: 'Training', sport: 'football', season: '2025/26', photographer: 'USM Media Team', date: '2026-07-07', downloadEnabled: true, displayOrder: 1, status: 'published', views: 150, downloads: 10 },
  { id: 'ph6', imageUrl: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1200&q=80', thumbnailUrl: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=400&q=80', caption: 'Sprint drill acceleration exercises', altText: 'Sprint training', category: 'Training', sport: 'football', season: '2025/26', photographer: 'USM Media Team', date: '2026-07-07', downloadEnabled: true, displayOrder: 2, status: 'published', views: 240, downloads: 15 },
  
  // Album 3 (Supporters at stadium) photos
  { id: 'ph7', imageUrl: '/fans.png', thumbnailUrl: '/fans.png', caption: 'Supporters packed Curva Sud cheering before kickoff', altText: 'Curva sud stadium banner', category: 'Supporters', sport: 'fans', season: '2025/26', photographer: 'Karim Jbeli', date: '2026-05-04', downloadEnabled: true, displayOrder: 1, status: 'published', views: 1100, downloads: 350 },
  
  // Album 4 (Basketball Highlights) photos
  { id: 'ph8', imageUrl: 'https://images.unsplash.com/photo-1505666287802-931dc83948e9?auto=format&fit=crop&w=1200&q=80', thumbnailUrl: 'https://images.unsplash.com/photo-1505666287802-931dc83948e9?auto=format&fit=crop&w=400&q=80', caption: 'Radhouane Slimane scores clutch mid-range jumper', altText: 'Basketball shot', category: 'Basketball', sport: 'basketball', season: '2025/26', photographer: 'Sophie Martin', date: '2026-07-07', downloadEnabled: true, displayOrder: 1, status: 'published', views: 340, downloads: 20 },
  { id: 'ph9', imageUrl: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&w=1200&q=80', thumbnailUrl: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&w=400&q=80', caption: 'Firas Lahyani monsters a transition alley-oop dunk', altText: 'Lahyani Slam Dunk', category: 'Basketball', sport: 'basketball', season: '2025/26', photographer: 'Sophie Martin', date: '2026-07-07', downloadEnabled: true, displayOrder: 2, status: 'published', views: 560, downloads: 70 },
  
  // Album 5 (Coulisses Matchday) photos
  { id: 'ph10', imageUrl: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=80', thumbnailUrl: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=400&q=80', caption: 'Player kits neatly aligned in locker room', altText: 'Locker room setup', category: 'Behind the scenes', sport: 'football', season: '2025/26', photographer: 'USM Media Team', date: '2026-07-06', downloadEnabled: false, displayOrder: 1, status: 'published', views: 290, downloads: 0 },
  
  // Album 6 (Académie) photos
  { id: 'ph11', imageUrl: 'https://images.unsplash.com/photo-1522778034537-20a2486be803?auto=format&fit=crop&w=1200&q=80', thumbnailUrl: 'https://images.unsplash.com/photo-1522778034537-20a2486be803?auto=format&fit=crop&w=400&q=80', caption: 'U15 squad listening to coach instruction', altText: 'Youth squad tactics', category: 'Academy', sport: 'academy', season: '2025/26', photographer: 'USM Media Team', date: '2026-07-03', downloadEnabled: true, displayOrder: 1, status: 'published', views: 180, downloads: 8 },
];

export const mockMediaAlbums: MediaAlbum[] = [
  {
    id: 'alb1',
    title: 'USM vs ES Tunis',
    titleFr: 'USM vs ES Tunis',
    titleAr: 'الاتحاد ضد الترجي الرياضي',
    slug: 'usm-vs-es-tunis',
    description: 'Relive the high-intensity Tunisian Ligue 1 derby match at Ben Jannet. Highlights of the goals, saves, and fans choreography.',
    descriptionFr: 'Revivez le derby palpitant de la Ligue 1 tunisienne au stade Ben Jannet. Retours en images sur les buts, arrêts et tifo.',
    descriptionAr: 'أبرز لقطات دربي الرابطة المحترفة الأولى المثير ضد الترجي في ملعب مصطفى بن جنات. احتفالات الأهداف وتيفو الجماهير.',
    coverImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
    category: 'Matchday',
    sport: 'football',
    season: '2025/26',
    relatedMatch: 'm1',
    relatedPlayers: ['f1', 'f4'],
    relatedArticle: 'n1',
    photographer: 'Karim Jbeli',
    date: '2026-07-12',
    location: 'Mustapha Ben Jannet Stadium, Monastir',
    locationAr: 'ملعب مصطفى بن جنات، المنستير',
    tags: ['Derby', 'Ligue1', 'Esperance', 'Goals'],
    photos: [mockMediaPhotos[0], mockMediaPhotos[1], mockMediaPhotos[2], mockMediaPhotos[3]],
    views: 12400,
    isFeatured: true,
    downloadsEnabled: true,
    status: 'published',
  },
  {
    id: 'alb2',
    title: 'Entraînement équipe première',
    titleFr: 'Entraînement équipe première',
    titleAr: 'تمارين الفريق الأول',
    slug: 'entrainement-equipe-premiere',
    description: 'First team tactical and athletic training sessions ahead of the upcoming league fixtures.',
    descriptionFr: 'Séance d’entraînement tactique et physique de l’équipe première avant les prochaines rencontres.',
    descriptionAr: 'حصة تدريبية تكتيكية وبدنية للفريق الأول استعداداً للمباريات القادمة.',
    coverImage: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=600&q=80',
    category: 'Training',
    sport: 'football',
    season: '2025/26',
    photographer: 'USM Media Team',
    date: '2026-07-07',
    location: 'Jannet Training Grounds',
    locationAr: 'مركب التدريبات بن جنات',
    tags: ['Training', 'Tactics', 'Fitness'],
    photos: [mockMediaPhotos[4], mockMediaPhotos[5]],
    views: 8700,
    isFeatured: true,
    downloadsEnabled: true,
    status: 'published',
  },
  {
    id: 'alb3',
    title: 'Supporters au stade',
    titleFr: 'Supporters au stade',
    titleAr: 'الجماهير في المدرجات',
    slug: 'supporters-au-stade',
    description: 'Incredible atmosphere, chants, and tifo choreographies of US Monastir fans at the stadium.',
    descriptionFr: 'Ambiance de folie, chants et tifos des supporters de l’US Monastir en tribunes.',
    descriptionAr: 'الأجواء الرائعة، الأهازيج، ودخلات التيفو لجماهير الاتحاد في المدرجات.',
    coverImage: '/fans.png',
    category: 'Supporters',
    sport: 'fans',
    season: '2025/26',
    photographer: 'Karim Jbeli',
    date: '2026-05-04',
    location: 'Mustapha Ben Jannet Stadium, Monastir',
    locationAr: 'ملعب مصطفى بن جنات، المنستير',
    tags: ['Ultras', 'CurvaSud', 'Chants', 'Flares'],
    photos: [mockMediaPhotos[6]],
    views: 22800,
    isFeatured: true,
    downloadsEnabled: true,
    status: 'published',
  },
  {
    id: 'alb4',
    title: 'Basketball Highlights',
    titleFr: 'Highlights Basketball',
    titleAr: 'ملخص مباريات كرة السلة',
    slug: 'basketball-highlights',
    description: 'Dunks, blocks, and clutch plays from our basketball squad in the Pro A Playoffs.',
    descriptionFr: 'Dunks, contres et paniers décisifs de l’équipe de basket lors des playoffs de Pro A.',
    descriptionAr: 'السلات الرائعة، حوائط الصد، واللقطات الحاسمة لفريق كرة السلة في مرحلة التتويج.',
    coverImage: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&w=600&q=80',
    category: 'Basketball',
    sport: 'basketball',
    season: '2025/26',
    photographer: 'Sophie Martin',
    date: '2026-07-07',
    location: 'Mohamed Mzali Arena',
    locationAr: 'قاعة محمد المزالي، المنستير',
    tags: ['Basketball', 'Playoffs', 'Dunks', 'Mzali'],
    photos: [mockMediaPhotos[7], mockMediaPhotos[8]],
    views: 10100,
    isFeatured: true,
    downloadsEnabled: true,
    status: 'published',
  },
  {
    id: 'alb5',
    title: 'Coulisses matchday',
    titleFr: 'Coulisses matchday',
    titleAr: 'كواليس يوم المباراة',
    slug: 'coulisses-matchday',
    description: 'Behind the scenes lockup room setup, player arrivals, and intimate pre-match moments.',
    descriptionFr: 'Dans les coulisses du vestiaire, arrivée des joueurs et moments intimes avant match.',
    descriptionAr: 'تحت غطاء الكواليس: تحضيرات حجرات الملابس، وصول اللاعبين واللحظات الخاصة قبل انطلاق اللقاء.',
    coverImage: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=600&q=80',
    category: 'Behind the scenes',
    sport: 'football',
    season: '2025/26',
    photographer: 'USM Media Team',
    date: '2026-07-06',
    location: 'Mustapha Ben Jannet Stadium',
    locationAr: 'ملعب مصطفى بن جنات',
    tags: ['LockerRoom', 'Arrival', 'Tunnel'],
    photos: [mockMediaPhotos[9]],
    views: 6100,
    isFeatured: false,
    downloadsEnabled: false, // request access
    status: 'published',
  },
  {
    id: 'alb6',
    title: 'Académie USM',
    titleFr: 'Académie USM',
    titleAr: 'أكاديمية الاتحاد',
    slug: 'academie-usm',
    description: 'Training drills, coaching briefings, and match action from the US Monastir Youth Academy.',
    descriptionFr: 'Entraînements, séances tactiques et matchs de l’académie des jeunes de l’US Monastir.',
    descriptionAr: 'التدريبات، الجلسات الفنية، ولقطات من مباريات شبان أكاديمية الاتحاد الرياضي المنستيري.',
    coverImage: 'https://images.unsplash.com/photo-1522778034537-20a2486be803?auto=format&fit=crop&w=600&q=80',
    category: 'Academy',
    sport: 'academy',
    season: '2025/26',
    photographer: 'USM Media Team',
    date: '2026-07-03',
    location: 'Academy Pitch 2',
    locationAr: 'ملعب الأكاديمية الفرعي الثاني',
    tags: ['Academy', 'Youth', 'Prospects', 'Trials'],
    photos: [mockMediaPhotos[10]],
    views: 7300,
    isFeatured: false,
    downloadsEnabled: true,
    status: 'published',
  },
];

export const mockMediaVideos: MediaVideo[] = [
  {
    id: 'vd1',
    title: 'Résumé du match: USM vs ES Tunis',
    titleFr: 'Résumé du match: USM vs ES Tunis',
    titleAr: 'ملخص المباراة: الاتحاد ضد الترجي الرياضي',
    slug: 'resume-du-match-usm-vs-es-tunis',
    description: 'Watch all goals and highlights of the Ligue Professionnelle 1 derby between Union Sportive Monastirienne and Espérance Sportive de Tunis at Mustapha Ben Jannet Stadium.',
    descriptionFr: 'Regardez tous les buts et actions marquantes du derby de Ligue Professionnelle 1 opposant l’Union Sportive Monastirienne à l’Espérance Sportive de Tunis.',
    descriptionAr: 'شاهد أهداف ولقطات مباراة دربي الرابطة المحترفة الأولى لكرة القدم بين الاتحاد الرياضي المنستيري والترجي الرياضي التونسي في ملعب بن جنات.',
    thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
    sourceType: 'youtube',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder embed url
    duration: '04:25',
    category: 'Matchday',
    sport: 'football',
    season: '2025/26',
    relatedMatch: 'm1',
    relatedAlbum: 'alb1',
    tags: ['Ligue1', 'Derby', 'Highlights', 'Esperance'],
    views: 12400,
    isFeatured: true,
    status: 'published',
    date: '2026-07-12',
    sponsor: { name: 'Ooredoo', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Ooredoo_logo_2017.svg' },
  },
  {
    id: 'vd2',
    title: 'Conférence de presse après-match: Coach Lassaad Chabbi',
    titleFr: 'Conférence de presse après-match: Coach Lassaad Chabbi',
    titleAr: 'المؤتمر الصحفي بعد اللقاء: تصريح المدرب لسعد الشابي',
    slug: 'conference-de-presse-apres-match-coach-lassaad-chabbi',
    description: 'Post-match press room briefings and declarations from Football head coach Lassaad Chabbi commenting on tactical discipline.',
    descriptionFr: 'Déclarations et analyses du vestiaire de l’entraîneur Lassaad Chabbi après la rencontre décisive face à l’EST.',
    descriptionAr: 'المؤتمر الصحفي للمدرب لسعد الشابي بعد نهاية اللقاء للحديث عن الانضباط التكتيكي والأداء البطولي للاعبي الاتحاد.',
    thumbnail: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
    sourceType: 'youtube',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '12:18',
    category: 'Press conferences',
    sport: 'football',
    season: '2025/26',
    relatedMatch: 'm1',
    tags: ['Chabbi', 'PressRoom', 'Tactics', 'Derby'],
    views: 8700,
    isFeatured: true,
    status: 'published',
    date: '2026-07-12',
  },
  {
    id: 'vd3',
    title: 'Inside Matchday: Dans les coulisses du vestiaire',
    titleFr: 'Inside Matchday: Dans les coulisses du vestiaire',
    titleAr: 'كواليس يوم المباراة: داخل حجرات الملابس',
    slug: 'inside-matchday-dans-les-coulisses-du-vestiaire',
    description: 'Step inside the locker room, feel the pre-match tension, and live the emotional final speech of the captain before entering Mustapha Ben Jannet turf.',
    descriptionFr: 'Pénétrez dans les vestiaires, ressentez la tension d’avant-match et vivez le discours final du capitaine.',
    descriptionAr: 'خطوة داخل كواليس حجرة الملابس: استمع لخطاب القائد الحماسي قبل الدخول إلى أرضية ملعب مصطفى بن جنات.',
    thumbnail: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=600&q=80',
    sourceType: 'youtube',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '06:42',
    category: 'Behind the scenes',
    sport: 'football',
    season: '2025/26',
    relatedAlbum: 'alb5',
    tags: ['LockerRoom', 'Speech', 'Tension', 'Tunnel'],
    views: 6100,
    isFeatured: true,
    status: 'published',
    date: '2026-07-06',
  },
  {
    id: 'vd4',
    title: 'Interview joueur: Adem Alimi revient sur sa forme actuelle',
    titleFr: 'Interview joueur: Adem Alimi revient sur sa forme actuelle',
    titleAr: 'حوار مع اللاعب: آدم العلمي يتحدث عن فورمته الحالية',
    slug: 'interview-joueur-adem-alimi-revient-sur-sa-forme-actuelle',
    description: 'Exclusive talk with winger Adem Alimi about his key goal in the derby and his ambitions with US Monastir in the continental race.',
    descriptionFr: 'Entretien exclusif avec Adem Alimi sur son but décisif lors du derby et ses objectifs continentaux.',
    descriptionAr: 'حوار حصري مع جناح الاتحاد آدم العلمي للحديث عن هدفه الحاسم في الدربي وطموحات الفريق في المسابقة الإفريقية.',
    thumbnail: 'https://images.unsplash.com/photo-1489985548304-9b8192760145?auto=format&fit=crop&w=600&q=80',
    sourceType: 'youtube',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '05:33',
    category: 'Interviews',
    sport: 'football',
    season: '2025/26',
    relatedPlayers: ['f4'],
    tags: ['Alimi', 'Winger', 'Exclusive', 'Interview'],
    views: 7300,
    isFeatured: true,
    status: 'published',
    date: '2026-07-07',
  },
  {
    id: 'vd5',
    title: 'Best moments: Saison historique 2023/24 basketball',
    titleFr: 'Best moments: Saison historique 2023/24 basketball',
    titleAr: 'أفضل اللحظات: موسم كرة السلة التاريخي 2023/24',
    slug: 'best-moments-saison-historique-2023-24-basketball',
    description: 'Relive the most spectacular baskets, blocks, and trophies of the US Monastir Pro A Basketball champions during the record-breaking 2023/24 season.',
    descriptionFr: 'Revivez les paniers les plus spectaculaires et trophées des champions de Pro A lors de la saison 2023/24.',
    descriptionAr: 'استرجع أروع السلات وحوائط الصد وتتويج أبطال كرة السلة باللقب خلال موسم 2023/24 التاريخي.',
    thumbnail: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&w=600&q=80',
    sourceType: 'youtube',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '03:56',
    category: 'Basketball',
    sport: 'basketball',
    season: '2023/24',
    tags: ['Champions', 'ProA', 'SlamDunk', 'Compilation'],
    views: 11200,
    isFeatured: true,
    status: 'published',
    date: '2026-05-18',
  },
  {
    id: 'vd6',
    title: 'Ambiance Monastirienne: Tifo and flares Curva Sud',
    titleFr: 'Ambiance Monastirienne: Tifo and flares Curva Sud',
    titleAr: 'أجواء منستيرية: دخلة التيفو والشماريخ لجماهير المنعطف الجنوبي',
    slug: 'ambiance-monastirienne-tifo-and-flares-curva-sud',
    description: 'Experience stadium noise, ultras chanting, and tifo choreographies in high-definition video during matchday entries.',
    descriptionFr: 'Vivez le bruit du stade, les chants des ultras et les chorégraphies du tifo en vidéo HD.',
    descriptionAr: 'عش جنون المدارج: أهازيج الجماهير، دخلة التيفو، وألعاب الشماريخ النارية لجماهير الكورفا سود في فيديو عالي الجودة.',
    thumbnail: '/fans.png',
    sourceType: 'youtube',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '05:42',
    category: 'Supporters',
    sport: 'fans',
    season: '2023/24',
    relatedAlbum: 'alb3',
    tags: ['Ultras', 'CurvaSud', 'Chants', 'Derby'],
    views: 22800,
    isFeatured: true,
    status: 'published',
    date: '2026-05-04',
  },
];

export const mockMediaArchive: MediaArchive[] = [
  { id: 'arc1', year: '1923', season: '1923/24', title: 'Fondation du club: Premières archives historiques', titleFr: 'Fondation du club: Premières archives historiques', titleAr: 'تأسيس النادي: الأرشيف التاريخي الأول', description: 'Explore first photographs, letters of foundation, and rosters of Union Sportive Monastirienne in 1923.', descriptionFr: 'Explorez les premières photographies et lettres de fondation du club en 1923.', descriptionAr: 'استكشف أولى الصور ووثائق التأسيس وقائمة أول لاعبي الاتحاد المنستيري سنة 1923.', photoCount: 15, videoCount: 0, coverImage: 'https://images.unsplash.com/photo-1529254479751-faeedc59e78f?auto=format&fit=crop&w=600&q=80', status: 'published' },
  { id: 'arc2', year: '1998', season: '1998/99', title: 'Basketball: Premier titre de champion de Tunisie', titleFr: 'Basket: Premier titre de champion de Tunisie', titleAr: 'كرة السلة: أول لقب بطولة تونسية تاريخي', description: 'Retro photo gallery and media reports celebrating the first ever national Pro A basketball championship of Monastir.', descriptionFr: 'Photos rétro célébrant le tout premier titre national de basket Pro A de l’USM.', descriptionAr: 'معرض صور أرشيفي نادر وقصاصات صحفية قديمة تحتفي بأول لقب بطولة وطنية لكرة السلة في تاريخ النادي.', photoCount: 28, videoCount: 1, coverImage: 'https://images.unsplash.com/photo-1505666287802-931dc83948e9?auto=format&fit=crop&w=600&q=80', status: 'published' },
  { id: 'arc3', year: '2020', season: '2019/20', title: 'Football: Coupe de Tunisie historique à Radès', titleFr: 'Foot: Coupe de Tunisie historique à Radès', titleAr: 'كرة القدم: لقب كأس تونس التاريخي في رادس', description: 'Relive the historic final against Esperance Tunis resulting in our first ever Tunisian Cup victory in 2020.', descriptionFr: 'Coupe de Tunisie historique remportée face à l’Espérance de Tunis en 2020.', descriptionAr: 'أرشيف المباراة النهائية الكبرى ضد الترجي والتتويج بأول لقب كأس تونس في تاريخ النادي سنة 2020.', photoCount: 140, videoCount: 3, coverImage: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&w=600&q=80', status: 'published' },
];
