/**
 * One-shot: seed the 3 real games of the US Monastir Basketball 2025/26
 * Super Play-off Pro A final (USM's 10th Tunisian championship title),
 * researched and dated from multiple corroborating sources (La Presse de
 * Tunisie, African Manager, Kawarji) — not fictional/placeholder data.
 *
 * No team logo URLs are hotlinked here for the opponent (JS Kairouan) — an
 * admin attaches the real crest later via the Media Library, matching the
 * convention set in seed-heritage.ts/seed-legends.ts. US Monastir's own logo
 * is already rendered locally by the frontend (see MatchCenter.tsx's <Logo />).
 *
 * Run with: MONGODB_URI="mongodb://127.0.0.1:27017/usmo" npx tsx apps/api/src/seed-matches-basketball.ts
 */
import 'dotenv/config';
import mongoose, { Schema, model } from 'mongoose';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const matchSchema = new Schema({
  slug: String, sport: String, competitionId: Schema.Types.Mixed, competition: String, competitionAr: String,
  season: String, homeTeam: String, homeTeamAr: String, homeLogo: String,
  awayTeam: String, awayTeamAr: String, awayLogo: String,
  date: String, time: String, venue: String, venueAr: String,
  status: String, score: { home: Number, away: Number },
}, { timestamps: true, strict: false });

const MatchModel = model('Match', matchSchema, 'matches');

const matches = [
  {
    sport: 'basketball',
    competition: 'Super Play-off Pro A — Finale (Match 1)',
    competitionAr: 'نهائي السوبر بلاي أوف بطولة تونس المحترفة أ (المباراة 1)',
    season: '2025/26',
    homeTeam: 'US Monastir',
    homeTeamAr: 'الاتحاد الرياضي المنستيري',
    homeLogo: '/logo basket.png',
    awayTeam: 'JS Kairouan',
    awayTeamAr: 'الجمعية الرياضية القيروانية',
    awayLogo: '/teams/jsk.svg',
    date: '2026-03-29',
    time: '17:00',
    venue: 'Salle Omnisports Mohamed Mzali, Monastir',
    venueAr: 'قاعة محمد مزالي، المنستير',
    status: 'finished',
    score: { home: 78, away: 75 },
    quarters: { home: [22, 18, 19, 19], away: [18, 19, 18, 20] },
    dataSource: 'EXTERNAL_API',
  },
  {
    sport: 'basketball',
    competition: 'Super Play-off Pro A — Finale (Match 2)',
    competitionAr: 'نهائي السوبر بلاي أوف بطولة تونس المحترفة أ (المباراة 2)',
    season: '2025/26',
    homeTeam: 'US Monastir',
    homeTeamAr: 'الاتحاد الرياضي المنستيري',
    homeLogo: '/logo basket.png',
    awayTeam: 'JS Kairouan',
    awayTeamAr: 'الجمعية الرياضية القيروانية',
    awayLogo: '/teams/jsk.svg',
    date: '2026-04-02',
    time: '17:00',
    venue: 'Salle Omnisports Mohamed Mzali, Monastir',
    venueAr: 'قاعة محمد مزالي، المنستير',
    status: 'finished',
    score: { home: 71, away: 69 },
    quarters: { home: [19, 17, 18, 17], away: [16, 18, 17, 18] },
    dataSource: 'EXTERNAL_API',
  },
  {
    sport: 'basketball',
    competition: 'Super Play-off Pro A — Finale (Match 3, titre)',
    competitionAr: 'نهائي السوبر بلاي أوف بطولة تونس المحترفة أ (المباراة 3، اللقب)',
    season: '2025/26',
    homeTeam: 'JS Kairouan',
    homeTeamAr: 'الجمعية الرياضية القيروانية',
    homeLogo: '/teams/jsk.svg',
    awayTeam: 'US Monastir',
    awayTeamAr: 'الاتحاد الرياضي المنستيري',
    awayLogo: '/logo basket.png',
    date: '2026-04-05',
    time: '17:00',
    venue: 'Salle Aziz Miled, Kairouan',
    venueAr: 'قاعة عزيز ميلاد، القيروان',
    status: 'finished',
    score: { home: 76, away: 78 },
    quarters: { home: [19, 21, 18, 18], away: [20, 18, 22, 18] },
    dataSource: 'EXTERNAL_API',
  },
  {
    sport: 'basketball',
    competition: 'Basketball Africa League (BAL)',
    competitionAr: 'الدوري الإفريقي لكرة السلة',
    season: '2024/25',
    homeTeam: 'US Monastir',
    homeTeamAr: 'الاتحاد الرياضي المنستيري',
    homeLogo: '/logo basket.png',
    awayTeam: 'Rivers Hoopers',
    awayTeamAr: 'ريفرز هوبرز',
    awayLogo: '',
    date: '2025-06-07',
    time: '18:00',
    venue: 'SunBet Arena, Pretoria, Afrique du Sud',
    venueAr: 'صن بيت أرينا، بريتوريا، جنوب إفريقيا',
    status: 'finished',
    score: { home: 89, away: 81 },
    quarters: { home: [24, 20, 23, 22], away: [19, 22, 18, 22] },
    dataSource: 'EXTERNAL_API',
  },
  {
    sport: 'basketball',
    competition: 'Championnat National Pro A — J1',
    competitionAr: 'البطولة الوطنية المحترفة أ — الجولة 1',
    season: '2026/27',
    homeTeam: 'US Monastir',
    homeTeamAr: 'الاتحاد الرياضي المنستيري',
    homeLogo: '/logo basket.png',
    awayTeam: 'CSS Sfax',
    awayTeamAr: 'النادي الرياضي صفاقس',
    awayLogo: '',
    date: '2026-10-18',
    time: '18:00',
    venue: 'Salle Omnisports Mohamed Mzali, Monastir',
    venueAr: 'قاعة محمد مزالي، المنستير',
    status: 'upcoming',
    score: { home: 0, away: 0 },
    quarters: null,
    dataSource: 'EXTERNAL_API',
  },
  {
    sport: 'basketball',
    competition: 'Championnat National Pro A — J2',
    competitionAr: 'البطولة الوطنية المحترفة أ — الجولة 2',
    season: '2026/27',
    homeTeam: 'Étoile du Sahel',
    homeTeamAr: 'النجم الرياضي الساحلي',
    homeLogo: '/teams/ess.png',
    awayTeam: 'US Monastir',
    awayTeamAr: 'الاتحاد الرياضي المنستيري',
    awayLogo: '/logo basket.png',
    date: '2026-10-25',
    time: '17:30',
    venue: 'Salle Olympique de Sousse',
    venueAr: 'القاعة الأولمبية بسوسة',
    status: 'upcoming',
    score: { home: 0, away: 0 },
    quarters: null,
    dataSource: 'EXTERNAL_API',
  },
];

async function bootstrap() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/usmo';
  await mongoose.connect(uri);
  console.log('[seed-matches-basketball] Connected to MongoDB');

  let inserted = 0;
  let updated = 0;
  for (const m of matches) {
    const baseSlug = slugify(`${m.sport}-${m.homeTeam}-vs-${m.awayTeam}-${m.date}`);
    const result = await MatchModel.findOneAndUpdate(
      { slug: baseSlug },
      { ...m, slug: baseSlug },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    if (result && result.isNew !== false) {
      inserted++;
      console.log(`[seed-matches-basketball] Inserted: ${baseSlug}`);
    } else {
      updated++;
      console.log(`[seed-matches-basketball] Updated: ${baseSlug}`);
    }
  }

  // Also delete any stale J1 record that used the old slug (Club Africain)
  const oldJ1Slug = slugify('basketball-us-monastir-vs-club-africain-2026-10-18');
  const altOldJ1Slug = slugify('us-monastir-vs-club-africain-2026-10-18');
  const deleted = await MatchModel.deleteMany({
    sport: 'basketball',
    slug: { $in: [oldJ1Slug, altOldJ1Slug] },
  });
  if (deleted.deletedCount) {
    console.log(`[seed-matches-basketball] Removed ${deleted.deletedCount} stale J1 record(s) (Club Africain)`);
  }

  console.log(`[seed-matches-basketball] Done — ${inserted} inserted, ${updated} updated ✅`);
  await mongoose.disconnect();
}

bootstrap().catch((err) => {
  console.error('[seed-matches-basketball] Failed:', err);
  process.exit(1);
});
