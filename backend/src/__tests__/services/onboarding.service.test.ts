/**
 * Unit Tests for Onboarding Service
 * Feature 0.1: Onboarding & Identity System
 */

import * as onboardingService from '../../services/onboarding.service';
import * as rbacService from '../../services/rbac.service';
import * as dteService from '../../services/dte.service';
import * as daeService from '../../services/dae.service';
import { RegisterUserInput, EntityType, OnboardingStep, OrganizationType } from '../../types/onboarding.types';
import { createMockUser, resetAllMocks } from '../utils/test-helpers';
import '../setup'; // Import setup to initialize mocks
import { mockPrismaClient } from '../setup';

// Mock dependencies
jest.mock('../../services/rbac.service');
jest.mock('../../services/dte.service');
jest.mock('../../services/dae.service');
jest.mock('bcryptjs', () => ({
  hash: jest.fn((password: string) => Promise.resolve(`hashed-${password}`)),
  compare: jest.fn(),
}));

describe('Onboarding Service', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    const validInput: RegisterUserInput = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'RETAIL_TRADER',
      entityType: EntityType.INDIVIDUAL,
    };

    it('should successfully register a new user', async () => {
      // Arrange
      mockPrismaClient.user.findUnique.mockResolvedValue(null); // No existing user
      mockPrismaClient.user.create.mockResolvedValue(createMockUser({ id: 'new-user-123' }));
      mockPrismaClient.user.update.mockResolvedValue(createMockUser({ id: 'new-user-123' }));
      (rbacService.assignRole as jest.Mock).mockResolvedValue(undefined);
      (dteService.initializeTrustBand as jest.Mock).mockResolvedValue({
        trustBand: 'B',
        trustScore: 30,
        dimensions: { identity: 20, transaction: 0, financial: 0, performance: 0, learning: 0 },
      });
      (daeService.calculateTransactionCaps as jest.Mock).mockResolvedValue({
        transactionCap: 10000,
        riskLevel: 'LOW',
      });
      (rbacService.getUserPermissions as jest.Mock).mockResolvedValue([
        'auth.login',
        'profile.view.own',
        'tee.listings.view',
      ]);

      // Act
      const result = await onboardingService.registerUser(validInput);

      // Assert
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { email: validInput.email },
      });
      expect(mockPrismaClient.user.create).toHaveBeenCalled();
      expect(rbacService.assignRole).toHaveBeenCalledWith(
        'new-user-123',
        'RETAIL_TRADER',
        undefined,
        undefined,
        undefined
      );
      expect(dteService.initializeTrustBand).toHaveBeenCalled();
      expect(daeService.calculateTransactionCaps).toHaveBeenCalled();
      expect(result.email).toBe(validInput.email);
      expect(result.roles).toContain('RETAIL_TRADER');
      expect(result.permissions).toBeDefined();
    });

    it('should throw error if email already exists', async () => {
      // Arrange
      mockPrismaClient.user.findUnique.mockResolvedValue(createMockUser());

      // Act & Assert
      await expect(onboardingService.registerUser(validInput)).rejects.toThrow(
        'User with this email already exists'
      );
      expect(mockPrismaClient.user.create).not.toHaveBeenCalled();
    });

    it('should throw error if wallet address already exists', async () => {
      // Arrange
      const inputWithWallet = { ...validInput, walletAddress: '0x123' };
      mockPrismaClient.user.findUnique
        .mockResolvedValueOnce(null) // Email check passes
        .mockResolvedValueOnce(createMockUser()); // Wallet check fails

      // Act & Assert
      await expect(onboardingService.registerUser(inputWithWallet)).rejects.toThrow(
        'Wallet address already registered'
      );
    });

    it('should rollback user creation if role assignment fails', async () => {
      // Arrange
      mockPrismaClient.user.findUnique.mockResolvedValue(null);
      mockPrismaClient.user.create.mockResolvedValue(createMockUser({ id: 'new-user-123' }));
      mockPrismaClient.user.delete.mockResolvedValue({});
      (rbacService.assignRole as jest.Mock).mockRejectedValue(new Error('RBAC error'));

      // Act & Assert
      await expect(onboardingService.registerUser(validInput)).rejects.toThrow('RBAC error');
      expect(mockPrismaClient.user.delete).toHaveBeenCalledWith({ where: { id: 'new-user-123' } });
    });

    it('should continue if trust band initialization fails', async () => {
      // Arrange
      mockPrismaClient.user.findUnique.mockResolvedValue(null);
      mockPrismaClient.user.create.mockResolvedValue(createMockUser({ id: 'new-user-123' }));
      mockPrismaClient.user.update.mockResolvedValue(createMockUser({ id: 'new-user-123' }));
      (rbacService.assignRole as jest.Mock).mockResolvedValue(undefined);
      (dteService.initializeTrustBand as jest.Mock).mockRejectedValue(new Error('DTE error'));
      (daeService.calculateTransactionCaps as jest.Mock).mockResolvedValue({
        transactionCap: 10000,
        riskLevel: 'LOW',
      });
      (rbacService.getUserPermissions as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await onboardingService.registerUser(validInput);

      // Assert
      expect(result).toBeDefined();
      expect(result.trustBand).toBeUndefined();
    });

    it('should continue if transaction caps calculation fails', async () => {
      // Arrange
      mockPrismaClient.user.findUnique.mockResolvedValue(null);
      mockPrismaClient.user.create.mockResolvedValue(createMockUser({ id: 'new-user-123' }));
      mockPrismaClient.user.update.mockResolvedValue(createMockUser({ id: 'new-user-123' }));
      (rbacService.assignRole as jest.Mock).mockResolvedValue(undefined);
      (dteService.initializeTrustBand as jest.Mock).mockResolvedValue({
        trustBand: 'B',
        trustScore: 30,
        dimensions: { identity: 20, transaction: 0, financial: 0, performance: 0, learning: 0 },
      });
      (daeService.calculateTransactionCaps as jest.Mock).mockRejectedValue(
        new Error('DAE error')
      );
      (rbacService.getUserPermissions as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await onboardingService.registerUser(validInput);

      // Assert
      expect(result).toBeDefined();
      expect(result.transactionCap).toBeUndefined();
    });
  });

  describe('submitBusinessVerification', () => {
    const userId = 'user-123';
    const businessInput = {
      registrationNumber: 'REG123',
      companyName: 'Test Company',
      legalStructure: 'LLC',
    };

    it('should submit business verification successfully', async () => {
      // Arrange
      mockPrismaClient.user.findUnique.mockResolvedValue(
        createMockUser({ id: userId, entityType: EntityType.INDIVIDUAL })
      );
      mockPrismaClient.businessVerification.findUnique.mockResolvedValue(null);
      mockPrismaClient.businessVerification.upsert.mockResolvedValue({
        id: 'bv-123',
        userId,
        ...businessInput,
        status: 'PENDING',
      });
      mockPrismaClient.user.update.mockResolvedValue(createMockUser({ entityType: EntityType.COMPANY }));

      // Act
      await onboardingService.submitBusinessVerification(userId, businessInput);

      // Assert
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: { id: true, entityType: true },
      });
      expect(mockPrismaClient.businessVerification.upsert).toHaveBeenCalled();
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: expect.objectContaining({
          entityType: EntityType.COMPANY,
          companyName: businessInput.companyName,
        }),
      });
    });

    it('should throw error if user not found', async () => {
      // Arrange
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        onboardingService.submitBusinessVerification(userId, businessInput)
      ).rejects.toThrow('User not found');
    });

    it('should throw error if business already verified', async () => {
      // Arrange
      mockPrismaClient.user.findUnique.mockResolvedValue(createMockUser({ id: userId }));
      mockPrismaClient.businessVerification.findUnique.mockResolvedValue({
        id: 'bv-123',
        userId,
        status: 'APPROVED',
      });

      // Act & Assert
      await expect(
        onboardingService.submitBusinessVerification(userId, businessInput)
      ).rejects.toThrow('Business already verified');
    });
  });

  describe('linkMembership', () => {
    const userId = 'user-123';
    const membershipInput = {
      organizationType: OrganizationType.COOP,
      organizationId: 'coop-123',
      membershipNumber: 'MEM123',
    };

    it('should link membership successfully', async () => {
      // Arrange
      mockPrismaClient.user.findUnique.mockResolvedValue(createMockUser({ id: userId }));
      mockPrismaClient.membershipLinkage.findUnique.mockResolvedValue(null);
      mockPrismaClient.membershipLinkage.upsert.mockResolvedValue({
        id: 'ml-123',
        userId,
        ...membershipInput,
        status: 'PENDING',
      });

      // Act
      await onboardingService.linkMembership(userId, membershipInput);

      // Assert
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: { id: true },
      });
      expect(mockPrismaClient.membershipLinkage.upsert).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      // Arrange
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(onboardingService.linkMembership(userId, membershipInput)).rejects.toThrow(
        'User not found'
      );
    });

    it('should throw error if membership already verified', async () => {
      // Arrange
      mockPrismaClient.user.findUnique.mockResolvedValue(createMockUser({ id: userId }));
      mockPrismaClient.membershipLinkage.findUnique.mockResolvedValue({
        id: 'ml-123',
        userId,
        ...membershipInput,
        status: 'VERIFIED',
      });

      // Act & Assert
      await expect(onboardingService.linkMembership(userId, membershipInput)).rejects.toThrow(
        'Membership already linked and verified'
      );
    });
  });

  describe('getOnboardingStatus', () => {
    const userId = 'user-123';

    it('should return onboarding status for new user', async () => {
      // Arrange
      mockPrismaClient.user.findUnique.mockResolvedValue({
        id: userId,
        onboardingCompleted: false,
        onboardingStep: OnboardingStep.REGISTRATION,
        trustBand: null,
        transactionCap: null,
        kycRecord: null,
        businessVerification: null,
      });

      // Act
      const status = await onboardingService.getOnboardingStatus(userId);

      // Assert
      expect(status.completed).toBe(false);
      expect(status.currentStep).toBe(OnboardingStep.REGISTRATION);
      expect(status.steps).toHaveLength(3);
      expect(status.steps[0].status).toBe('complete'); // Registration
      expect(status.steps[1].status).toBe('pending'); // KYC
    });

    it('should return completed status when KYC approved and role assigned', async () => {
      // Arrange
      mockPrismaClient.user.findUnique.mockResolvedValue({
        id: userId,
        onboardingCompleted: false,
        onboardingStep: OnboardingStep.ROLE_ASSIGNED,
        trustBand: 'B',
        transactionCap: 10000,
        kycRecord: { status: 'APPROVED' },
        businessVerification: null,
      });

      // Act
      const status = await onboardingService.getOnboardingStatus(userId);

      // Assert
      expect(status.completed).toBe(true);
      expect(status.trustBand).toBe('B');
      expect(status.transactionCap).toBe(10000);
    });

    it('should throw error if user not found', async () => {
      // Arrange
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(onboardingService.getOnboardingStatus(userId)).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('getUserProfile', () => {
    const userId = 'user-123';

    it('should return user profile with permissions', async () => {
      // Arrange
      const mockUser = createMockUser({
        id: userId,
        trustBand: 'B',
        transactionCap: 10000,
        userRoles: [
          {
            id: 'ur-123',
            role: { name: 'RETAIL_TRADER' },
            isActive: true,
          },
        ],
      });
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      (rbacService.getUserPermissions as jest.Mock).mockResolvedValue([
        'auth.login',
        'profile.view.own',
        'tee.listings.view',
      ]);

      // Act
      const profile = await onboardingService.getUserProfile(userId);

      // Assert
      expect(profile.id).toBe(userId);
      expect(profile.roles).toContain('RETAIL_TRADER');
      expect(profile.permissions).toHaveLength(3);
      expect(profile.trustBand).toBe('B');
      expect(profile.transactionCap).toBe(10000);
    });

    it('should throw error if user not found', async () => {
      // Arrange
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(onboardingService.getUserProfile(userId)).rejects.toThrow('User not found');
    });
  });

  describe('completeOnboarding', () => {
    const userId = 'user-123';

    it('should mark onboarding as complete', async () => {
      // Arrange
      mockPrismaClient.user.update.mockResolvedValue(
        createMockUser({
          id: userId,
          onboardingCompleted: true,
          onboardingStep: OnboardingStep.COMPLETE,
        })
      );

      // Act
      await onboardingService.completeOnboarding(userId);

      // Assert
      expect(mockPrismaClient.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          onboardingCompleted: true,
          onboardingStep: OnboardingStep.COMPLETE,
        },
      });
    });
  });
});

