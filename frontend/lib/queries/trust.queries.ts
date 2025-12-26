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
 * Update trust score mutation hook
 */
export const useUpdateTrustScore = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: ({ entityId, data }: { entityId: string; data: { trustScore?: number; reason: string } }) =>
      trustApi.update(entityId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trust', 'score', variables.entityId] });
      queryClient.invalidateQueries({ queryKey: ['trust', 'history', variables.entityId] });
      queryClient.invalidateQueries({ queryKey: ['trust', 'explain', variables.entityId] });
      showNotification({
        type: 'success',
        message: 'Trust score updated successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to update trust score';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};



