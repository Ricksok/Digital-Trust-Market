import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trustApi, TrustScore, TrustEvent } from '@/lib/api/trust';
import { useUIStore } from '@/lib/stores/ui.store';

/**
 * Get trust score query hook
 */
export const useTrustScore = (entityId: string) => {
  return useQuery({
    queryKey: ['trust', 'score', entityId],
    queryFn: async () => {
      const response = await trustApi.getScore(entityId);
      return response;
    },
    enabled: !!entityId,
    staleTime: 5 * 60 * 1000, // 5 minutes (trust scores don't change frequently)
  });
};

/**
 * Get trust history query hook
 */
export const useTrustHistory = (entityId: string) => {
  return useQuery({
    queryKey: ['trust', 'history', entityId],
    queryFn: async () => {
      const response = await trustApi.getHistory(entityId);
      return response;
    },
    enabled: !!entityId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Get trust explanation query hook
 */
export const useTrustExplanation = (entityId: string) => {
  return useQuery({
    queryKey: ['trust', 'explain', entityId],
    queryFn: async () => {
      const response = await trustApi.explain(entityId);
      return response;
    },
    enabled: !!entityId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get decay/recovery history query hook
 */
export const useDecayRecoveryHistory = (entityId: string) => {
  return useQuery({
    queryKey: ['trust', 'decay-recovery', entityId],
    queryFn: async () => {
      const response = await trustApi.getDecayRecoveryHistory(entityId);
      return response;
    },
    enabled: !!entityId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Track user activity mutation hook
 */
export const useTrackActivity = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: ({ activityType, activityValue }: { activityType: string; activityValue?: number }) =>
      trustApi.trackActivity(activityType, activityValue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trust'] });
      // Silent success - activity tracking is background
    },
    onError: (error: any) => {
      // Silent error - activity tracking failures shouldn't disrupt UX
      console.error('Failed to track activity:', error);
    },
  });
};



