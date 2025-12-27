/**
 * Onboarding Service
 * Feature 0.1: Onboarding & Identity System
 * 
 * Orchestrates user onboarding, identity verification, role assignment,
 * trust initialization, and transaction cap setup.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  RegisterUserInput,
  BusinessVerificationInput,
  MembershipLinkageInput,
  OnboardingStatus,
  OnboardingStep,
  UserProfile,
  EntityType,
  OrganizationType,
  BusinessVerificationStatus,
  MembershipLinkageStatus,
} from '../types/onboarding.types';
import { createError } from '../middleware/errorHandler';
import { assignRole } from './rbac.service';
import { getUserPermissions } from './rbac.service';
import { initializeTrustBand } from './dte.service';
import { calculateTransactionCaps } from './dae.service';

const prisma = new PrismaClient();

/**
 * Register a new user with onboarding workflow
 */
export async function registerUser(input: RegisterUserInput): Promise<UserProfile> {
  // Validate email uniqueness
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw createError('User with this email already exists', 400);
  }

  // Validate wallet address uniqueness if provided
  if (input.walletAddress) {
    const existingWallet = await prisma.user.findUnique({
      where: { walletAddress: input.walletAddress },
    });

    if (existingWallet) {
      throw createError('Wallet address already registered', 400);
    }
  }

  // Hash password
  const passwordHash = await bcrypt.hash(input.password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      role: input.role, // Legacy field, will be replaced by RBAC
      userType: input.role === 'RETAIL_TRADER' ? 'TRADER' : 'TRADER', // Default
      walletAddress: input.walletAddress,
      entityType: input.entityType || EntityType.INDIVIDUAL,
      onboardingStep: OnboardingStep.REGISTRATION,
      onboardingCompleted: false,
    },
  });

  try {
    // Assign role via RBAC
    await assignRole(user.id, input.role, undefined, undefined, undefined);

    // Initialize trust band (async, don't fail if it fails)
    let trustBand: string | undefined;
    try {
      const trustResult = await initializeTrustBand(
        user.id,
        input.entityType || EntityType.INDIVIDUAL,
        null // No KYC yet
      );
      trustBand = trustResult.trustBand;
    } catch (error) {
      console.error('Failed to initialize trust band:', error);
      // Continue without trust band, can be set later
    }

    // Calculate transaction caps (async, don't fail if it fails)
    let transactionCap: number | undefined;
    try {
      const capsResult = await calculateTransactionCaps(
        user.id,
        input.entityType || EntityType.INDIVIDUAL,
        trustBand || null
      );
      transactionCap = capsResult.transactionCap;
    } catch (error) {
      console.error('Failed to calculate transaction caps:', error);
      // Continue without caps, can be set later
    }

    // Update user with trust band and cap
    await prisma.user.update({
      where: { id: user.id },
      data: {
        trustBand,
        transactionCap,
        onboardingStep: OnboardingStep.ROLE_ASSIGNED,
      },
    });

    // Get user permissions
    const permissions = await getUserPermissions(user.id);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      phone: user.phone || undefined,
      entityType: user.entityType as EntityType | undefined,
      onboardingCompleted: false,
      onboardingStep: OnboardingStep.ROLE_ASSIGNED,
      trustBand,
      transactionCap,
      roles: [input.role],
      permissions,
    };
  } catch (error: any) {
    // Rollback: delete user if role assignment fails
    await prisma.user.delete({ where: { id: user.id } }).catch(() => {
      // Ignore deletion errors
    });
    throw error;
  }
}

/**
 * Submit business verification documents
 */
export async function submitBusinessVerification(
  userId: string,
  input: BusinessVerificationInput
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, entityType: true },
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  // Check if business verification already exists
  const existing = await prisma.businessVerification.findUnique({
    where: { userId },
  });

  if (existing && existing.status === BusinessVerificationStatus.APPROVED) {
    throw createError('Business already verified', 400);
  }

  // Create or update business verification
  await prisma.businessVerification.upsert({
    where: { userId },
    update: {
      registrationNumber: input.registrationNumber,
      companyName: input.companyName,
      legalStructure: input.legalStructure,
      registrationDate: input.registrationDate,
      expiryDate: input.expiryDate,
      documentUrl: input.documentUrl,
      status: BusinessVerificationStatus.PENDING,
      verifiedAt: null,
      verifiedBy: null,
      rejectionReason: null,
    },
    create: {
      userId,
      registrationNumber: input.registrationNumber,
      companyName: input.companyName,
      legalStructure: input.legalStructure,
      registrationDate: input.registrationDate,
      expiryDate: input.expiryDate,
      documentUrl: input.documentUrl,
      status: BusinessVerificationStatus.PENDING,
    },
  });

  // Update user entity type if needed
  if (user.entityType !== EntityType.COMPANY) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        entityType: EntityType.COMPANY,
        companyName: input.companyName,
        registrationNumber: input.registrationNumber,
        legalStructure: input.legalStructure,
      },
    });
  }
}

/**
 * Link co-op or SACCO membership
 */
export async function linkMembership(
  userId: string,
  input: MembershipLinkageInput
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  // Check if membership already linked
  const existing = await prisma.membershipLinkage.findUnique({
    where: {
      userId_organizationType_organizationId: {
        userId,
        organizationType: input.organizationType,
        organizationId: input.organizationId,
      },
    },
  });

  if (existing && existing.status === MembershipLinkageStatus.VERIFIED) {
    throw createError('Membership already linked and verified', 400);
  }

  // Create or update membership linkage
  await prisma.membershipLinkage.upsert({
    where: {
      userId_organizationType_organizationId: {
        userId,
        organizationType: input.organizationType,
        organizationId: input.organizationId,
      },
    },
    update: {
      membershipNumber: input.membershipNumber,
      status: MembershipLinkageStatus.PENDING,
      verifiedAt: null,
      verifiedBy: null,
      rejectionReason: null,
    },
    create: {
      userId,
      organizationType: input.organizationType,
      organizationId: input.organizationId,
      membershipNumber: input.membershipNumber,
      status: MembershipLinkageStatus.PENDING,
    },
  });

  // TODO: Validate membership with co-op/SACCO database
  // For now, it requires admin approval
}

/**
 * Get onboarding status for a user
 */
export async function getOnboardingStatus(userId: string): Promise<OnboardingStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      onboardingCompleted: true,
      onboardingStep: true,
      trustBand: true,
      transactionCap: true,
      kycRecord: {
        select: {
          status: true,
        },
      },
      businessVerification: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  const steps: Array<{ name: string; step: OnboardingStep; status: 'complete' | 'pending' | 'in_progress'; completedAt?: Date }> = [
    {
      name: 'Registration',
      step: OnboardingStep.REGISTRATION,
      status: 'complete',
      completedAt: new Date(), // User exists, so registration is complete
    },
    {
      name: 'Identity Verification',
      step: OnboardingStep.KYC_PENDING,
      status: user.kycRecord?.status === 'APPROVED' ? 'complete' : user.kycRecord?.status === 'PENDING' ? 'in_progress' : 'pending',
    },
    {
      name: 'Role Assignment',
      step: OnboardingStep.ROLE_ASSIGNED,
      status: user.onboardingStep === OnboardingStep.ROLE_ASSIGNED || user.onboardingStep === OnboardingStep.COMPLETE ? 'complete' : 'pending',
    },
  ];

  // Determine current step
  let currentStep = OnboardingStep.REGISTRATION;
  if (user.onboardingStep) {
    currentStep = user.onboardingStep as OnboardingStep;
  } else if (user.kycRecord) {
    currentStep = OnboardingStep.KYC_PENDING;
  }

  // Check if onboarding is complete
  const isComplete =
    user.onboardingCompleted ||
    (user.kycRecord?.status === 'APPROVED' &&
      (user.onboardingStep === OnboardingStep.ROLE_ASSIGNED ||
        user.onboardingStep === OnboardingStep.COMPLETE));

  return {
    completed: isComplete,
    currentStep,
    steps,
    trustBand: user.trustBand || undefined,
    transactionCap: user.transactionCap || undefined,
  };
}

/**
 * Get user profile with permissions
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: {
        where: { isActive: true },
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  const roles = user.userRoles.map((ur) => ur.role.name);
  const permissions = await getUserPermissions(userId);

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName || undefined,
    lastName: user.lastName || undefined,
    phone: user.phone || undefined,
    entityType: user.entityType as EntityType | undefined,
    onboardingCompleted: user.onboardingCompleted,
    onboardingStep: user.onboardingStep as OnboardingStep | undefined,
    trustBand: user.trustBand || undefined,
    transactionCap: user.transactionCap || undefined,
    roles,
    permissions,
  };
}

/**
 * Complete onboarding (mark as complete)
 */
export async function completeOnboarding(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      onboardingCompleted: true,
      onboardingStep: OnboardingStep.COMPLETE,
    },
  });
}

