import { describe, it, expect, vi } from 'vitest';
import { SportsSyncService } from '../sports-sync.service';

describe('Post-Match Standings Refresh Trigger Tests', () => {
  it('should immediately refresh standings and recent results when a match finishes', async () => {
    const mockStandingModel = {
      countDocuments: vi.fn().mockResolvedValue(0),
      findOne: vi.fn().mockResolvedValue(null),
      findOneAndUpdate: vi.fn().mockResolvedValue({}),
    } as any;

    const mockStatusModel = {
      findOneAndUpdate: vi.fn().mockResolvedValue({}),
    } as any;

    const mockLogModel = {
      create: vi.fn().mockResolvedValue({}),
    } as any;

    const mockConfigModel = {} as any;
    const mockLockModel = {
      deleteOne: vi.fn().mockResolvedValue({}),
      create: vi.fn().mockResolvedValue({}),
    } as any;

    const mockMatchModel = {
      findOne: vi.fn().mockResolvedValue({ externalId: '12345', status: 'live' }),
      findOneAndUpdate: vi.fn().mockResolvedValue({}),
    } as any;

    const mockProvider = {
      providerName: 'api-football',
      getMatch: vi.fn().mockResolvedValue({
        externalId: '12345',
        status: 'finished',
        score: { home: 2, away: 1 },
        timeline: [],
        stats: {},
      }),
      getStandings: vi.fn().mockResolvedValue([
        { position: 1, teamId: '992', teamName: 'US Monastir', played: 31, won: 18, drawn: 11, lost: 2, points: 65, isUSM: true },
        { position: 2, teamId: '980', teamName: 'ES Tunis', played: 31, won: 19, drawn: 9, lost: 3, points: 66, isUSM: false },
        { position: 3, teamId: '990', teamName: 'ES Sahel', played: 31, won: 19, drawn: 4, lost: 8, points: 61, isUSM: false },
        { position: 4, teamId: '988', teamName: 'Club Africain', played: 31, won: 16, drawn: 8, lost: 7, points: 56, isUSM: false },
      ]),
      getResults: vi.fn().mockResolvedValue([]),
    };

    const mockProviderService = {
      getProviderForSport: vi.fn().mockResolvedValue({
        provider: mockProvider,
        leagueExternalId: '202',
        season: '2024',
        enabled: true,
      }),
    } as any;

    const service = new SportsSyncService(
      mockStandingModel,
      mockStatusModel,
      mockLogModel,
      mockConfigModel,
      mockLockModel,
      mockMatchModel,
      mockProviderService,
    );

    // Call handleMatchFinished directly
    await service.handleMatchFinished('12345', 'football');

    expect(mockProvider.getMatch).toHaveBeenCalledWith('12345');
    expect(mockProvider.getStandings).toHaveBeenCalledWith('202', '2024');
    expect(mockStandingModel.findOneAndUpdate).toHaveBeenCalledTimes(4);
  });
});
