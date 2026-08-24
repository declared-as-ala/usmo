import { describe, it, expect, vi } from 'vitest';
import { SportsSyncService } from '../sports-sync.service';

describe('Manual Override Preservation Tests', () => {
  it('should preserve manual override on standings when sync executes', async () => {
    const manualOverriddenTeam = {
      teamName: 'US Monastir',
      manualOverride: true,
      manualOverrideUntil: new Date(Date.now() + 86400000), // 1 day in the future
      points: 75, // custom points set by admin
    };

    const mockStandingModel = {
      countDocuments: vi.fn().mockResolvedValue(0),
      findOne: vi.fn().mockImplementation(({ teamName }) => {
        if (teamName === 'US Monastir') return manualOverriddenTeam;
        return null;
      }),
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
    const mockMatchModel = {} as any;

    const mockProvider = {
      providerName: 'api-football',
      getStandings: vi.fn().mockResolvedValue([
        { position: 1, teamId: '980', teamName: 'ES Tunis', played: 30, won: 19, drawn: 9, lost: 2, points: 66, isUSM: false },
        { position: 2, teamId: '992', teamName: 'US Monastir', played: 30, won: 17, drawn: 11, lost: 2, points: 62, isUSM: true },
        { position: 3, teamId: '990', teamName: 'ES Sahel', played: 30, won: 19, drawn: 4, lost: 7, points: 61, isUSM: false },
        { position: 4, teamId: '988', teamName: 'Club Africain', played: 30, won: 16, drawn: 8, lost: 6, points: 56, isUSM: false },
      ]),
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

    const result = await service.syncStandings('football', 'MANUAL');

    expect(result.status).toBe('SUCCESS');
    expect(result.updated).toBe(3); // ES Tunis, ES Sahel and Club Africain updated; US Monastir skipped due to manual override
    expect(mockStandingModel.findOneAndUpdate).toHaveBeenCalledTimes(3);
  });
});
