import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI environment variable');
  process.exit(1);
}

// Current official 2026-2027 Ligue 1 Standings with local crisp team badges
const currentFootballStandings2026_2027 = [
  {
    position: 1,
    teamId: 'ps-sakiet-eddaier',
    teamName: 'PS Sakiet Eddaier',
    teamLogo: '/teams/pss.svg',
    played: 1,
    won: 1,
    drawn: 0,
    lost: 0,
    goalsFor: 2,
    goalsAgainst: 0,
    goalDifference: 2,
    points: 3,
    form: 'V',
    isUSM: false,
  },
  {
    position: 2,
    teamId: '988',
    teamName: 'Espérance Sportive de Tunis',
    teamLogo: '/teams/est.png',
    played: 1,
    won: 1,
    drawn: 0,
    lost: 0,
    goalsFor: 3,
    goalsAgainst: 2,
    goalDifference: 1,
    points: 3,
    form: 'V',
    isUSM: false,
  },
  {
    position: 3,
    teamId: '987',
    teamName: 'Club Africain',
    teamLogo: '/teams/ca.png',
    played: 1,
    won: 1,
    drawn: 0,
    lost: 0,
    goalsFor: 1,
    goalsAgainst: 0,
    goalDifference: 1,
    points: 3,
    form: 'V',
    isUSM: false,
  },
  {
    position: 4,
    teamId: '990',
    teamName: 'Club Athlétique Bizertin',
    teamLogo: '/teams/cab.png',
    played: 1,
    won: 1,
    drawn: 0,
    lost: 0,
    goalsFor: 1,
    goalsAgainst: 0,
    goalDifference: 1,
    points: 3,
    form: 'V',
    isUSM: false,
  },
  {
    position: 5,
    teamId: '996',
    teamName: 'Espérance Sportive de Zarzis',
    teamLogo: '/teams/esz.png',
    played: 1,
    won: 1,
    drawn: 0,
    lost: 0,
    goalsFor: 1,
    goalsAgainst: 0,
    goalDifference: 1,
    points: 3,
    form: 'V',
    isUSM: false,
  },
  {
    position: 6,
    teamId: '989',
    teamName: 'Club Sportif Sfaxien',
    teamLogo: '/teams/css.png',
    played: 1,
    won: 0,
    drawn: 1,
    lost: 0,
    goalsFor: 1,
    goalsAgainst: 1,
    goalDifference: 0,
    points: 1,
    form: 'N',
    isUSM: false,
  },
  {
    position: 7,
    teamId: '993',
    teamName: 'Stade Tunisien',
    teamLogo: '/teams/st.png',
    played: 1,
    won: 0,
    drawn: 1,
    lost: 0,
    goalsFor: 1,
    goalsAgainst: 1,
    goalDifference: 0,
    points: 1,
    form: 'N',
    isUSM: false,
  },
  {
    position: 8,
    teamId: '992',
    teamName: 'US Monastir',
    teamLogo: '/logo.png',
    played: 1,
    won: 0,
    drawn: 1,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 1,
    form: 'N',
    isUSM: true,
  },
  {
    position: 9,
    teamId: '995',
    teamName: 'ES Hammam Sousse',
    teamLogo: '/teams/eshs.png',
    played: 1,
    won: 0,
    drawn: 1,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 1,
    form: 'N',
    isUSM: false,
  },
  {
    position: 10,
    teamId: '991',
    teamName: 'US Ben Guerdane',
    teamLogo: '/teams/usbg.png',
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    form: '-',
    isUSM: false,
  },
  {
    position: 11,
    teamId: '994',
    teamName: 'CS Hammam-Lif',
    teamLogo: '/teams/cshl.png',
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    form: '-',
    isUSM: false,
  },
  {
    position: 12,
    teamId: '986',
    teamName: 'Étoile Sportive du Sahel',
    teamLogo: '/teams/ess.png',
    played: 1,
    won: 0,
    drawn: 0,
    lost: 1,
    goalsFor: 2,
    goalsAgainst: 3,
    goalDifference: -1,
    points: 0,
    form: 'D',
    isUSM: false,
  },
  {
    position: 13,
    teamId: '997',
    teamName: 'Avenir Sportif de La Marsa',
    teamLogo: '/teams/asm.png',
    played: 1,
    won: 0,
    drawn: 0,
    lost: 1,
    goalsFor: 0,
    goalsAgainst: 1,
    goalDifference: -1,
    points: 0,
    form: 'D',
    isUSM: false,
  },
  {
    position: 14,
    teamId: '998',
    teamName: 'Étoile Sportive de Métlaoui',
    teamLogo: '/teams/esm.png',
    played: 1,
    won: 0,
    drawn: 0,
    lost: 1,
    goalsFor: 0,
    goalsAgainst: 1,
    goalDifference: -1,
    points: 0,
    form: 'D',
    isUSM: false,
  },
  {
    position: 15,
    teamId: '999',
    teamName: 'Olympique de Béja',
    teamLogo: '/teams/ob.png',
    played: 1,
    won: 0,
    drawn: 0,
    lost: 1,
    goalsFor: 0,
    goalsAgainst: 1,
    goalDifference: -1,
    points: 0,
    form: 'D',
    isUSM: false,
  },
  {
    position: 16,
    teamId: 'js-omrane',
    teamName: 'JS Omrane',
    teamLogo: '/teams/jso.png',
    played: 1,
    won: 0,
    drawn: 0,
    lost: 1,
    goalsFor: 0,
    goalsAgainst: 2,
    goalDifference: -2,
    points: 0,
    form: 'D',
    isUSM: false,
  },
];

async function seed() {
  console.log('[Seed] Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI as string);
  console.log('[Seed] Connected successfully.');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection not available');
  }

  // 1. Update Global Sports Config
  console.log('[Seed] Updating global sports configuration to season 2026-2027...');
  await db.collection('sportsconfigs').updateOne(
    { key: 'global_sports_config' },
    {
      $set: {
        'football.currentSeason': '2026-2027',
        'football.currentSeasonLabel': '2026–2027',
        'football.leagueExternalId': '202',
        'football.teamExternalId': '992',
        'football.syncEnabled': true,
        'basketball.currentSeason': '2026-2027',
        'basketball.currentSeasonLabel': '2026–2027',
      },
    },
    { upsert: true }
  );

  // 2. Upsert each team standing for 2026-2027
  const standingsCol = db.collection('standings');
  console.log(`[Seed] Upserting ${currentFootballStandings2026_2027.length} teams with sharp logos...`);

  for (const team of currentFootballStandings2026_2027) {
    await standingsCol.updateOne(
      {
        competitionId: '202',
        season: '2026-2027',
        teamName: team.teamName,
      },
      {
        $set: {
          competitionId: '202',
          sport: 'football',
          season: '2026-2027',
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

  // Also support season "2026" key alias
  for (const team of currentFootballStandings2026_2027) {
    await standingsCol.updateOne(
      {
        competitionId: '202',
        season: '2026',
        teamName: team.teamName,
      },
      {
        $set: {
          competitionId: '202',
          sport: 'football',
          season: '2026',
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

  console.log('[Seed] Standings with sharp logos successfully seeded in MongoDB!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('[Seed] Error seeding standings:', err);
  process.exit(1);
});
