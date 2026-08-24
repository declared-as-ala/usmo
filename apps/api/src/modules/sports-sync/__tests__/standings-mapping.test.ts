import { describe, it, expect } from 'vitest';
import { ApiFootballProvider } from '../providers/api-football.provider';
import { TheSportsDbProvider } from '../providers/thesportsdb.provider';
import { BasketballProvider } from '../providers/basketball.provider';

describe('Standings Mapping Tests', () => {
  it('should correctly map API-Football standings payload with real non-zero values', async () => {
    const mockConfigService = {
      get: (key: string) => (key === 'API_FOOTBALL_KEY' ? 'test_key' : 'https://v3.football.api-sports.io'),
    } as any;

    const provider = new ApiFootballProvider(mockConfigService);

    // Mock API-Football response
    const mockApiResponse = {
      response: [
        {
          league: {
            id: 202,
            name: 'Ligue 1',
            standings: [
              [
                {
                  rank: 1,
                  team: { id: 980, name: 'ES Tunis', logo: 'https://media.api-sports.io/football/teams/980.png' },
                  all: { played: 30, win: 19, draw: 9, lose: 2, goals: { for: 57, against: 22 } },
                  goalsDiff: 35,
                  points: 66,
                  form: 'DWWWW',
                },
                {
                  rank: 2,
                  team: { id: 992, name: 'US Monastirienne', logo: 'https://media.api-sports.io/football/teams/992.png' },
                  all: { played: 30, win: 17, draw: 11, lose: 2, goals: { for: 42, against: 11 } },
                  goalsDiff: 31,
                  points: 62,
                  form: 'DDDWW',
                },
                {
                  rank: 3,
                  team: { id: 990, name: 'ES Sahel', logo: 'https://media.api-sports.io/football/teams/990.png' },
                  all: { played: 30, win: 19, draw: 4, lose: 7, goals: { for: 45, against: 24 } },
                  goalsDiff: 21,
                  points: 61,
                  form: 'LWDWW',
                },
                {
                  rank: 4,
                  team: { id: 988, name: 'Club Africain', logo: 'https://media.api-sports.io/football/teams/988.png' },
                  all: { played: 30, win: 16, draw: 8, lose: 6, goals: { for: 36, against: 19 } },
                  goalsDiff: 17,
                  points: 56,
                  form: 'DLLLW',
                },
              ],
            ],
          },
        },
      ],
    };

    // Override request method on provider instance for testing
    (provider as any).request = async () => mockApiResponse;

    const standings = await provider.getStandings('202', '2024');

    expect(standings).toHaveLength(4);

    // Verify US Monastir (Rank #2) mapping
    const usm = standings.find((s) => s.isUSM);
    expect(usm).toBeDefined();
    expect(usm!.teamName).toBe('US Monastir');
    expect(usm!.position).toBe(2);
    expect(usm!.played).toBe(30);
    expect(usm!.won).toBe(17);
    expect(usm!.drawn).toBe(11);
    expect(usm!.lost).toBe(2);
    expect(usm!.goalsFor).toBe(42);
    expect(usm!.goalsAgainst).toBe(11);
    expect(usm!.goalDifference).toBe(31);
    expect(usm!.points).toBe(62);
    expect(usm!.form).toBe('DDDWW');

    // Verify ES Tunis (Rank #1)
    const est = standings[0];
    expect(est.teamName).toBe('ES Tunis');
    expect(est.position).toBe(1);
    expect(est.points).toBe(66);
    expect(est.played).toBe(30);
    expect(est.isUSM).toBe(false);
  });

  it('should correctly map TheSportsDB lookuptable response', async () => {
    const provider = new TheSportsDbProvider();
    const mockTheSportsDbTable = {
      table: [
        {
          intRank: '1',
          idTeam: '137650',
          strTeam: 'Espérance de Tunis',
          strBadge: 'https://r2.thesportsdb.com/images/media/team/badge/jyijfi1581543162.png/tiny',
          intPlayed: '30',
          intWin: '19',
          intDraw: '9',
          intLoss: '2',
          intGoalsFor: '57',
          intGoalsAgainst: '22',
          intGoalDifference: '35',
          intPoints: '66',
          strForm: 'DWWWW',
        },
        {
          intRank: '2',
          idTeam: '139871',
          strTeam: 'US Monastir',
          strBadge: '/logo.png',
          intPlayed: '30',
          intWin: '17',
          intDraw: '11',
          intLoss: '2',
          intGoalsFor: '42',
          intGoalsAgainst: '11',
          intGoalDifference: '31',
          intPoints: '62',
          strForm: 'DDDWW',
        },
      ],
    };

    (provider as any).request = async () => mockTheSportsDbTable;

    const standings = await provider.getStandings('4828', '2024-2025');
    expect(standings).toHaveLength(2);
    expect(standings[1].isUSM).toBe(true);
    expect(standings[1].points).toBe(62);
    expect(standings[1].played).toBe(30);
    expect(standings[1].goalDifference).toBe(31);
  });

  it('should correctly provide basketball Pro A standings', async () => {
    const provider = new BasketballProvider();
    const standings = await provider.getStandings('pro-a-basketball', '2025-2026');

    expect(standings.length).toBeGreaterThanOrEqual(8);
    const usm = standings.find((s) => s.isUSM);
    expect(usm).toBeDefined();
    expect(usm!.position).toBe(1);
    expect(usm!.played).toBe(14);
    expect(usm!.won).toBe(13);
    expect(usm!.points).toBe(27);
    expect(usm!.goalsFor).toBeGreaterThan(1000);
  });
});
