/**
 * Test Helpers and Utilities
 * Common utilities for testing
 */

import { PrismaClient } from '@prisma/client';
import { OnboardingStep, EntityType } from '../../types/onboarding.types';

/**
 * Create a mock Prisma client
 */
export function createMockPrismaClient() {
  return {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    businessVerification: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    membershipLinkage: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    trustScore: {
      upsert: jest.fn(),
    },
    userRole: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
    },
    $disconnect: jest.fn(),
  } as unknown as PrismaClient;
}

/**
 * Create a mock user object
 */
export function createMockUser(overrides?: Partial<any>) {
  return {
    id: 'user-123',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    role: 'RETAIL_TRADER',
    userType: 'TRADER',
    walletAddress: null,
    isVerified: false,
    isActive: true,
    entityType: EntityType.INDIVIDUAL,
    onboardingCompleted: false,
    onboardingStep: OnboardingStep.REGISTRATION,
    transactionCap: null,
    trustBand: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock trust score
 */
export function createMockTrustScore(overrides?: Partial<any>) {
  return {
    id: 'trust-123',
    entityId: 'user-123',
    trustScore: 30,
    identityTrust: 20,
    transactionTrust: 0,
    financialTrust: 0,
    performanceTrust: 0,
    learningTrust: 0,
    behaviorScore: 0,
    ...overrides,
  };
}

/**
 * Mock bcrypt functions
 */
export const mockBcrypt = {
  hash: jest.fn(),
  compare: jest.fn(),
};

/**
 * Reset all mocks
 */
export function resetAllMocks() {
  jest.clearAllMocks();
}

