/**
 * Test Setup
 * Global test configuration and mocks
 */

// Mock Prisma Client globally
const mockPrismaClient = {
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
};

// Mock @prisma/client module
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient),
}));

// Export mock for use in tests
export { mockPrismaClient };

