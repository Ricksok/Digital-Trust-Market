/**
 * Unit Tests for DTE Service
 * Feature 0.1: Onboarding & Identity System
 */

import * as dteService from '../../services/dte.service';
import { EntityType } from '../../types/onboarding.types';
import { createMockTrustScore, resetAllMocks } from '../utils/test-helpers';
import '../setup';
import { mockPrismaClient } from '../setup';

describe('DTE Service', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.clearAllMocks();
  });

  describe('initializeTrustBand', () => {
    const userId = 'user-123';

    it('should initialize trust band for individual user without KYC', async () => {
      // Arrange
      mockPrismaClient.trustScore.upsert.mockResolvedValue(createMockTrustScore({ entityId: userId }));
      mockPrismaClient.user.update.mockResolvedValue({ id: userId, trustBand: 'C' });

      // Act
      const result = await dteService.initializeTrustBand(
        userId,
        EntityType.INDIVIDUAL,
        null
      );

      // Assert
      expect(mockPrismaClient.trustScore.upsert).toHaveBeenCalledWith({
        where: { entityId: userId },
        update: expect.objectContaining({
          trustScore: 20,
          identityTrust: 20,
        }),
        create: expect.objectContaining({
          entityId: userId,
          trustScore: 20,
          identityTrust: 20,
        }),
      });
      expect(result.trustBand).toBe('C');
      expect(result.trustScore).toBe(20);
      expect(result.dimensions.identity).toBe(20);
    });

    it('should initialize trust band for company user with KYC approved', async () => {
      // Arrange
      mockPrismaClient.trustScore.upsert.mockResolvedValue(createMockTrustScore({ entityId: userId }));
      mockPrismaClient.user.update.mockResolvedValue({ id: userId, trustBand: 'A' });

      // Act
      const result = await dteService.initializeTrustBand(
        userId,
        EntityType.COMPANY,
        'APPROVED'
      );

      // Assert
      expect(result.trustBand).toBe('A');
      expect(result.trustScore).toBe(50); // 30 (company) + 20 (KYC)
      expect(result.dimensions.identity).toBe(40);
    });

    it('should assign correct trust band based on score', async () => {
      // Test A band (>= 40)
      mockPrismaClient.trustScore.upsert.mockResolvedValue(createMockTrustScore());
      mockPrismaClient.user.update.mockResolvedValue({ id: userId, trustBand: 'A' });
      const resultA = await dteService.initializeTrustBand(
        userId,
        EntityType.COMPANY,
        'APPROVED'
      );
      expect(resultA.trustBand).toBe('A');

      // Test B band (>= 30)
      mockPrismaClient.user.update.mockResolvedValue({ id: userId, trustBand: 'B' });
      const resultB = await dteService.initializeTrustBand(
        userId,
        EntityType.COMPANY,
        null
      );
      expect(resultB.trustBand).toBe('B');

      // Test C band (>= 20)
      mockPrismaClient.user.update.mockResolvedValue({ id: userId, trustBand: 'C' });
      const resultC = await dteService.initializeTrustBand(
        userId,
        EntityType.INDIVIDUAL,
        null
      );
      expect(resultC.trustBand).toBe('C');

      // Test D band (< 20)
      mockPrismaClient.user.update.mockResolvedValue({ id: userId, trustBand: 'D' });
      const resultD = await dteService.initializeTrustBand(
        userId,
        null,
        null
      );
      expect(resultD.trustBand).toBe('D');
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      mockPrismaClient.trustScore.upsert.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(
        dteService.initializeTrustBand(userId, EntityType.INDIVIDUAL, null)
      ).rejects.toThrow('Failed to initialize trust band');
    });

    it('should update user with trust band', async () => {
      // Arrange
      mockPrismaClient.trustScore.upsert.mockResolvedValue(createMockTrustScore());
      mockPrismaClient.user.update.mockResolvedValue({ id: userId, trustBand: 'B' });

      // Act
      await dteService.initializeTrustBand(userId, EntityType.COMPANY, null);

      // Assert
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { trustBand: 'B' },
      });
    });
  });

  describe('updateTrustBand', () => {
    const userId = 'user-123';

    it('should log trust band update trigger', async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      await dteService.updateTrustBand(userId, 'TRANSACTION');

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Trust band update triggered for user ${userId}: TRANSACTION`)
      );

      consoleSpy.mockRestore();
    });
  });
});

