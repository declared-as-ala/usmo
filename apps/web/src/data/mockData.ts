export interface Player {
  id: string;
  name: string;
  nameAr: string;
  number: number;
  position: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward' | 'Guard' | 'Forward-C' | 'Center';
  positionAr: string;
  nationality: string;
  nationalityAr: string;
  image: string;
  stats: {
    [key: string]: number | string;
  };
  bio: string;
  bioAr: string;
  height: string;
  weight: string;
  age: number;
}

export interface Staff {
  id: string;
  name: string;
  nameAr: string;
  role: string;
  roleAr: string;
  image: string;
}

export interface MatchEvent {
  id: string;
  time: number; // minute or second
  type: 'goal' | 'basket' | 'card-yellow' | 'card-red' | 'foul' | 'substitution' | 'timeout';
  team: 'home' | 'away';
  player: string;
  playerAr: string;
  detail?: string; // e.g. "Assist by Alimi", "Three-pointer"
  detailAr?: string;
}

export interface Match {
  id: string;
  sport: 'football' | 'basketball';
  competition: string;
  competitionAr: string;
  homeTeam: string;
  homeTeamAr: string;
  homeLogo: string;
  awayTeam: string;
  awayTeamAr: string;
  awayLogo: string;
  date: string;
  time: string;
  venue: string;
  venueAr: string;
  status: 'upcoming' | 'live' | 'finished';
  score: {
    home: number;
    away: number;
  };
  quarters?: { home: number[]; away: number[] }; // Basketball only
  countdownDate?: string;
  timeline: MatchEvent[];
  stats: {
    possession?: { home: number; away: number }; // Football
    shots?: { home: number; away: number };
    fouls?: { home: number; away: number };
    rebounds?: { home: number; away: number }; // Basketball
    assists?: { home: number; away: number }; // Basketball
    threePointers?: { home: number; away: number }; // Basketball
  };
  lineups?: {
    home: string[];
    away: string[];
  };
  sponsorLogo?: string;
  sponsorName?: string;
}

export interface News {
  id: string;
  title: string;
  titleAr: string;
  titleFr: string;
  summary: string;
  summaryAr: string;
  summaryFr: string;
  content: string;
  contentAr: string;
  contentFr: string;
  image: string;
  category: 'Football' | 'Basketball' | 'Club' | 'Academy' | 'Announcements' | 'Sponsors';
  categoryAr: string;
  date: string;
  readTime: string;
  official: boolean;
  author: string;
  /** Defaults to true when omitted — existing mock articles don't set this explicitly. */
  published?: boolean;
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Legend {
  id: string;
  name: string;
  nameAr: string;
  years: string;
  role: string;
  roleAr: string;
  achievement: string;
  achievementAr: string;
  bio: string;
  bioAr: string;
  image: string;
}

export interface Trophy {
  id: string;
  title: string;
  titleAr: string;
  count: number;
  years: string;
  icon: string;
  image: string;
}

export interface Sponsor {
  id: string;
  name: string;
  category: 'Main' | 'Official' | 'Technical' | 'Media' | 'Academy';
  logo: string;
  story: string;
  storyAr: string;
  storyFr: string;
  offer?: string;
  offerAr: string;
  offerFr?: string;
  link: string;
  metrics: {
    impressions: number;
    clicks: number;
    ctr: number;
  };
}

export interface ProductColor {
  name: string;
  nameAr: string;
  nameFr: string;
  hex: string;
}

export type ProductBadge = 'new' | 'bestseller' | 'limited' | 'lowStock' | 'soldOut' | 'official';

export type ProductCollection = 'football' | 'basketball' | 'matchday' | 'kids' | 'accessories' | 'limited';

export interface CatalogItem {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  price: string;
  oldPrice?: string;
  image: string;
  /** Additional gallery images — images[0] is used as the hover/secondary image on product cards. */
  images?: string[];
  sizes: string[];
  colors?: ProductColor[];
  available: boolean;
  category: 'Jerseys' | 'Accessories' | 'Hoodies' | 'Caps';
  collection: ProductCollection;
  badges?: ProductBadge[];
  /** 1-3, used to render the #1/#2/#3 ranking badge in the Best Sellers grid. */
  rank?: number;
  stock?: number;
  reference: string;
  description: string;
  descriptionAr: string;
  descriptionFr: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface SupporterPack {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  tagline: string;
  taglineAr: string;
  taglineFr: string;
  price: string;
  image: string;
  items: string[];
  itemsAr: string[];
  itemsFr: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  questionAr: string;
  options: string[];
  optionsAr: string[];
  answerIndex: number;
}

// ----------------------------------------------------
// HIGH FIDELITY MOCK DATA DEFINITIONS
// ----------------------------------------------------

export const footballPlayers: Player[] = [
  {
    id: 'f1',
    name: 'Moez Ben Cherifia',
    nameAr: 'معز بن شريفية',
    number: 1,
    position: 'Goalkeeper',
    positionAr: 'حارس مرمى',
    nationality: 'Tunisian',
    nationalityAr: 'تونسي',
    image: '/moez_ben_cherifia.png',
    stats: { Matches: 28, Cleansheets: 10, Saves: 71 },
    bio: 'Commanding goalkeeper and bedrock of USM defensive solidity. Known for spectacular reflex saves and precise distribution.',
    bioAr: 'حارس مرمى راسخ وركيزة المتانة الدفاعية للاتحاد. يُعرف بتصديات انعكاسية مذهلة وتوزيع دقيق.',
    height: '187 cm',
    weight: '83 kg',
    age: 30,
  },
  {
    id: 'f2',
    name: 'Chiheb Salhi',
    nameAr: 'شهاب الصالحي',
    number: 4,
    position: 'Defender',
    positionAr: 'مدافع',
    nationality: 'Tunisian',
    nationalityAr: 'تونسي',
    image: '/chiheb_salhi.png',
    stats: { Tackles: 45, Blocks: 22, Goals: 2 },
    bio: 'A defensive wall with unmatched aerial ability and tactical intelligence.',
    bioAr: 'جدار دفاعي قوي يتميز بقدرات هوائية لا تضاهى وذكاء تكتيكي ممتاز.',
    height: '186 cm',
    weight: '80 kg',
    age: 28,
  },
  {
    id: 'f3',
    name: 'Bilel Ifa',
    nameAr: 'بلال عيفية',
    number: 5,
    position: 'Defender',
    positionAr: 'مدافع',
    nationality: 'Tunisian',
    nationalityAr: 'تونسي',
    image: '/bilel_ifa.png',
    stats: { Tackles: 38, Blocks: 18, Interceptions: 29 },
    bio: 'Tenacious centre-back who organises the backline with authority and reads the game superbly.',
    bioAr: 'مدافع وسطي شرس ينظم الخط الدفاعي بسلطة ويقرأ اللعبة بشكل رائع.',
    height: '183 cm',
    weight: '78 kg',
    age: 26,
  },
  {
    id: 'f4',
    name: 'Firas Ghouma',
    nameAr: 'فراس غومة',
    number: 3,
    position: 'Defender',
    positionAr: 'مدافع',
    nationality: 'Tunisian',
    nationalityAr: 'تونسي',
    image: '/firas_ghouma.png',
    stats: { Assists: 4, Crosses: 52, Tackles: 31 },
    bio: 'Attack-minded left-back who excels in overlapping runs and dangerous crossing into the box.',
    bioAr: 'ظهير أيسر هجومي يبرع في الجري المتداخل والتمريرات العرضية الخطيرة داخل المنطقة.',
    height: '178 cm',
    weight: '74 kg',
    age: 25,
  },
  {
    id: 'f5',
    name: 'Moses Orkuma',
    nameAr: 'موسى أوركوما',
    number: 8,
    position: 'Midfielder',
    positionAr: 'متوسط ميدان',
    nationality: 'Nigerian',
    nationalityAr: 'نيجيري',
    image: '/moses_orkuma.png',
    stats: { Assists: 5, KeyPasses: 34, Interceptions: 41 },
    bio: 'Dynamic central midfielder who provides physical presence and box-to-box energy.',
    bioAr: 'لاعب وسط ديناميكي يمنح الفريق حضوراً بدنياً قوياً ويمتاز باللعب من صندوق إلى صندوق.',
    height: '180 cm',
    weight: '76 kg',
    age: 30,
  },
  {
    id: 'f6',
    name: 'Firas Ifia',
    nameAr: 'فراس عيفية',
    number: 10,
    position: 'Midfielder',
    positionAr: 'متوسط ميدان',
    nationality: 'Tunisian',
    nationalityAr: 'تونسي',
    image: '/firas_ifia.png',
    stats: { Goals: 4, Assists: 8, KeyPasses: 45 },
    bio: 'Creative playmaker and set-piece specialist who dictates the offensive tempo.',
    bioAr: 'صانع ألعاب مبتكر ومتخصص في الكرات الثابتة، يتحكم في إيقاع هجوم الفريق.',
    height: '178 cm',
    weight: '72 kg',
    age: 26,
  },
  {
    id: 'f7',
    name: 'Wajdi Ben Othmane',
    nameAr: 'وجدي بن عثمان',
    number: 6,
    position: 'Midfielder',
    positionAr: 'متوسط ميدان',
    nationality: 'Tunisian',
    nationalityAr: 'تونسي',
    image: 'https://images.unsplash.com/photo-1516567727245-ad8c68f3ec93?auto=format&fit=crop&w=400&q=80',
    stats: { Tackles: 55, Recoveries: 48, Goals: 1 },
    bio: 'Tireless defensive midfielder who shields the backline and wins crucial possession battles.',
    bioAr: 'لاعب وسط دفاعي لا يكل يحمي الخط الخلفي ويكسب مواجهات الاستحواذ الحاسمة.',
    height: '182 cm',
    weight: '79 kg',
    age: 27,
  },
  {
    id: 'f8',
    name: 'Adem Alimi',
    nameAr: 'آدم العلمي',
    number: 11,
    position: 'Forward',
    positionAr: 'مهاجم',
    nationality: 'Tunisian',
    nationalityAr: 'تونسي',
    image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=400&q=80',
    stats: { Goals: 12, Assists: 6, Matches: 22 },
    bio: 'Fast-paced winger with incredible dribbling skills and lethal finishing under pressure.',
    bioAr: 'جناح سريع يتميز بمهارات مراوغة رائعة وإنهاء قاتل للهجمات تحت الضغط.',
    height: '175 cm',
    weight: '68 kg',
    age: 23,
  },
  {
    id: 'f9',
    name: 'Yan Mbe',
    nameAr: 'يان مبي',
    number: 9,
    position: 'Forward',
    positionAr: 'مهاجم',
    nationality: 'Cameroonian',
    nationalityAr: 'كاميروني',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=400&q=80',
    stats: { Goals: 9, Assists: 3, Shots: 42 },
    bio: 'Powerful centre-forward with exceptional hold-up play, aerial dominance and clinical finishing.',
    bioAr: 'مهاجم أمامي قوي يتميز بالتحكم في الكرة وإدارة الظهر وقوته الجوية وإنهاء احترافي.',
    height: '186 cm',
    weight: '84 kg',
    age: 28,
  },
  {
    id: 'f10',
    name: 'Nizar Jelassi',
    nameAr: 'نزار الجلاصي',
    number: 7,
    position: 'Forward',
    positionAr: 'مهاجم',
    nationality: 'Tunisian',
    nationalityAr: 'تونسي',
    image: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=400&q=80',
    stats: { Goals: 7, Assists: 9, Dribbles: 38 },
    bio: 'Electric right winger with explosive pace, technical dribbling flair, and key-pass creativity.',
    bioAr: 'جناح أيمن متفجر بسرعة خارقة وبراعة تقنية في المراوغة وإبداع في التمريرات المفتاحية.',
    height: '173 cm',
    weight: '67 kg',
    age: 24,
  },
  {
    id: 'f11',
    name: 'Khalil Ben Youssef',
    nameAr: 'خليل بن يوسف',
    number: 2,
    position: 'Defender',
    positionAr: 'مدافع',
    nationality: 'Tunisian',
    nationalityAr: 'تونسي',
    image: 'https://images.unsplash.com/photo-1431324155629-1a6edd1d1534?auto=format&fit=crop&w=400&q=80',
    stats: { Tackles: 34, Assists: 2, Clearances: 41 },
    bio: 'Reliable right-back with excellent defensive positioning and stamina for high-tempo pressing.',
    bioAr: 'ظهير أيمن موثوق بتموضع دفاعي ممتاز وقدرة على الضغط العالي طوال المباراة.',
    height: '179 cm',
    weight: '75 kg',
    age: 22,
  },
];

export const basketballPlayers: Player[] = [
  {
    id: 'b1',
    name: 'Radhouane Slimane',
    nameAr: 'رضوان سليمان',
    number: 12,
    position: 'Forward-C',
    positionAr: 'جناح / ارتكاز',
    nationality: 'Tunisian',
    nationalityAr: 'تونسي',
    image: '/radhouane_slimane.png',
    stats: { PPG: '14.5', RPG: '6.8', APG: '2.4' },
    bio: 'Living legend of Tunisian basketball. Guided USM to its BAL 2022 victory with clutch scoring and inspirational leadership.',
    bioAr: 'أسطورة حية في كرة السلة التونسية. قاد الاتحاد المنستيري للتتويج بالدوري الإفريقي 2022.',
    height: '205 cm',
    weight: '102 kg',
    age: 44,
  },
  {
    id: 'b2',
    name: 'Makrem Ben Romdhane',
    nameAr: 'مكرم بن رمضان',
    number: 4,
    position: 'Guard',
    positionAr: 'لاعب خلفي',
    nationality: 'Tunisian',
    nationalityAr: 'تونسي',
    image: '/makrem_ben_romdhane.png',
    stats: { PPG: '15.2', APG: '5.6', '3P%': '39%' },
    bio: 'Elite playmaking guard and one of the most decorated Tunisian players. Multiple national champion and BAL 2022 finals hero.',
    bioAr: 'لاعب خلفي متميز وأحد أكثر اللاعبين التونسيين تتويجاً. بطل متعدد المرات وأبرز نجوم نهائي الدوري الإفريقي 2022.',
    height: '187 cm',
    weight: '86 kg',
    age: 40,
  },
  {
    id: 'b3',
    name: 'Firas Lahyani',
    nameAr: 'فراس لحياني',
    number: 15,
    position: 'Forward',
    positionAr: 'لاعب جناح',
    nationality: 'Tunisian',
    nationalityAr: 'تونسي',
    image: '/firas_lahyani.png',
    stats: { PPG: '12.8', RPG: '8.2', BPG: '1.9' },
    bio: 'Known as the "Air Tunisia" for his incredible dunking and dominant blocking ability.',
    bioAr: 'الملقب بـ "طيران تونس" لقفزاته الرائعة وقدراته الدفاعية الخارقة في حائط الصد.',
    height: '201 cm',
    weight: '94 kg',
    age: 33,
  },
  {
    id: 'b4',
    name: 'Mourad El Mabrouk',
    nameAr: 'مراد المبروك',
    number: 7,
    position: 'Guard',
    positionAr: 'لاعب خلفي',
    nationality: 'Tunisian',
    nationalityAr: 'تونسي',
    image: '/mourad_el_mabrouk.png',
    stats: { PPG: '11.2', APG: '4.1', '3P%': '42%' },
    bio: 'Lethal three-pointer specialist who stretches defensive lines with highly consistent long-range shooting.',
    bioAr: 'قناص ثلاثيات قاتل يساهم في فك تكتل الدفاعات بفضل رمياته الدقيقة من بعيد.',
    height: '189 cm',
    weight: '84 kg',
    age: 36,
  },
  {
    id: 'b5',
    name: 'Ater Majok',
    nameAr: 'أتير ماجوك',
    number: 13,
    position: 'Center',
    positionAr: 'لاعب ارتكاز',
    nationality: 'South Sudanese-Australian',
    nationalityAr: 'جنوب سوداني / أسترالي',
    image: '/ater_majok.png',
    stats: { RPG: '10.5', BPG: '3.1', PPG: '9.2' },
    bio: 'BAL 2022 Defensive Player of the Year. An elite rim protector and rebound champion.',
    bioAr: 'أفضل مدافع في الدوري الإفريقي لكرة السلة 2022. حامي سلة محترف وبطل المتابعات.',
    height: '210 cm',
    weight: '105 kg',
    age: 38,
  },
  {
    id: 'b6',
    name: 'Mehdi Cherif Ouaret',
    nameAr: 'مهدي شريف وارت',
    number: 21,
    position: 'Center',
    positionAr: 'لاعب ارتكاز',
    nationality: 'Algerian',
    nationalityAr: 'جزائري',
    image: '/mehdi_cherif_ouaret.png',
    stats: { PPG: '13.4', RPG: '9.1', FG: '58%' },
    bio: 'Dominant post presence and two-way force who energises USM inside with elite efficiency.',
    bioAr: 'هيمنة داخلية على ملعب كرة السلة وقوة ثنائية الاتجاه تنشّط الاتحاد بكفاءة عالية.',
    height: '208 cm',
    weight: '108 kg',
    age: 32,
  },
  {
    id: 'b7',
    name: 'Skander Ben Romdhane',
    nameAr: 'إسكندر بن رمضان',
    number: 11,
    position: 'Forward',
    positionAr: 'لاعب جناح',
    nationality: 'Tunisian',
    nationalityAr: 'تونسي',
    image: '/skander_ben_romdhane.png',
    stats: { PPG: '10.6', RPG: '5.3', STL: '1.8' },
    bio: 'Versatile forward with excellent defensive instincts and ability to score from multiple positions.',
    bioAr: 'جناح متعدد الاستخدامات بغريزة دفاعية ممتازة وقدرة على التسجيل من مواقع متعددة.',
    height: '197 cm',
    weight: '89 kg',
    age: 28,
  },
];

export const technicalStaff: Staff[] = [
  { id: 's1', name: 'Lassaad Chabbi', nameAr: 'لسعد الشابي', role: 'Football Head Coach', roleAr: 'مدرب كرة قدم أول', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
  { id: 's2', name: 'Miodrag Perisic', nameAr: 'ميودراغ بيريسيتش', role: 'Basketball Head Coach', roleAr: 'مدرب كرة سلة أول', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
  { id: 's3', name: 'Anis Chaabane', nameAr: 'أنيس شعبان', role: 'Assistant Coach', roleAr: 'مدرب مساعد', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80' },
  { id: 's4', name: 'Dr. Riadh El Bez', nameAr: 'د. رياض البز', role: 'Team Chief Medical Doctor', roleAr: 'طبيب الفريق الرئيسي', image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80' }
];

export const matchesData: Match[] = [
  {
    id: 'm1',
    sport: 'football',
    competition: 'Tunisian Ligue Professionnelle 1',
    competitionAr: 'الرابطة المحترفة الأولى تونس',
    homeTeam: 'US Monastir',
    homeTeamAr: 'الاتحاد المنستيري',
    homeLogo: '/logo.webp',
    awayTeam: 'Espérance de Tunis',
    awayTeamAr: 'الترجي الرياضي التونسي',
    awayLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Esperance_Sportive_de_Tunis_Logo.svg/1200px-Esperance_Sportive_de_Tunis_Logo.svg.png',
    date: '2026-07-12',
    time: '17:00',
    venue: 'Stade Mustapha Ben Jannet, Monastir',
    venueAr: 'ملعب مصطفى بن جنات، المنستير',
    status: 'upcoming',
    score: { home: 0, away: 0 },
    countdownDate: '2026-07-12T17:00:00+01:00',
    timeline: [],
    stats: {},
    lineups: {
      home: ['S. Yeddes', 'C. Salhi', 'M. Orkuma', 'F. Ifia', 'A. Alimi', 'K. Ait-Malek', 'F. Ghouma', 'W. Ben Othmane', 'Y. Mbe', 'N. Jelassi', 'B. Hadhri'],
      away: ['M. Memmiche', 'Y. Meriah', 'M. Tougai', 'R. Bouchniba', 'A. Ben Hamida', 'R. Aholou', 'H. Tka', 'Y. Sasse', 'H. Ghacha', 'R. Rodrigues', 'O. Bouguerra']
    },
    sponsorLogo: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Ooredoo_logo_2017.svg',
    sponsorName: 'Ooredoo'
  },
  {
    id: 'm2',
    sport: 'football',
    competition: 'Tunisian Ligue Professionnelle 1',
    competitionAr: 'الرابطة المحترفة الأولى تونس',
    homeTeam: 'Club Africain',
    homeTeamAr: 'النادي الإفريقي',
    homeLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Club_Africain_logo.svg/800px-Club_Africain_logo.svg.png',
    awayTeam: 'US Monastir',
    awayTeamAr: 'الاتحاد المنستيري',
    awayLogo: '/logo.webp',
    date: '2026-07-06',
    time: '16:00',
    venue: 'Stade Hammadi Agrebi, Radès',
    venueAr: 'ملعب حمادي العقربي، رادس',
    status: 'finished',
    score: { home: 1, away: 2 },
    timeline: [
      { id: 'e1', time: 14, type: 'goal', team: 'away', player: 'Adem Alimi', playerAr: 'آدم العلمي', detail: 'Assist by Ifia', detailAr: 'تمريرة حاسمة من عيفية' },
      { id: 'e2', time: 38, type: 'card-yellow', team: 'home', player: 'Ghaith Zaalouni', playerAr: 'غيث الزعلوني' },
      { id: 'e3', time: 55, type: 'goal', team: 'home', player: 'Kingsley Eduwo', playerAr: 'كينغسلاي إيدو' },
      { id: 'e4', time: 78, type: 'goal', team: 'away', player: 'Moses Orkuma', playerAr: 'موسى أوركوما', detail: 'Spectacular long distance shot', detailAr: 'تسديدة رائعة من بعيد' },
      { id: 'e5', time: 88, type: 'card-red', team: 'home', player: 'Rami Bedoui', playerAr: 'رامي البدوي' }
    ],
    stats: {
      possession: { home: 48, away: 52 },
      shots: { home: 9, away: 14 },
      fouls: { home: 18, away: 12 }
    }
  },
  {
    id: 'm3',
    sport: 'basketball',
    competition: 'Pro A League - PlayOffs',
    competitionAr: 'البطولة الوطنية المحترفة أ - مرحلة التتويج',
    homeTeam: 'US Monastir',
    homeTeamAr: 'الاتحاد المنستيري',
    homeLogo: '/logo.webp',
    awayTeam: 'Club Africain Basket',
    awayTeamAr: 'النادي الإفريقي لكرة السلة',
    awayLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Club_Africain_logo.svg/800px-Club_Africain_logo.svg.png',
    date: '2026-07-07',
    time: '19:00',
    venue: 'Salle Mohamed-Mzali, Monastir',
    venueAr: 'القاعة الأولمبية محمد المزالي، المنستير',
    status: 'live',
    score: { home: 68, away: 62 },
    quarters: { home: [18, 16, 20, 14], away: [14, 18, 15, 15] },
    timeline: [
      { id: 'eb1', time: 5, type: 'basket', team: 'home', player: 'Mourad El Mabrouk', playerAr: 'مراد المبروك', detail: 'Three-pointer', detailAr: 'ثلاثية ناجحة' },
      { id: 'eb2', time: 14, type: 'basket', team: 'away', player: 'Naim Dhifallah', playerAr: 'نعيم ضيف الله' },
      { id: 'eb3', time: 25, type: 'basket', team: 'home', player: 'Firas Lahyani', playerAr: 'فراس لحياني', detail: 'Monster Dunk', detailAr: 'سحق هائل للسلة' },
      { id: 'eb4', time: 35, type: 'foul', team: 'away', player: 'Mourad El Mabrouk', playerAr: 'مراد المبروك' }
    ],
    stats: {
      rebounds: { home: 38, away: 29 },
      assists: { home: 18, away: 12 },
      threePointers: { home: 8, away: 5 }
    },
    lineups: {
      home: ['Mourad El Mabrouk', 'Radhouane Slimane', 'Firas Lahyani', 'Ater Majok', 'Michael Dixon'],
      away: ['Naim Dhifallah', 'Omar Abada', 'Mahdi Sayeh', 'Lassaad Chouaya', 'Ziyed Chennoufi']
    }
  }
];

export const newsArticles: News[] = [
  {
    id: 'n1',
    title: 'US Monastir clinches crucial 2-1 victory over Club Africain',
    titleAr: 'الاتحاد المنستيري ينتزع فوزاً ثميناً من النادي الإفريقي 2-1',
    titleFr: 'L’US Monastir s’impose avec autorité 2-1 face au Club Africain',
    summary: 'A breathtaking performance led by Moses Orkuma guided USM to solid points away in Rades.',
    summaryAr: 'أداء بطولي بقيادة موسى أوركوما يمنح الاتحاد ثلاث نقاط ثمينة خارج الديار في رادس.',
    summaryFr: 'Une superbe performance de Moses Orkuma offre une victoire capitale en déplacement à Radès.',
    content: 'US Monastir displayed tactical discipline and elite efficiency in a classic Ligue 1 fixture against Club Africain. Adem Alimi opened the score in the 14th minute after a precise delivery from Ifia. Although Kingsley Eduwo equalized in the second half, Moses Orkuma sealed the victory with a 30-meter screamer in the 78th minute. The win cements USM’s position near the top of the standings.',
    contentAr: 'قدم الاتحاد الرياضي المنستيري أداءً تكتيكياً رفيعاً وفاعلية هجومية كبيرة في مباراة كلاسيكية بالرابطة الأولى ضد النادي الإفريقي. افتتح آدم العلمي التسجيل في الدقيقة 14 بعد تمريرة دقيقة من عيفية. ورغم تعادل كينغسلاي إيدو للنادي الإفريقي في الشوط الثاني، حسم موسى أوركوما اللقاء بقذيفة صاروخية من مسافة 30 متراً في الدقيقة 78. هذا الفوز يثبت أقدام الاتحاد في صدارة الترتيب.',
    contentFr: 'L’US Monastir a fait preuve d’une discipline tactique exemplaire et d’une efficacité de premier ordre dans ce classique de la Ligue 1 face au Club Africain. Adem Alimi a débloqué la situation dès la 14e minute sur un centre millimétré de Firas Ifia. Malgré l’égalisation de Kingsley Eduwo en seconde période, c’est Moses Orkuma qui a scellé le match d’une frappe surpuissante de 30 mètres à la 78e minute, renforçant la position de l’USM en tête.',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    category: 'Football',
    categoryAr: 'كرة القدم',
    date: '2026-07-06',
    readTime: '4 min',
    official: true,
    author: 'Club Media Relations Office'
  },
  {
    id: 'n2',
    title: 'Basketball: Monastir finishes intense preparation ahead of PlayOffs',
    titleAr: 'كرة السلة: الاتحاد ينهي تحضيرات مكثفة استعداداً لمرحلة التتويج',
    titleFr: 'Basket: L’USM peaufine sa préparation avant les PlayOffs',
    summary: 'Miodrag Perisic outlines tactical changes to maintain high offensive efficiency.',
    summaryAr: 'المدرب ميودراغ بيريسيتش يضع اللمسات الأخيرة للتغييرات التكتيكية للحفاظ على الفاعلية الهجومية.',
    summaryFr: 'Le coach Miodrag Perisic prépare des ajustements tactiques pour maintenir l’efficacité offensive.',
    content: 'Ahead of the highly anticipated match against Club Africain, head coach Perisic spoke to the media about squad mental focus and physical fitness. "Our goal is simple - defend the title with everything we have," said legend Radhouane Slimane.',
    contentAr: 'قبل المواجهة المنتظرة ضد النادي الإفريقي، تحدث المدرب الأول بيريسيتش لوسائل الإعلام عن التركيز الذهني والجاهزية البدنية للفريق. وقال الأسطورة رضوان سليمان: "هدفنا بسيط - سندافع عن اللقب بكل ما نملك من قوة".',
    contentFr: 'Avant le grand choc contre le Club Africain, l’entraîneur principal Perisic s’est confié aux médias sur l’état d’esprit et de forme de l’équipe. "Notre objectif est clair : défendre notre titre de toutes nos forces", a affirmé la légende Radhouane Slimane.',
    image: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&w=800&q=80',
    category: 'Basketball',
    categoryAr: 'كرة السلة',
    date: '2026-07-05',
    readTime: '3 min',
    official: false,
    author: 'USM Media Basketball Editor'
  },
  {
    id: 'n3',
    title: 'Official Announcement: Partnership renewal with Ooredoo Tunisia',
    titleAr: 'بلاغ رسمي: تجديد اتفاقية الشراكة مع أوريدو تونس',
    titleFr: 'Annonce Officielle: Renouvellement du partenariat avec Ooredoo Tunisie',
    summary: 'The club extends partnership securing advanced digital sponsorships and academy funding.',
    summaryAr: 'إدارة النادي تمدد الشراكة وتضمن تمويل أكاديميات الشباب وتطوير البنية الرقمية للمشجعين.',
    summaryFr: 'Le club prolonge son partenariat stratégique garantissant le financement de l’académie et du digital.',
    content: 'Union Sportive Monastirienne is thrilled to announce a three-year extension of its sponsorship agreement with Ooredoo Tunisia. This renewal will focus on fan engagement portals, live match day activations, and supporting the elite Youth Academy.',
    contentAr: 'يسر الاتحاد الرياضي المنستيري الإعلان عن تجديد عقد الرعاية مع أوريدو تونس لثلاثة مواسم إضافية. ستركز هذه الاتفاقية على منصات التفاعل مع الجماهير وأكاديمية النادي للشباب.',
    contentFr: 'L’Union Sportive Monastirienne est ravie d’annoncer la prolongation pour trois ans de son accord de sponsoring avec Ooredoo Tunisie. Ce renouvellement mettra l’accent sur le digital, les académies de jeunes et les animations jours de match.',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80',
    category: 'Announcements',
    categoryAr: 'بلاغات رسمية',
    date: '2026-07-04',
    readTime: '5 min',
    official: true,
    author: 'Presidential Press Office'
  }
];

export const clubLegends: Legend[] = [
  {
    id: 'l1',
    name: 'Radhouane Slimane',
    nameAr: 'رضوان سليمان',
    years: '2019 - Present',
    role: 'Basketball Legend / Captain',
    roleAr: 'أسطورة كرة السلة / القائد',
    achievement: '1x BAL Champion, 5x Pro A Tunisian Champion',
    achievementAr: 'بطل أفريقيا BAL، 5 مرات بطل تونس للبطولة المحترفة',
    bio: 'One of the most decorated Tunisian basketball players. His experience and leadership were pivotal in the historic African BAL 2022 triumph in Rwanda.',
    bioAr: 'من أكثر اللاعبين تتويجاً في تاريخ كرة السلة التونسية. كانت خبرته وقيادته عاملًا حاسمًا في التتويج التاريخي باللقب الأفريقي BAL سنة 2022 برواندا.',
    image: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'l2',
    name: 'Mustapha Ben Jannet',
    nameAr: 'مصطفى بن جنات',
    years: '1940s - 1950s',
    role: 'Club Founder / Historic Administrator',
    roleAr: 'مؤسس النادي / إداري تاريخي',
    achievement: 'Symbol of the Club resistance and official stadium namesake',
    achievementAr: 'رمز مقاومة النادي وحامل اسم الملعب الرسمي للفريق',
    bio: 'A monumental figure in the club history, who fought for the institutionalization of sport in Monastir during colonial times. The main football stadium is named after him.',
    bioAr: 'شخصية بارزة في تاريخ النادي، كافح من أجل تنظيم وهيكلة الرياضة في مدينة المنستير في حقبة الاستعمار. يحمل ملعب كرة القدم الرئيسي اسمه تخليداً لذكراه.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'
  }
];

export const clubTrophies: Trophy[] = [
  { id: 't1', title: 'Basketball Africa League (BAL)', titleAr: 'الدوري الإفريقي لكرة السلة', count: 1, years: '2022', icon: '🏆', image: 'https://images.unsplash.com/photo-1505666287802-931dc83948e9?auto=format&fit=crop&w=400&q=80' },
  { id: 't2', title: 'Tunisian Pro A Basketball League', titleAr: 'البطولة الوطنية المحترفة لكرة السلة', count: 9, years: '1998, 2000, 2005, 2019, 2020, 2021, 2022, 2023, 2024', icon: '🏆', image: 'https://images.unsplash.com/photo-1505666287802-931dc83948e9?auto=format&fit=crop&w=400&q=80' },
  { id: 't3', title: 'Tunisian Football Cup', titleAr: 'كأس تونس لكرة القدم', count: 1, years: '2020', icon: '🏆', image: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&w=400&q=80' },
  { id: 't4', title: 'Tunisian Football Super Cup', titleAr: 'كأس السوبر التونسي', count: 1, years: '2020', icon: '🏆', image: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&w=400&q=80' }
];

const USM_BLUE: ProductColor = { name: 'USM Blue', nameAr: 'أزرق الاتحاد', nameFr: 'Bleu USM', hex: '#0D63FF' };
const NAVY: ProductColor = { name: 'Navy', nameAr: 'كحلي', nameFr: 'Bleu Marine', hex: '#06152B' };
const WHITE: ProductColor = { name: 'White', nameAr: 'أبيض', nameFr: 'Blanc', hex: '#F5F7FA' };
const GOLD: ProductColor = { name: 'Gold', nameAr: 'ذهبي', nameFr: 'Doré', hex: '#0D63FF' };

export const catalogProducts: CatalogItem[] = [
  {
    id: 'p1',
    name: 'US Monastir Official Home Jersey 2025/26',
    nameAr: 'قميص الاتحاد المنستيري الرسمي الأساسي 2025/26',
    nameFr: 'Maillot Domicile Officiel US Monastir 2025/26',
    price: '85 TND',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=800&q=80'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [USM_BLUE, WHITE],
    available: true,
    category: 'Jerseys',
    collection: 'football',
    badges: ['bestseller', 'official'],
    rank: 1,
    stock: 34,
    reference: 'USM-FB-HM-2526',
    description: 'High-performance official home kit, featuring royal blue colorways and advanced aeroready tech.',
    descriptionAr: 'القميص الرسمي الأساسي عالي الأداء باللون الأزرق الملكي وشعار النادي الفاخر بتقنية التهوية الفائقة.',
    descriptionFr: 'Maillot domicile officiel haute performance, coloris bleu royal et technologie Aeroready avancée.'
  },
  {
    id: 'p2',
    name: 'US Monastir BAL Champions Tribute Hoodie',
    nameAr: 'سترة تكريم أبطال إفريقيا لكرة السلة 2022',
    nameFr: 'Sweat Hommage aux Champions BAL US Monastir',
    price: '110 TND',
    oldPrice: '139 TND',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80'],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [NAVY, GOLD],
    available: true,
    category: 'Hoodies',
    collection: 'limited',
    badges: ['limited', 'lowStock'],
    stock: 6,
    reference: 'USM-BB-BAL-HD',
    description: 'Premium limited edition hoodie celebrating our historic 2022 BAL championship victory in Kigali.',
    descriptionAr: 'سترة قطنية مريحة بإصدار محدود تحتفي بالفوز التاريخي باللقب الأفريقي لكرة السلة في كيجالي 2022.',
    descriptionFr: 'Sweat premium en édition limitée célébrant notre victoire historique au championnat BAL 2022 à Kigali.'
  },
  {
    id: 'p3',
    name: 'USM Official Ultras Supporter Scarf',
    nameAr: 'وشاح مشجعي الاتحاد المنستيري الرسمي',
    nameFr: 'Écharpe Officielle des Ultras USM',
    price: '30 TND',
    image: 'https://images.unsplash.com/photo-1641520592277-5d81a1284a16?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80'],
    sizes: ['One Size'],
    colors: [USM_BLUE],
    available: true,
    category: 'Accessories',
    collection: 'matchday',
    badges: ['bestseller'],
    rank: 2,
    stock: 120,
    reference: 'USM-ACC-SCF',
    description: 'Vibrant woven supporter scarf featuring "One City, One Heart, One Club" motto.',
    descriptionAr: 'وشاح منسوج عالي الجودة للمشجعين يحمل شعار "مدينة واحدة، قلب واحد، نادي واحد".',
    descriptionFr: 'Écharpe tissée aux couleurs du club, ornée de la devise « Une Ville, Un Cœur, Un Club ».'
  },
  {
    id: 'p4',
    name: 'Blue Ribat Supporter Cap',
    nameAr: 'قبعة مشجعي الاتحاد "الرباط الأزرق"',
    nameFr: 'Casquette Supporter « Ribat Bleu »',
    price: '35 TND',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
    sizes: ['One Size'],
    colors: [NAVY, USM_BLUE],
    available: false,
    category: 'Caps',
    collection: 'accessories',
    badges: ['soldOut'],
    stock: 0,
    reference: 'USM-ACC-CAP',
    description: 'Adjustable sport cap featuring the official club emblem embroidered in premium stitching.',
    descriptionAr: 'قبعة رياضية قابلة للتعديل تحمل شعار النادي مطرزاً بجودة عالية.',
    descriptionFr: 'Casquette de sport ajustable, écusson officiel du club brodé avec une finition premium.'
  },
  {
    id: 'p5',
    name: 'US Monastir Official Away Jersey 2025/26',
    nameAr: 'قميص الاتحاد المنستيري الرسمي الاحتياطي 2025/26',
    nameFr: 'Maillot Extérieur Officiel US Monastir 2025/26',
    price: '85 TND',
    image: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=800&q=80'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [WHITE, NAVY],
    available: true,
    category: 'Jerseys',
    collection: 'football',
    badges: ['new'],
    stock: 41,
    reference: 'USM-FB-AW-2526',
    description: 'Crisp away-day kit in ivory white with navy trims, engineered for hot Tunisian matchdays.',
    descriptionAr: 'قميص احتياطي أنيق بلون أبيض عاجي وحواف كحلية، مصمم لأجواء المباريات الحارة في تونس.',
    descriptionFr: 'Maillot extérieur blanc ivoire aux liserés bleu marine, conçu pour les journées chaudes de Tunisie.'
  },
  {
    id: 'p6',
    name: 'US Monastir Basketball Home Jersey',
    nameAr: 'قميص كرة السلة الرسمي الأساسي للاتحاد',
    nameFr: 'Maillot Domicile Basketball US Monastir',
    price: '95 TND',
    image: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1710945261882-a94b3f31b15e?auto=format&fit=crop&w=800&q=80'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [USM_BLUE, GOLD],
    available: true,
    category: 'Jerseys',
    collection: 'basketball',
    badges: ['official'],
    stock: 28,
    reference: 'USM-BB-HM-01',
    description: 'Lightweight mesh basketball jersey worn by the BAL champions on home playoff nights.',
    descriptionAr: 'قميص كرة سلة خفيف من الشبك الرياضي يرتديه أبطال الدوري الإفريقي في مباريات الديار.',
    descriptionFr: 'Maillot de basketball léger en mesh, porté par les champions du BAL lors des soirées de playoffs à domicile.'
  },
  {
    id: 'p7',
    name: 'USM Matchday Fan Flag',
    nameAr: 'علم المشجعين ليوم المباراة',
    nameFr: 'Drapeau Supporter Jour de Match',
    price: '18 TND',
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80',
    sizes: ['One Size'],
    colors: [USM_BLUE],
    available: true,
    category: 'Accessories',
    collection: 'matchday',
    badges: ['new'],
    stock: 200,
    reference: 'USM-MD-FLG',
    description: 'Hand-wavable stadium flag for the ultras end — built to survive a full 90 minutes of celebration.',
    descriptionAr: 'علم مخصص للمدرجات لتشجيع الفريق طوال 90 دقيقة من المباراة.',
    descriptionFr: 'Drapeau de stade à agiter à la main, pensé pour le kop des ultras — tient 90 minutes de fête.'
  },
  {
    id: 'p8',
    name: 'US Monastir Junior Home Kit',
    nameAr: 'الزي الرسمي الأساسي للأشبال',
    nameFr: 'Tenue Domicile Junior US Monastir',
    price: '55 TND',
    image: 'https://images.unsplash.com/photo-1522778034537-20a2486be803?auto=format&fit=crop&w=800&q=80',
    sizes: ['6-7Y', '8-9Y', '10-11Y', '12-13Y'],
    colors: [USM_BLUE],
    available: true,
    category: 'Jerseys',
    collection: 'kids',
    badges: ['new'],
    stock: 52,
    reference: 'USM-KID-HM',
    description: 'Scaled-down official home kit for the next generation of the USM family, same crest, same pride.',
    descriptionAr: 'القميص الرسمي الأساسي بمقاسات الأطفال، بنفس شعار وهوية النادي.',
    descriptionFr: 'Tenue domicile officielle aux mesures enfant pour la relève de la famille USM — même écusson, même fierté.'
  },
  {
    id: 'p9',
    name: 'BAL 2022 Anniversary Poster (Collector Print)',
    nameAr: 'ملصق تذكاري لبطولة إفريقيا 2022 (نسخة نادرة)',
    nameFr: 'Affiche Anniversaire BAL 2022 (Édition Collector)',
    price: '25 TND',
    image: 'https://images.unsplash.com/photo-1529254479751-faeedc59e78f?auto=format&fit=crop&w=800&q=80',
    sizes: ['A3', 'A2'],
    available: true,
    category: 'Accessories',
    collection: 'limited',
    badges: ['limited', 'lowStock'],
    stock: 14,
    reference: 'USM-PRT-BAL22',
    description: 'Museum-grade matte print commemorating the 2022 Basketball Africa League title run in Kigali.',
    descriptionAr: 'طبعة فنية فاخرة تخلد التتويج التاريخي بلقب الدوري الأفريقي لكرة السلة في كيجالي 2022.',
    descriptionFr: 'Tirage mat de qualité musée commémorant le titre historique de Basketball Africa League 2022 à Kigali.'
  },
  {
    id: 'p10',
    name: 'USM Training Tee',
    nameAr: 'تيشيرت التدريب الرسمي',
    nameFr: 'T-shirt d\'Entraînement USM',
    price: '40 TND',
    oldPrice: '50 TND',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [NAVY, WHITE, USM_BLUE],
    available: true,
    category: 'Hoodies',
    collection: 'football',
    badges: ['bestseller'],
    rank: 3,
    stock: 63,
    reference: 'USM-TRN-TEE',
    description: 'Breathable training tee in technical fabric, the same one the squad wears at Ben Jannet Stadium.',
    descriptionAr: 'تيشيرت تدريب بقماش تقني قابل للتهوية، هو نفسه الذي يرتديه الفريق في ملعب بن جنات.',
    descriptionFr: 'T-shirt d\'entraînement respirant en tissu technique, identique à celui porté par l\'équipe au stade Ben Jannet.'
  },
  {
    id: 'p11',
    name: 'US Monastir Beanie',
    nameAr: 'قبعة صوف الاتحاد الشتوية',
    nameFr: 'Bonnet US Monastir',
    price: '28 TND',
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=800&q=80',
    sizes: ['One Size'],
    colors: [NAVY, USM_BLUE],
    available: true,
    category: 'Caps',
    collection: 'accessories',
    stock: 47,
    reference: 'USM-ACC-BNI',
    description: 'Ribbed knit beanie for cold matchday nights at the Salle Mohamed-Mzali.',
    descriptionAr: 'قبعة صوف مضلعة لليالي المباريات الباردة في قاعة محمد المزالي.',
    descriptionFr: 'Bonnet en maille côtelée pour les soirées fraîches de match à la Salle Mohamed-Mzali.'
  },
  {
    id: 'p12',
    name: 'USM Signed Legends Jersey (Collector Edition)',
    nameAr: 'قميص موقّع من الأساطير (نسخة نادرة)',
    nameFr: 'Maillot Dédicacé des Légendes (Édition Collector)',
    price: '350 TND',
    image: 'https://images.unsplash.com/photo-1552066379-e7bfd22155c5?auto=format&fit=crop&w=800&q=80',
    sizes: ['L', 'XL'],
    colors: [USM_BLUE],
    available: true,
    category: 'Jerseys',
    collection: 'limited',
    badges: ['limited', 'lowStock', 'official'],
    stock: 3,
    reference: 'USM-COL-SGN',
    description: 'A numbered, hand-signed jersey from the 2022 BAL championship squad — one per supporter, while stocks last.',
    descriptionAr: 'قميص مرقم موقّع بخط اليد من فريق أبطال 2022، نسخة واحدة لكل مشجع وحسب توفر الكمية.',
    descriptionFr: 'Maillot numéroté, dédicacé à la main par l\'équipe championne BAL 2022 — un exemplaire par supporter, dans la limite des stocks.'
  }
];

export const supporterPacks: SupporterPack[] = [
  {
    id: 'pk1',
    name: 'Family Pack',
    nameAr: 'الحزمة العائلية',
    nameFr: 'Pack Famille',
    tagline: '2 adult jerseys + 2 kids kits, one shared colour',
    taglineAr: 'قميصان للكبار وزيّان للأطفال بنفس ألوان الفريق',
    taglineFr: '2 maillots adultes + 2 tenues enfants, une seule couleur pour toute la famille',
    price: '280 TND',
    image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=800&q=80',
    items: ['2× Home Jersey (Adult)', '2× Junior Home Kit', 'Free supporter scarf'],
    itemsAr: ['قميصان أساسيان للكبار', 'زيّان أساسيان للأطفال', 'وشاح مشجعين هدية'],
    itemsFr: ['2× Maillot Domicile (Adulte)', '2× Tenue Domicile Junior', 'Écharpe supporter offerte']
  },
  {
    id: 'pk2',
    name: 'Matchday Pack',
    nameAr: 'حزمة يوم المباراة',
    nameFr: 'Pack Jour de Match',
    tagline: 'Everything for the terraces, ready before kickoff',
    taglineAr: 'كل ما تحتاجه للمدرجات قبل صافرة البداية',
    taglineFr: 'Tout pour les gradins, prêt avant le coup d\'envoi',
    price: '95 TND',
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80',
    items: ['Fan flag', 'Ultras scarf', 'Blue Ribat cap'],
    itemsAr: ['علم المشجعين', 'وشاح الأولتراس', 'قبعة الرباط الأزرق'],
    itemsFr: ['Drapeau supporter', 'Écharpe des Ultras', 'Casquette Ribat Bleu']
  },
  {
    id: 'pk3',
    name: 'Diaspora Pack',
    nameAr: 'حزمة أحباء المهجر',
    nameFr: 'Pack Diaspora',
    tagline: 'A piece of Monastir, shipped anywhere in the world',
    taglineAr: 'قطعة من المنستير تصل إلى أي مكان في العالم',
    taglineFr: 'Un morceau de Monastir, livré partout dans le monde',
    price: '150 TND',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
    items: ['Home Jersey', 'BAL 2022 poster print', 'Supporter scarf'],
    itemsAr: ['القميص الأساسي', 'ملصق بطولة 2022', 'وشاح المشجعين'],
    itemsFr: ['Maillot Domicile', 'Affiche BAL 2022', 'Écharpe supporter']
  }
];

export const sponsorsList: Sponsor[] = [
  {
    id: 'sp1',
    name: 'Ooredoo',
    category: 'Main',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Ooredoo_logo_2017.svg',
    story: 'Ooredoo is the primary sponsor, fueling technology and stadium digitization for USM supporters.',
    storyAr: 'تعتبر أوريدو الشريك التكنولوجي والراعي الرئيسي للاتحاد، وتدعم التحول الرقمي ومبادرات الجماهير.',
    storyFr: "Ooredoo est le sponsor principal, moteur de la digitalisation technologique et du stade pour les supporters de l'USM.",
    offer: 'Get 15% discount in Ooredoo city stores presenting your USM digital supporter card.',
    offerAr: 'احصل على خصم 15٪ في مغازات أوريدو عند الاستظهار ببطاقة المشجع الرقمية للاتحاد.',
    offerFr: 'Obtenez 15% de réduction dans les boutiques Ooredoo en présentant votre carte de supporter numérique USM.',
    link: 'https://www.ooredoo.tn',
    metrics: { impressions: 145000, clicks: 12400, ctr: 8.5 }
  },
  {
    id: 'sp2',
    name: 'Délice Danone',
    category: 'Official',
    // No real Délice Danone logo file exists on Wikimedia/Commons — SponsorLogo renders a monogram fallback.
    logo: '',
    story: 'Partnering since 2018 to guarantee premium nutrition and youth development at the USM Academy.',
    storyAr: 'شريك النادي منذ 2018 لدعم التغذية السليمة وبرامج التكوين الأساسي للشباب في الأكاديمية.',
    storyFr: "Partenaire depuis 2018 pour garantir une nutrition premium et le développement des jeunes à l'Académie USM.",
    offer: 'Free nutrition guidebook access in the Youth Academy portal for all USM family members.',
    offerAr: 'دليل تغذية مجاني في بوابة أكاديمية النادي لجميع المنخرطين والمحبين.',
    offerFr: "Guide nutritionnel gratuit accessible sur le portail de l'Académie pour toute la famille USM.",
    link: 'https://www.delice.tn',
    metrics: { impressions: 98000, clicks: 5600, ctr: 5.7 }
  },
  {
    id: 'sp3',
    name: 'Tunisair',
    category: 'Official',
    logo: 'https://upload.wikimedia.org/wikipedia/en/9/97/Tunisair_logo.svg',
    story: 'The official wings of US Monastir, transporting our basketball champions across continental leagues.',
    storyAr: 'الناقل الرسمي لبعثات الاتحاد المنستيري، تحلق بأبطالنا في مختلف البطولات القارية والإفريقية.',
    storyFr: "Les ailes officielles de l'US Monastir, transportant nos champions de basketball à travers les compétitions continentales.",
    offer: 'Double fly points on flights booked to Kigali during BAL Tournament weeks.',
    offerAr: 'نقاط مضاعفة على الرحلات المتجهة إلى كيجالي خلال أسابيع منافسات الدوري الإفريقي.',
    offerFr: 'Points de fidélité doublés sur les vols vers Kigali durant les semaines du tournoi BAL.',
    link: 'https://www.tunisair.com',
    metrics: { impressions: 72000, clicks: 3200, ctr: 4.4 }
  },
  {
    id: 'sp4',
    name: 'Macron',
    category: 'Technical',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Macron_logo_horizontal_2025.svg',
    story: 'Macron provides the high-performance kits and equipment for both USM Football and Basketball sections.',
    storyAr: 'تزود ماكرون فرق كرة القدم وكرة السلة للاتحاد بأحدث الأزياء والمعدات الرياضية عالية الأداء.',
    storyFr: 'Macron fournit les tenues et équipements haute performance pour les sections Football et Basketball de USM.',
    offer: 'Get 10% off on official kits at the USM Boutique using code USM1923.',
    offerAr: 'احصل على خصم 10٪ على الأقمصة الرسمية في مغازة الاتحاد باستخدام الرمز USM1923.',
    offerFr: 'Obtenez 10% de réduction sur les tenues officielles à la Boutique USM avec le code USM1923.',
    link: 'https://www.macron.com',
    metrics: { impressions: 120000, clicks: 8900, ctr: 7.4 }
  },
  {
    id: 'sp5',
    name: 'BIAT',
    category: 'Official',
    // No real BIAT logo file exists on Wikimedia/Commons — SponsorLogo renders a monogram fallback.
    logo: '',
    story: 'BIAT is the primary financial partner of USM, powering club infrastructure and local sport community programs.',
    storyAr: 'بنك بيات هو الشريك المالي الرئيسي للاتحاد، حيث يدعم البنية التحتية للنادي والبرامج الرياضية المحلية.',
    storyFr: "La BIAT est le partenaire financier principal de l'USM, soutenant les infrastructures du club et les programmes sportifs locaux.",
    offer: 'Exclusive USM branded debit cards with special banking privileges for club members.',
    offerAr: 'بطاقات بنكية حصرية تحمل شعار الاتحاد مع امتيازات مالية خاصة لأعضاء النادي.',
    offerFr: 'Cartes bancaires exclusives aux couleurs USM avec des avantages bancaires spéciaux pour les membres du club.',
    link: 'https://www.biat.com.tn',
    metrics: { impressions: 85000, clicks: 4200, ctr: 4.9 }
  },
  {
    id: 'sp6',
    name: 'Sabrine',
    category: 'Official',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Eau_minerale_Sabrine_Tunisie.png',
    story: 'Sabrine is the official mineral water provider, keeping our athletes hydrated across all divisions.',
    storyAr: 'صبرين هي المزود الرسمي للمياه المعدنية للاتحاد، وتضمن الحفاظ على رطوبة رياضيينا في جميع الفروع.',
    storyFr: "Sabrine est le fournisseur officiel d'eau minérale, veillant à l'hydratation de nos athlètes dans toutes les sections.",
    offer: 'Sabrine hydration guide and special eco-friendly water bottles available at the official store.',
    offerAr: 'دليل ترطيب صبرين وقارورات مياه صديقة للبيئة متوفرة مجانًا في المغازة الرسمية.',
    offerFr: "Guide d'hydratation Sabrine et bouteilles éco-responsables disponibles à la boutique officielle.",
    link: 'https://www.sabrine.com.tn',
    metrics: { impressions: 65000, clicks: 2300, ctr: 3.5 }
  }
];

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'In which year was Union Sportive Monastirienne officially founded?',
    questionAr: 'في أي سنة تأسس الاتحاد الرياضي المنستيري رسمياً؟',
    options: ['1919', '1923', '1942', '1956'],
    optionsAr: ['1919', '1923', '1942', '1956'],
    answerIndex: 1, // 1923
  },
  {
    id: 'q2',
    question: 'Against which club did US Monastir win the BAL 2022 Basketball Finals in Kigali?',
    questionAr: 'ضد أي فريق فاز الاتحاد المنستيري بلقب الدوري الأفريقي لكرة السلة 2022 في كيجالي؟',
    options: ['Zamalek SC', 'Petro de Luanda', 'AS Salé', 'Cape Town Tigers'],
    optionsAr: ['الزمالك المصري', 'بترو دي لواندا الأنغولي', 'جمعية سلا المغربية', 'كيب تاون تايجرز الجنوب أفريقي'],
    answerIndex: 1, // Petro de Luanda
  },
  {
    id: 'q3',
    question: 'What major football trophies did USM win in the year 2020?',
    questionAr: 'ما هي الألقاب الكبرى التي حققها فريق كرة القدم للاتحاد في سنة 2020؟',
    options: ['Ligue 1 League Title', 'Tunisian Cup & Tunisian Super Cup', 'CAF Confederation Cup', 'Tunisian League Cup'],
    optionsAr: ['لقب البطولة الوطنية', 'كأس تونس وكأس السوبر التونسي', 'كأس الاتحاد الأفريقي', 'كأس الرابطة التونسية'],
    answerIndex: 1, // Tunisian Cup & Tunisian Super Cup
  }
];

export const standingsData = {
  football: [
    { position: 1, team: 'US Monastir', teamAr: 'الاتحاد المنستيري', played: 14, won: 9, drawn: 3, lost: 2, points: 30, goalDiff: '+12', trend: 'up' },
    { position: 2, team: 'Espérance de Tunis', teamAr: 'الترجي الرياضي', played: 14, won: 8, drawn: 5, lost: 1, points: 29, goalDiff: '+14', trend: 'down' },
    { position: 3, team: 'Club Africain', teamAr: 'النادي الإفريقي', played: 14, won: 7, drawn: 4, lost: 3, points: 25, goalDiff: '+6', trend: 'same' },
    { position: 4, team: 'Sfaxien', teamAr: 'النادي الصفاقسي', played: 14, won: 6, drawn: 5, lost: 3, points: 23, goalDiff: '+3', trend: 'up' },
    { position: 5, team: 'Étoile du Sahel', teamAr: 'النجم الساحلي', played: 14, won: 5, drawn: 6, lost: 3, points: 21, goalDiff: '+2', trend: 'down' }
  ],
  basketball: [
    { position: 1, team: 'US Monastir', teamAr: 'الاتحاد المنستيري', played: 10, won: 9, lost: 1, points: 19, pointsDiff: '+108', trend: 'same' },
    { position: 2, team: 'Club Africain Basket', teamAr: 'النادي الإفريقي', played: 10, won: 8, lost: 2, points: 18, pointsDiff: '+75', trend: 'up' },
    { position: 3, team: 'ES Radès', teamAr: 'النجم الرادسي', played: 10, won: 6, lost: 4, points: 16, pointsDiff: '+12', trend: 'down' },
    { position: 4, team: 'JS Kairouan', teamAr: 'شبيبة القيروان', played: 10, won: 5, lost: 5, points: 15, pointsDiff: '-4', trend: 'same' }
  ]
};

// ----------------------------------------------------
// ADMIN MODULES — media, academy, press, notifications, settings, pages, audit, team
// ----------------------------------------------------

export interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  caption: string;
  sport: 'football' | 'basketball' | 'club' | 'academy';
  album: string;
  date: string;
}

export const mediaItems: MediaItem[] = [
  { id: 'md1', type: 'photo', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80', caption: 'Victory celebration vs Club Africain', sport: 'football', album: 'Matchday', date: '2026-07-06' },
  { id: 'md2', type: 'photo', url: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=800&q=80', caption: 'Basketball squad training', sport: 'basketball', album: 'Training', date: '2026-07-04' },
  { id: 'md3', type: 'photo', url: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=800&q=80', caption: 'Trophy lift, BAL 2022', sport: 'club', album: 'Trophies', date: '2022-05-28' },
];

export interface PressRelease {
  id: string;
  title: string;
  date: string;
  category: string;
  content: string;
  published: boolean;
}

export const pressReleases: PressRelease[] = [
  { id: 'pr1', title: 'US Monastir renews technical partnership with Macron', date: '2026-06-20', category: 'Partnership', content: 'The club confirms a multi-year renewal of its technical kit partnership.', published: true },
];

export interface AccreditationRequest {
  id: string;
  journalistName: string;
  organization: string;
  email: string;
  phone: string;
  matchRequested: string;
  status: 'New' | 'Approved' | 'Rejected';
  notes: string;
}

export const accreditationRequests: AccreditationRequest[] = [
  { id: 'ac1', journalistName: 'Karim Bouazizi', organization: 'LTunisie Sport', email: 'karim@ltunisiesport.tn', phone: '+216 22 555 666', matchRequested: 'US Monastir vs Espérance de Tunis', status: 'New', notes: '' },
];

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  audience: 'all' | 'football' | 'basketball';
  language: 'all' | 'en' | 'fr' | 'ar';
  status: 'sent' | 'draft';
  sentAt: string;
}

export const adminNotifications: AdminNotification[] = [
  { id: 'nt1', title: 'Match Reminder', message: 'US Monastir vs Espérance kicks off in 2 hours!', audience: 'football', language: 'all', status: 'sent', sentAt: '2026-07-05T15:00:00.000Z' },
];

export interface ClubSettings {
  clubName: string;
  logoUrl: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  facebook: string;
  instagram: string;
  youtube: string;
}

export const defaultClubSettings: ClubSettings = {
  clubName: 'Union Sportive Monastirienne',
  logoUrl: '/logo.webp',
  contactEmail: 'contact@usmonastir.tn',
  contactPhone: '+216 73 462 600',
  address: 'Avenue Ibn El Jazzar, Monastir 5000, Tunisia',
  facebook: 'https://facebook.com/usmonastir',
  instagram: 'https://instagram.com/usmonastir',
  youtube: 'https://youtube.com/@usmonastir',
};

export interface HomepageSection {
  key: string;
  label: string;
  visible: boolean;
}

export const defaultHomepageSections: HomepageSection[] = [
  { key: 'hero', label: 'Cinematic Hero', visible: true },
  { key: 'today', label: 'USM Today Strip', visible: true },
  { key: 'news', label: 'Latest News Grid', visible: true },
  { key: 'standings', label: 'Standings & Palmarès Preview', visible: true },
  { key: 'spotlight', label: 'Player Spotlight & Fan Poll', visible: true },
  { key: 'catalog', label: 'Product Store Preview', visible: true },
  { key: 'newsletter', label: 'Newsletter & App Install', visible: true },
];

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  entity: string;
  timestamp: string;
}

export interface AdminTeamUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
}

export const defaultTeamUsers: AdminTeamUser[] = [
  { id: 'u1', name: 'Monastir Editor', email: 'admin@usmonastir.tn', role: 'Super Admin', status: 'Active' },
];
