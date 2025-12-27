/**
 * Unit Tests for DAE Service
 * Feature 0.1: Onboarding & Identity System
 */

import * as daeService from '../../services/dae.service';
import { EntityType } from '../../types/onboarding.types';
import { createMockUser, resetAllMocks } from '../utils/test-helpers';
import '../setup';
import { mockPrismaClient } from '../setup';

describe('DAE Service', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.clearAllMocks();
  });

  describe('calculateTransactionCaps', () => {
    const userId = 'user-123';

    it('should calculate caps for individual user with trust band B', async () => {
      // Arrange
      mockPrismaClient.user.update.mockResolvedValue(createMockUser({ id: userId, transactionCap: 7500 }));

      // Act
      const result = await daeService.calculateTransactionCaps(
        userId,
        EntityType.INDIVIDUAL,
        'B'
      );

      // Assert
      expect(result.transactionCap).toBe(7500); // 10000 * 0.75
      expect(result.riskLevel).toBe('LOW');
      expect(result.dailyCap).toBe(750); // 10% of cap
      expect(result.monthlyCap).toBe(3750); // 50% of cap
    });

    it('should calculate caps for company user with trust band A', async () => {
      // Arrange
      mockPrismaClient.user.update.mockResolvedValue(createMockUser({ id: userId, transactionCap: 100000 }));

      // Act
      const result = await daeService.calculateTransactionCaps(
        userId,
        EntityType.COMPANY,
        'A'
      );

      // Assert
      expect(result.transactionCap).toBe(100000); // 100000 * 1.0
      expect(result.riskLevel).toBe('LOW');
    });

    it('should calculate caps for institutional buyer with trust band C', async () => {
      // Arrange
      mockPrismaClient.user.update.mockResolvedValue(
        createMockUser({ id: userId, transactionCap: 250000 })
      );

      // Act
      const result = await daeService.calculateTransactionCaps(
        userId,
        EntityType.INSTITUTIONAL_BUYER,
        'C'
      );

      // Assert
      expect(result.transactionCap).toBe(250000); // 500000 * 0.5
      expect(result.riskLevel).toBe('MEDIUM');
    });

    it('should calculate caps for user with trust band D', async () => {
      // Arrange
      mockPrismaClient.user.update.mockResolvedValue(createMockUser({ id: userId, transactionCap: 2500 }));

      // Act
      const result = await daeService.calculateTransactionCaps(
        userId,
        EntityType.INDIVIDUAL,
        'D'
      );

      // Assert
      expect(result.transactionCap).toBe(2500); // 10000 * 0.25
      expect(result.riskLevel).toBe('HIGH');
    });

    it('should use default caps if entity type is null', async () => {
      // Arrange
      mockPrismaClient.user.update.mockResolvedValue(createMockUser({ id: userId, transactionCap: 2500 }));

      // Act
      const result = await daeService.calculateTransactionCaps(userId, null, 'D');

      // Assert
      expect(result.transactionCap).toBe(2500); // 10000 (default) * 0.25
    });

    it('should use default multiplier if trust band is null', async () => {
      // Arrange
      mockPrismaClient.user.update.mockResolvedValue(createMockUser({ id: userId, transactionCap: 2500 }));

      // Act
      const result = await daeService.calculateTransactionCaps(
        userId,
        EntityType.INDIVIDUAL,
        null
      );

      // Assert
      expect(result.transactionCap).toBe(2500); // 10000 * 0.25 (default multiplier)
      expect(result.riskLevel).toBe('HIGH');
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      mockPrismaClient.user.update.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(
        daeService.calculateTransactionCaps(userId, EntityType.INDIVIDUAL, 'B')
      ).rejects.toThrow('Failed to calculate transaction caps');
    });

    it('should update user with transaction cap', async () => {
      // Arrange
      mockPrismaClient.user.update.mockResolvedValue(createMockUser({ id: userId, transactionCap: 10000 }));

      // Act
      await daeService.calculateTransactionCaps(userId, EntityType.INDIVIDUAL, 'A');

      // Assert
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { transactionCap: 10000 },
      });
    });
  });

  describe('updateTransactionCaps', () => {
    const userId = 'user-123';

    it('should update caps based on new trust band', async () => {
      // Arrange
      mockPrismaClient.user.findUnique.mockResolvedValue(
        createMockUser({ id: userId, entityType: EntityType.INDIVIDUAL })
      );
      mockPrismaClient.user.update.mockResolvedValue(createMockUser({ id: userId, transactionCap: 10000 }));

      // Act
      const result = await daeService.updateTransactionCaps(userId, 'A');

      // Assert
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: { entityType: true },
      });
      expect(result.transactionCap).toBe(10000);
    });

    it('should throw error if user not found', async () => {
      // Arrange
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(daeService.updateTransactionCaps(userId, 'A')).rejects.toThrow(
        'User not found'
      );
    });
  });
});

