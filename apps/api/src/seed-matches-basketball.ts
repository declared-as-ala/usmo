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
    awayTeam: 'JS Kairouan',
    awayTeamAr: 'الجمعية الرياضية القيروانية',
    date: '2026-03-29',
    time: '17:00',
    venue: 'Salle Mohamed Mzali, Monastir',
    venueAr: 'قاعة محمد مزالي، المنستير',
    status: 'finished',
    score: { home: 78, away: 75 },
  },
  {
    sport: 'basketball',
    competition: 'Super Play-off Pro A — Finale (Match 2)',
    competitionAr: 'نهائي السوبر بلاي أوف بطولة تونس المحترفة أ (المباراة 2)',
    season: '2025/26',
    homeTeam: 'US Monastir',
    homeTeamAr: 'الاتحاد الرياضي المنستيري',
    awayTeam: 'JS Kairouan',
    awayTeamAr: 'الجمعية الرياضية القيروانية',
    date: '2026-04-02',
    time: '17:00',
    venue: 'Salle Mohamed Mzali, Monastir',
    venueAr: 'قاعة محمد مزالي، المنستير',
    status: 'finished',
    score: { home: 71, away: 69 },
  },
  {
    sport: 'basketball',
    competition: 'Super Play-off Pro A — Finale (Match 3, titre)',
    competitionAr: 'نهائي السوبر بلاي أوف بطولة تونس المحترفة أ (المباراة 3، اللقب)',
    season: '2025/26',
    homeTeam: 'JS Kairouan',
    homeTeamAr: 'الجمعية الرياضية القيروانية',
    awayTeam: 'US Monastir',
    awayTeamAr: 'الاتحاد الرياضي المنستيري',
    date: '2026-04-05',
    time: '17:00',
    venue: 'Salle Aziz Miled, Kairouan',
    venueAr: 'قاعة عزيز ميلاد، القيروان',
    status: 'finished',
    score: { home: 76, away: 78 },
  },
];

async function bootstrap() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/usmo';
  await mongoose.connect(uri);
  console.log('[seed-matches-basketball] Connected to MongoDB');

  let inserted = 0;
  for (const m of matches) {
    const baseSlug = slugify(`${m.homeTeam}-vs-${m.awayTeam}-${m.date}`);
    const exists = await MatchModel.findOne({ slug: baseSlug });
    if (exists) {
      console.log(`[seed-matches-basketball] Skipping (already exists): ${baseSlug}`);
      continue;
    }
    await MatchModel.create({ ...m, slug: baseSlug });
    inserted++;
    console.log(`[seed-matches-basketball] Inserted: ${baseSlug} (${m.score.home}-${m.score.away})`);
  }

  console.log(`[seed-matches-basketball] Done — ${inserted} new match(es) inserted ✅`);
  await mongoose.disconnect();
}

bootstrap().catch((err) => {
  console.error('[seed-matches-basketball] Failed:', err);
  process.exit(1);
});
