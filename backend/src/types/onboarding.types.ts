/**
 * Onboarding Types and Interfaces
 * Feature 0.1: Onboarding & Identity System
 */

export enum OnboardingStep {
  REGISTRATION = 'REGISTRATION',
  KYC_PENDING = 'KYC_PENDING',
  KYC_APPROVED = 'KYC_APPROVED',
  ROLE_ASSIGNED = 'ROLE_ASSIGNED',
  COMPLETE = 'COMPLETE',
}

export enum EntityType {
  INDIVIDUAL = 'INDIVIDUAL',
  COMPANY = 'COMPANY',
  SACCO = 'SACCO',
  FUND = 'FUND',
  INSTITUTIONAL_BUYER = 'INSTITUTIONAL_BUYER',
}

export enum OrganizationType {
  COOP = 'COOP',
  SACCO = 'SACCO',
}

export enum BusinessVerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export enum MembershipLinkageStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export interface RegisterUserInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'RETAIL_TRADER' | 'SUPPLIER' | 'BUYER';
  entityType?: EntityType;
  walletAddress?: string;
}

export interface BusinessVerificationInput {
  registrationNumber: string;
  companyName: string;
  legalStructure: string;
  registrationDate?: Date;
  expiryDate?: Date;
  documentUrl?: string;
}

export interface MembershipLinkageInput {
  organizationType: OrganizationType;
  organizationId: string;
  membershipNumber: string;
}

export interface OnboardingStatus {
  completed: boolean;
  currentStep: OnboardingStep;
  steps: OnboardingStepStatus[];
  trustBand?: string;
  transactionCap?: number;
}

export interface OnboardingStepStatus {
  name: string;
  step: OnboardingStep;
  status: 'complete' | 'pending' | 'in_progress';
  completedAt?: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  entityType?: EntityType;
  onboardingCompleted: boolean;
  onboardingStep?: OnboardingStep;
  trustBand?: string;
  transactionCap?: number;
  roles: string[];
  permissions: string[];
}

export interface TrustBandResult {
  trustBand: string;
  trustScore: number;
  dimensions: {
    identity: number;
    transaction: number;
    financial: number;
    performance: number;
    learning: number;
  };
}

export interface TransactionCapsResult {
  transactionCap: number;
  dailyCap?: number;
  monthlyCap?: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}


