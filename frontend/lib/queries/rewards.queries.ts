import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rewardsApi, RewardDistribution, TotalRewards } from '@/lib/api/rewards';
import { useUIStore } from '@/lib/stores/ui.store';

/**
 * Get user rewards query hook
 */
export const useUserRewards = (
  recipientId?: string,
  filters?: { rewardType?: string; status?: string; limit?: number }
) => {
  return useQuery({
    queryKey: ['rewards', 'user', recipientId, filters],
    queryFn: async () => {
      const response = await rewardsApi.getUserRewards(recipientId, filters);
      return response;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Get total rewards query hook
 */
export const useTotalRewards = (recipientId?: string) => {
  return useQuery({
    queryKey: ['rewards', 'totals', recipientId],
    queryFn: async () => {
      const response = await rewardsApi.getTotalRewards(recipientId);
      return response;
    },
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Claim reward mutation hook
 */
export const useClaimReward = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: ({ rewardId, transactionHash }: { rewardId: string; transactionHash?: string }) =>
      rewardsApi.claimReward(rewardId, transactionHash),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      showNotification({
        type: 'success',
        message: 'Reward claimed successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to claim reward';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};




