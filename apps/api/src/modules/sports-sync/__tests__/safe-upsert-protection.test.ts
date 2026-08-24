import { describe, it, expect, vi } from 'vitest';
import { SportsSyncService } from '../sports-sync.service';

describe('Safe Upsert & Zero Response Protection Tests', () => {
  it('should reject empty or all-zero provider standings when valid active standings exist', async () => {
    const mockStandingModel = {
      countDocuments: vi.fn().mockResolvedValue(16), // 16 existing active rows with played > 0
      find: vi.fn().mockReturnValue({ sort: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue([]) }) }),
      findOneAndUpdate: vi.fn(),
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
      providerName: 'test-provider',
      getStandings: vi.fn().mockResolvedValue([
        { position: 1, teamId: '1', teamName: 'ES Tunis', played: 0, won: 0, drawn: 0, lost: 0, points: 0, isUSM: false },
        { position: 2, teamId: '2', teamName: 'US Monastir', played: 0, won: 0, drawn: 0, lost: 0, points: 0, isUSM: true },
        { position: 3, teamId: '3', teamName: 'ES Sahel', played: 0, won: 0, drawn: 0, lost: 0, points: 0, isUSM: false },
        { position: 4, teamId: '4', teamName: 'Club Africain', played: 0, won: 0, drawn: 0, lost: 0, points: 0, isUSM: false },
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

    // Should skip destructive overwrite
    expect(result.status).toBe('SKIPPED');
    expect(mockStandingModel.findOneAndUpdate).not.toHaveBeenCalled();
    expect(result.message).toContain('données existantes conservées');
  });

  it('should accept valid non-zero standings and update MongoDB', async () => {
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
    expect(result.updated).toBe(4);
    expect(mockStandingModel.findOneAndUpdate).toHaveBeenCalledTimes(4);
  });
});
