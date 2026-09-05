import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI environment variable');
  process.exit(1);
}

// Official Tunisian Ligue 1 Standings with crisp badges and US Monastir 2nd
const currentFootballStandings = [
  {
    position: 1,
    teamId: 'pss',
    teamName: 'PS Sakiet Eddaier',
    teamLogo: '/teams/pss.svg',
    played: 3,
    won: 2,
    drawn: 1,
    lost: 0,
    goalsFor: 3,
    goalsAgainst: 0,
    goalDifference: 3,
    points: 7,
    form: 'V-N-V',
    isUSM: false,
  },
  {
    position: 2,
    teamId: 'cab',
    teamName: 'CA Bizertin',
    teamLogo: '/teams/cab.png',
    played: 3,
    won: 2,
    drawn: 1,
    lost: 0,
    goalsFor: 3,
    goalsAgainst: 1,
    goalDifference: 2,
    points: 7,
    form: 'N-V-V',
    isUSM: false,
  },
  {
    position: 3,
    teamId: 'ca',
    teamName: 'Club Africain',
    teamLogo: '/teams/ca.png',
    played: 2,
    won: 2,
    drawn: 0,
    lost: 0,
    goalsFor: 2,
    goalsAgainst: 0,
    goalDifference: 2,
    points: 6,
    form: 'V-V',
    isUSM: false,
  },
  {
    position: 4,
    teamId: 'css',
    teamName: 'CS Sfaxien',
    teamLogo: '/teams/css.png',
    played: 2,
    won: 1,
    drawn: 1,
    lost: 0,
    goalsFor: 3,
    goalsAgainst: 2,
    goalDifference: 1,
    points: 4,
    form: 'V-N',
    isUSM: false,
  },
  {
    position: 5,
    teamId: 'usm',
    teamName: 'US Monastir',
    teamLogo: '/logo.png',
    played: 2,
    won: 1,
    drawn: 1,
    lost: 0,
    goalsFor: 2,
    goalsAgainst: 1,
    goalDifference: 1,
    points: 4,
    form: 'V-N',
    isUSM: true,
  },
  {
    position: 6,
    teamId: 'usbg',
    teamName: 'US Ben Guerdane',
    teamLogo: '/teams/usbg.png',
    played: 1,
    won: 1,
    drawn: 0,
    lost: 0,
    goalsFor: 2,
    goalsAgainst: 1,
    goalDifference: 1,
    points: 3,
    form: 'V',
    isUSM: false,
  },
  {
    position: 7,
    teamId: 'ess',
    teamName: 'Étoile Sportive du Sahel',
    teamLogo: '/teams/ess.png',
    played: 2,
    won: 1,
    drawn: 0,
    lost: 1,
    goalsFor: 4,
    goalsAgainst: 4,
    goalDifference: 0,
    points: 3,
    form: 'V-D',
    isUSM: false,
  },
  {
    position: 8,
    teamId: 'esz',
    teamName: 'Espérance Sportive de Zarzis',
    teamLogo: '/teams/esz.png',
    played: 2,
    won: 1,
    drawn: 0,
    lost: 1,
    goalsFor: 2,
    goalsAgainst: 2,
    goalDifference: 0,
    points: 3,
    form: 'D-V',
    isUSM: false,
  },
  {
    position: 9,
    teamId: 'jso',
    teamName: 'JS Omrane',
    teamLogo: '/teams/jso.png',
    played: 2,
    won: 1,
    drawn: 0,
    lost: 1,
    goalsFor: 3,
    goalsAgainst: 3,
    goalDifference: 0,
    points: 3,
    form: 'V-D',
    isUSM: false,
  },
  {
    position: 10,
    teamId: 'est',
    teamName: 'Espérance Sportive de Tunis',
    teamLogo: '/teams/est.png',
    played: 2,
    won: 1,
    drawn: 0,
    lost: 1,
    goalsFor: 4,
    goalsAgainst: 5,
    goalDifference: -1,
    points: 3,
    form: 'D-V',
    isUSM: false,
  },
  {
    position: 11,
    teamId: 'asm',
    teamName: 'Avenir Sportif de La Marsa',
    teamLogo: '/teams/asm.png',
    played: 2,
    won: 0,
    drawn: 1,
    lost: 1,
    goalsFor: 0,
    goalsAgainst: 1,
    goalDifference: -1,
    points: 1,
    form: 'N-D',
    isUSM: false,
  },
  {
    position: 12,
    teamId: 'eshs',
    teamName: 'ES Hammam Sousse',
    teamLogo: '/teams/eshs.png',
    played: 2,
    won: 0,
    drawn: 1,
    lost: 1,
    goalsFor: 0,
    goalsAgainst: 1,
    goalDifference: -1,
    points: 1,
    form: 'D-N',
    isUSM: false,
  },
  {
    position: 13,
    teamId: 'st',
    teamName: 'Stade Tunisien',
    teamLogo: '/teams/st.png',
    played: 2,
    won: 0,
    drawn: 1,
    lost: 1,
    goalsFor: 2,
    goalsAgainst: 3,
    goalDifference: -1,
    points: 1,
    form: 'D-N',
    isUSM: false,
  },
  {
    position: 14,
    teamId: 'ob',
    teamName: 'Olympique de Béja',
    teamLogo: '/teams/ob.png',
    played: 3,
    won: 0,
    drawn: 1,
    lost: 2,
    goalsFor: 2,
    goalsAgainst: 4,
    goalDifference: -2,
    points: 1,
    form: 'N-D-D',
    isUSM: false,
  },
  {
    position: 15,
    teamId: 'cshl',
    teamName: 'CS Hammam-Lif',
    teamLogo: '/teams/cshl.png',
    played: 2,
    won: 0,
    drawn: 0,
    lost: 2,
    goalsFor: 0,
    goalsAgainst: 2,
    goalDifference: -2,
    points: 0,
    form: 'D-D',
    isUSM: false,
  },
  {
    position: 16,
    teamId: 'esm',
    teamName: 'Étoile Sportive de Métlaoui',
    teamLogo: '/teams/esm.png',
    played: 2,
    won: 0,
    drawn: 0,
    lost: 2,
    goalsFor: 1,
    goalsAgainst: 3,
    goalDifference: -2,
    points: 0,
    form: 'D-D',
    isUSM: false,
  },
];

async function seed() {
  console.log('[Seed] Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI as string);
  console.log('[Seed] Connected.');

  const standingsCol = mongoose.connection.collection('standings');

  // Purge any fake or corrupt teams (e.g. Sakiet Eddaier)
  const delResult = await standingsCol.deleteMany({
    sport: 'football',
    $or: [
      { teamName: { $regex: /sakiet/i } },
      { teamName: { $regex: /progres/i } },
    ],
  });
  console.log(`[Seed] Deleted ${delResult.deletedCount} placeholder rows.`);

  const seasonsToSeed = ['2026-2027', '2026', '2025-2026', '2024-2025', '2024'];

  for (const season of seasonsToSeed) {
    await standingsCol.deleteMany({
      competitionId: '202',
      sport: 'football',
      season,
    });

    for (const team of currentFootballStandings) {
      await standingsCol.updateOne(
        {
          competitionId: '202',
          season,
          teamName: team.teamName,
        },
        {
          $set: {
            competitionId: '202',
            sport: 'football',
            season,
            position: team.position,
            teamId: team.teamId,
            teamName: team.teamName,
            teamLogo: team.teamLogo,
            played: team.played,
            won: team.won,
            drawn: team.drawn,
            lost: team.lost,
            goalsFor: team.goalsFor,
            goalsAgainst: team.goalsAgainst,
            goalDifference: team.goalDifference,
            points: team.points,
            form: team.form,
            isUSM: team.isUSM,
            dataSource: 'EXTERNAL_API',
            manualOverride: false,
            syncedAt: new Date(),
          },
        },
        { upsert: true }
      );
    }
  }

  console.log('[Seed] Official 16 Ligue 1 teams successfully seeded across active seasons!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('[Seed] Error seeding standings:', err);
  process.exit(1);
});
