/**
 * Onboarding React Query Hooks
 * Feature 0.1: Onboarding & Identity System
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingApi, OnboardingStatus, UserProfile, BusinessVerificationInput, MembershipLinkageInput, RegisterUserInput } from '../api/onboarding';
import { useUIStore } from '../stores/ui.store';
import { useAuthStore, User } from '../stores/auth.store';

/**
 * Register user with onboarding workflow mutation hook
 * This replaces the old useRegister hook for the new onboarding flow
 */
export const useRegisterOnboarding = () => {
  const { setAuth, setAuthState, setError } = useAuthStore();
  const { showNotification } = useUIStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterUserInput) => onboardingApi.register(data),
    onMutate: () => {
      setAuthState('AUTHENTICATING');
      setError(null);
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        const profile = response.data;
        const token = (profile as any).token;
        const refreshToken = (profile as any).refreshToken;
        
        if (token) {
          // Store tokens and user in auth store
          const storeUser = {
            id: profile.id,
            email: profile.email,
            role: profile.roles[0] || 'RETAIL_TRADER',
            userType: 'TRADER', // Default
            walletAddress: undefined,
            isVerified: false,
            firstName: profile.firstName,
            lastName: profile.lastName,
          };
          
          setAuth(storeUser, token, refreshToken);
          queryClient.invalidateQueries({ queryKey: ['onboarding'] });
          queryClient.invalidateQueries({ queryKey: ['user', 'current'] });
        }
        
        showNotification({
          type: 'success',
          message: response.message || 'Registration successful! Please complete onboarding.',
        });
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Registration failed';
      setError(errorMessage);
      setAuthState('UNAUTHENTICATED');
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

/**
 * Get onboarding status query hook
 */
export const useOnboardingStatus = () => {
  return useQuery({
    queryKey: ['onboarding', 'status'],
    queryFn: async () => {
      const response = await onboardingApi.getStatus();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch onboarding status');
      }
      return response.data;
    },
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Get user profile query hook
 */
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['onboarding', 'profile'],
    queryFn: async () => {
      const response = await onboardingApi.getProfile();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch user profile');
      }
      return response.data;
    },
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Submit business verification mutation hook
 */
export const useSubmitBusinessVerification = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: (data: BusinessVerificationInput) => onboardingApi.submitBusinessVerification(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      showNotification({
        type: 'success',
        message: response.message || 'Business verification submitted successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to submit business verification';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

/**
 * Link membership mutation hook
 */
export const useLinkMembership = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: (data: MembershipLinkageInput) => onboardingApi.linkMembership(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      showNotification({
        type: 'success',
        message: response.message || 'Membership linkage submitted successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to link membership';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

/**
 * Complete onboarding mutation hook
 */
export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: () => onboardingApi.completeOnboarding(),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'current'] });
      showNotification({
        type: 'success',
        message: response.message || 'Onboarding completed successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to complete onboarding';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

