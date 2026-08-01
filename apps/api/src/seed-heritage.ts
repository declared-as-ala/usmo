/**
 * One-shot: wipe and seed HistoryPage, TimelineEvent, Trophy, and SeasonPerformance
 * collections with real content sourced from "Presentation US Monastir 2025.pdf".
 * Run with: npx tsx apps/api/src/seed-heritage.ts
 *
 * No image URLs are hotlinked here — the PDF's own photos aren't available as
 * standalone files, and guessing external image URLs is explicitly avoided.
 * Admins can attach real photos later via the Media Library on each record.
 */
import 'dotenv/config';
import mongoose, { Schema, model } from 'mongoose';

const historyPageSchema = new Schema({
  key: { type: String, unique: true, default: 'history' },
  heroTitle: String,
  heroSubtitle: String,
  heroImage: String,
  cityIntro: String,
  foundationText: String,
  footballStory: String,
  basketballStory: String,
  values: [String],
  evolutionFootball: String,
  evolutionBasketball: String,
  seoTitle: String,
  seoDescription: String,
  status: { type: String, default: 'published' },
}, { timestamps: true });

const timelineEventSchema = new Schema({
  year: String, date: String, title: String, description: String,
  sport: { type: String, enum: ['club', 'football', 'basketball', 'city'] },
  image: String, icon: String,
  isHighlighted: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 },
  status: { type: String, default: 'published' },
}, { timestamps: true });

const trophySchema = new Schema({
  sport: { type: String, enum: ['football', 'basketball'] },
  competition: String,
  achievementType: { type: String, enum: ['Winner', 'Runner-up', 'Champion', 'Podium', 'Participation'] },
  titleCount: Number, years: String, season: String, description: String, remarks: String,
  icon: String, image: String,
  isFeatured: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 },
  verified: { type: Boolean, default: true },
  sourceNote: String,
  status: { type: String, default: 'published' },
}, { timestamps: true });

const seasonPerformanceSchema = new Schema({
  sport: { type: String, enum: ['football', 'basketball'] },
  type: { type: String, enum: ['league', 'continental'] },
  season: String, competition: String, leaguePosition: String,
  nationalCompetitions: String, internationalCompetitions: String,
  stageReached: String, notableOpponents: String, achievementSummary: String, notes: String,
  displayOrder: { type: Number, default: 0 },
  verified: { type: Boolean, default: true },
  status: { type: String, default: 'published' },
}, { timestamps: true });

const HistoryPageModel = model('HistoryPage', historyPageSchema);
const TimelineEventModel = model('TimelineEvent', timelineEventSchema);
const TrophyModel = model('Trophy', trophySchema);
const SeasonPerformanceModel = model('SeasonPerformance', seasonPerformanceSchema);

const historyContent = {
  key: 'history',
  heroTitle: 'Histoire de l’US Monastir',
  heroSubtitle: 'Depuis 1923, une institution sportive, culturelle et populaire au cœur de Monastir.',
  heroImage: '/fans.png',
  cityIntro: 'Monastir est une péninsule vibrante sur la Méditerranée, réputée pour son Ribat historique, sa médina et sa marina. Ville natale d’Habib Bourguiba, elle allie près d’un siècle d’histoire à une économie moderne — textile, tourisme et une université de premier plan — tout en cultivant une identité sportive forte.',
  foundationText: 'L’Union Sportive Monastirienne est officiellement fondée le 17 mars 1923, par décret royal sous le protectorat français. Le club dépasse rapidement son rôle sportif pour devenir un symbole culturel et social de Monastir, témoin des grandes étapes de l’histoire tunisienne, de la période coloniale à l’indépendance menée par Habib Bourguiba, natif de la ville.',
  footballStory: 'La section football évolue au Stade Mustapha Ben Jannet (20 000 à 25 000 places), sous les couleurs bleu et blanc. Après une finale perdue en 2009, l’USM décroche en 2020 son premier grand trophée : la Coupe de Tunisie, complétée par la Super Coupe la même année — ouvrant la voie aux compétitions africaines. Depuis, le club s’est imposé comme l’un des plus compétitifs de Tunisie, avec deux 2e places lors des saisons 2023-2024 et 2024-2025.',
  basketballStory: 'La section basketball est l’une des plus titrées de Tunisie, du monde arabe et d’Afrique : 9 titres de champion de Tunisie, 6 Coupes de Tunisie, et surtout le sacre continental de 2022 en Basketball Africa League (BAL), la compétition phare créée par la NBA et la FIBA. L’USM est aussi l’ossature de l’équipe nationale tunisienne, elle-même championne d’Afrique en 2017 et 2021.',
  values: ['Persévérance', 'Unité', 'Ambition', 'Résilience', 'Esprit de communauté', 'Jeunesse', 'Excellence'],
  evolutionFootball: 'Après un siècle d’histoire, la section football s’est imposée comme un prétendant régulier au sommet de la Ligue 1 tunisienne, représentant Monastir et la Tunisie dans les compétitions de la CAF.',
  evolutionBasketball: 'Joyau du sport tunisien, la section basketball est championne d’Afrique (BAL 2022) et domine la scène nationale depuis six ans, tout en formant l’ossature de l’équipe nationale, elle-même leader en Afrique et dans le monde arabe.',
  seoTitle: 'Histoire de l’US Monastir — Un siècle de passion depuis 1923',
  seoDescription: 'Découvrez l’histoire de l’Union Sportive Monastirienne : fondation en 1923, exploits en football et basketball, et un siècle de fierté pour Monastir.',
  status: 'published',
};

const timelineEvents = [
  { year: '1923', title: 'Fondation de l’USM', sport: 'club', isHighlighted: true, displayOrder: 1,
    description: 'Le club est officiellement fondé le 17 mars 1923 par décret royal sous le protectorat français, et devient rapidement plus qu’une institution sportive : un symbole culturel et social pour Monastir.' },
  { year: '1923–1956', title: 'Un symbole culturel et social', sport: 'club', displayOrder: 2,
    description: 'À travers les grandes étapes de l’histoire tunisienne, de l’époque coloniale à l’indépendance menée par Habib Bourguiba, natif de Monastir, le club incarne la persévérance, l’unité et l’ambition.' },
  { year: '2009', title: 'Finaliste de la Coupe de Tunisie', sport: 'football', displayOrder: 3,
    description: 'L’USM s’incline en finale de la Coupe de Tunisie, une première étape vers la consécration de 2020.' },
  { year: '2018–2019', title: 'Champion de Tunisie de basketball', sport: 'basketball', displayOrder: 4,
    description: 'Première étape d’une nouvelle ère dorée pour la section basketball.' },
  { year: '2020', title: 'Coupe de Tunisie : premier sacre historique', sport: 'football', isHighlighted: true, displayOrder: 5,
    description: 'L’USM remporte la Coupe de Tunisie pour la première fois de son histoire, ouvrant la voie aux compétitions continentales.' },
  { year: '2020', title: 'Super Coupe de Tunisie', sport: 'football', displayOrder: 6,
    description: 'Le club complète un doublé historique en remportant également la Super Coupe.' },
  { year: '2021', title: 'Finaliste de la BAL', sport: 'basketball', displayOrder: 7,
    description: 'L’USM atteint sa première finale continentale de Basketball Africa League.' },
  { year: '2022', title: 'Champion d’Afrique (BAL)', sport: 'basketball', isHighlighted: true, displayOrder: 8,
    description: 'L’Union Sportive Monastirienne devient championne d’Afrique en battant Petro de Luanda 83–72, un sacre continental historique pour Monastir.' },
  { year: '2024', title: 'Super Coupe de Tunisie de basketball', sport: 'basketball', displayOrder: 9,
    description: 'Nouveau titre national, symbole de la suprématie du club.' },
  { year: '2024–2025', title: 'Une des meilleures saisons de l’histoire', sport: 'football', displayOrder: 10,
    description: 'Le club termine à la 2e place de la Ligue Professionnelle 1, confirmant son statut de puissance montante.' },
  { year: '2025', title: '5e participation consécutive en BAL', sport: 'basketball', displayOrder: 11,
    description: 'L’USM confirme son rang parmi l’élite du basketball africain.' },
  { year: '2025+', title: 'Un club en constante évolution', sport: 'club', displayOrder: 12,
    description: 'Fort de plus d’un siècle d’histoire, l’USM poursuit son ambition entre performance sportive, rayonnement africain et exigence de modernité.' },
];

const trophies = [
  { sport: 'football', competition: 'Coupe de Tunisie', achievementType: 'Winner', titleCount: 1, years: '2020',
    description: 'Premier trophée majeur de l’histoire du club, ouvrant la voie aux compétitions africaines.', isFeatured: true, displayOrder: 1 },
  { sport: 'football', competition: 'Coupe de Tunisie', achievementType: 'Runner-up', titleCount: 1, years: '2009',
    description: 'Première finale de Coupe de Tunisie du club.', displayOrder: 2 },
  { sport: 'football', competition: 'Super Coupe de Tunisie', achievementType: 'Winner', titleCount: 1, years: '2020',
    description: 'Doublé historique la même année que la Coupe de Tunisie.', isFeatured: true, displayOrder: 3 },
  { sport: 'basketball', competition: 'Championnat de Tunisie', achievementType: 'Winner', titleCount: 9,
    years: '2019, 2020, 2021, 2022, 2023, 2024 et titres antérieurs', description: 'Record national de domination.', isFeatured: true, displayOrder: 4 },
  { sport: 'basketball', competition: 'Coupe de Tunisie', achievementType: 'Winner', titleCount: 6,
    years: '2020, 2021, 2022, 2023, 2025 et un titre antérieur', description: 'Succès domestique constant.', displayOrder: 5 },
  { sport: 'basketball', competition: 'Super Coupe de Tunisie', achievementType: 'Winner', titleCount: 1, years: '2024',
    description: 'Symbole de la suprématie nationale.', displayOrder: 6 },
  { sport: 'basketball', competition: 'Basketball Africa League (BAL)', achievementType: 'Champion', titleCount: 1, years: '2022',
    description: 'Sommet du basketball africain : l’USM bat Petro de Luanda 83–72 en finale.', isFeatured: true, displayOrder: 7 },
  { sport: 'basketball', competition: 'Basketball Africa League (BAL)', achievementType: 'Runner-up', titleCount: 1, years: '2021',
    description: 'Première finale continentale de l’histoire du club.', displayOrder: 8,
    verified: false, sourceNote: 'Le document source présente le tableau des honneurs BAL avec une ambiguïté sur l’année exacte de la finale perdue (2021 vs 2022) — à confirmer avant publication.' },
  { sport: 'basketball', competition: 'FIBA Africa Clubs Champions Cup / Arab Club Championships', achievementType: 'Podium', titleCount: 0,
    years: 'Plusieurs éditions', description: 'Performances continentales solides et régulières.', displayOrder: 9 },
];

const seasonPerformances = [
  // Football — domestic league
  { sport: 'football', type: 'league', season: '2019–2020', leaguePosition: '3e place', displayOrder: 1,
    achievementSummary: 'Qualification historique pour les compétitions africaines pour la première fois' },
  { sport: 'football', type: 'league', season: '2020–2021', leaguePosition: 'Milieu de tableau haut', displayOrder: 2,
    achievementSummary: 'Présence consolidée en Ligue 1' },
  { sport: 'football', type: 'league', season: '2021–2022', leaguePosition: '2e place', displayOrder: 3,
    achievementSummary: 'Maintien parmi les clubs tunisiens les plus forts' },
  { sport: 'football', type: 'league', season: '2022–2023', leaguePosition: '4e place', displayOrder: 4,
    achievementSummary: 'Nouvelle qualification pour les tournois africains' },
  { sport: 'football', type: 'league', season: '2023–2024', leaguePosition: '2e place', displayOrder: 5,
    achievementSummary: 'Un des meilleurs bilans de l’histoire du club' },
  { sport: 'football', type: 'league', season: '2024–2025', leaguePosition: '2e place', displayOrder: 6,
    achievementSummary: 'Performance d’élite maintenue en Ligue Professionnelle 1' },
  // Football — continental (CAF)
  { sport: 'football', type: 'continental', season: '2020–2021', competition: 'CAF Confederation Cup', displayOrder: 1,
    stageReached: 'Tour des barrages (Playoff Round)', notableOpponents: 'Raja Casablanca (Maroc)' },
  { sport: 'football', type: 'continental', season: '2022–2023', competition: 'CAF Champions League → Confederation Cup', displayOrder: 2,
    stageReached: 'Quarts de finale (Confederation Cup)', notableOpponents: 'Al Ahly (Égypte) en Champions League, puis ASEC Mimosas (Côte d’Ivoire) en quarts' },
  { sport: 'football', type: 'continental', season: '2024–2025', competition: 'CAF Champions League', displayOrder: 3,
    stageReached: '2e tour', notableOpponents: 'Élimination du MC Alger (Algérie) en préliminaires, sortie au 2e tour' },
  { sport: 'football', type: 'continental', season: '2025–2026', competition: 'CAF Champions League', displayOrder: 4,
    stageReached: 'Tours préliminaires', notableOpponents: 'Participation aux premiers tours' },
  // Basketball — national + international combined per season
  { sport: 'basketball', type: 'league', season: '2018–2019', nationalCompetitions: 'Champion de Tunisie', internationalCompetitions: '—', displayOrder: 1,
    achievementSummary: 'Première étape d’une nouvelle ère dorée' },
  { sport: 'basketball', type: 'league', season: '2019–2020', nationalCompetitions: 'Champion + Coupe', internationalCompetitions: '—', displayOrder: 2,
    achievementSummary: 'Doublé national dominant' },
  { sport: 'basketball', type: 'league', season: '2020–2021', nationalCompetitions: 'Champion + Coupe', internationalCompetitions: 'BAL – Finaliste', displayOrder: 3,
    achievementSummary: 'Succès national confirmé, finaliste continental' },
  { sport: 'basketball', type: 'league', season: '2021–2022', nationalCompetitions: 'Champion + Coupe', internationalCompetitions: 'BAL – Champion', displayOrder: 4,
    achievementSummary: 'Titre africain historique pour Monastir' },
  { sport: 'basketball', type: 'league', season: '2022–2023', nationalCompetitions: 'Champion + Coupe', internationalCompetitions: 'BAL – Phase de groupes', displayOrder: 5,
    achievementSummary: 'Domination nationale maintenue, participation continentale' },
  { sport: 'basketball', type: 'league', season: '2023–2024', nationalCompetitions: 'Champion + Super Coupe', internationalCompetitions: 'BAL – Quarts de finale', displayOrder: 6,
    achievementSummary: 'Solide performance nationale et continentale' },
  { sport: 'basketball', type: 'league', season: '2024–2025', nationalCompetitions: 'Vice-champion + Coupe', internationalCompetitions: 'BAL – Playoffs', displayOrder: 7,
    achievementSummary: '5e participation consécutive en BAL, parmi l’élite africaine' },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI not set'); process.exit(1); }

  await mongoose.connect(uri);
  console.log('[seed-heritage] Connected to MongoDB');

  await HistoryPageModel.deleteMany({});
  await HistoryPageModel.create(historyContent);
  console.log('[seed-heritage] History page content seeded');

  await TimelineEventModel.deleteMany({});
  const insertedEvents = await TimelineEventModel.insertMany(timelineEvents);
  console.log(`[seed-heritage] Inserted ${insertedEvents.length} timeline events`);

  await TrophyModel.deleteMany({});
  const insertedTrophies = await TrophyModel.insertMany(trophies);
  console.log(`[seed-heritage] Inserted ${insertedTrophies.length} trophies`);

  await SeasonPerformanceModel.deleteMany({});
  const insertedSeasons = await SeasonPerformanceModel.insertMany(seasonPerformances);
  console.log(`[seed-heritage] Inserted ${insertedSeasons.length} season performance rows`);

  await mongoose.disconnect();
  console.log('[seed-heritage] Done ✅');
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
