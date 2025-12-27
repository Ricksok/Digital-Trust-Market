/**
 * Onboarding API Client
 * Feature 0.1: Onboarding & Identity System
 */

import apiClient from './client';

export interface RegisterUserInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'RETAIL_TRADER' | 'SUPPLIER' | 'BUYER';
  entityType?: 'INDIVIDUAL' | 'COMPANY' | 'SACCO' | 'FUND' | 'INSTITUTIONAL_BUYER';
  walletAddress?: string;
}

export interface BusinessVerificationInput {
  registrationNumber: string;
  companyName: string;
  legalStructure: string;
  registrationDate?: string;
  expiryDate?: string;
  documentUrl?: string;
}

export interface MembershipLinkageInput {
  organizationType: 'COOP' | 'SACCO';
  organizationId: string;
  membershipNumber: string;
}

export interface OnboardingStatus {
  completed: boolean;
  currentStep: string;
  steps: Array<{
    name: string;
    step: string;
    status: 'complete' | 'pending' | 'in_progress';
    completedAt?: string;
  }>;
  trustBand?: string;
  transactionCap?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  entityType?: string;
  onboardingCompleted: boolean;
  onboardingStep?: string;
  trustBand?: string;
  transactionCap?: number;
  roles: string[];
  permissions: string[];
  token?: string;
  refreshToken?: string;
}

export interface OnboardingResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export const onboardingApi = {
  /**
   * Register new user with onboarding workflow
   */
  register: async (data: RegisterUserInput): Promise<OnboardingResponse<UserProfile>> => {
    const response = await apiClient.post('/api/onboarding/register', data);
    return response.data;
  },

  /**
   * Get onboarding status
   */
  getStatus: async (): Promise<OnboardingResponse<OnboardingStatus>> => {
    const response = await apiClient.get('/api/onboarding/status');
    return response.data;
  },

  /**
   * Get user profile with permissions
   */
  getProfile: async (): Promise<OnboardingResponse<UserProfile>> => {
    const response = await apiClient.get('/api/onboarding/profile');
    return response.data;
  },

  /**
   * Submit business verification
   */
  submitBusinessVerification: async (
    data: BusinessVerificationInput
  ): Promise<OnboardingResponse> => {
    const response = await apiClient.post('/api/onboarding/business/verify', data);
    return response.data;
  },

  /**
   * Link co-op or SACCO membership
   */
  linkMembership: async (data: MembershipLinkageInput): Promise<OnboardingResponse> => {
    const response = await apiClient.post('/api/onboarding/membership/link', data);
    return response.data;
  },

  /**
   * Complete onboarding
   */
  completeOnboarding: async (): Promise<OnboardingResponse> => {
    const response = await apiClient.post('/api/onboarding/complete');
    return response.data;
  },
};

