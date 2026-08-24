import { describe, it, expect, vi } from 'vitest';
import { SportsSyncService } from '../sports-sync.service';

describe('Distributed Locking Mechanism Tests', () => {
  it('should prevent concurrent sync executions when a lock is already held', async () => {
    const mockStandingModel = {
      countDocuments: vi.fn().mockResolvedValue(0),
    } as any;
    const mockStatusModel = {} as any;
    const mockLogModel = {} as any;
    const mockConfigModel = {} as any;

    // Simulate duplicate key error on MongoDB lock collection
    const mockLockModel = {
      deleteOne: vi.fn().mockResolvedValue({}),
      create: vi.fn().mockRejectedValue({ code: 11000, message: 'E11000 duplicate key error' }),
    } as any;

    const mockMatchModel = {} as any;
    const mockProvider = {
      getStandings: vi.fn(),
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

    const result = await service.syncStandings('football', 'CRON');

    expect(result.status).toBe('SKIPPED');
    expect(result.message).toContain('locked');
    expect(mockProvider.getStandings).not.toHaveBeenCalled();
  });
});
