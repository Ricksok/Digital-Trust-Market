import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stakingApi, StakingPool, Stake, CreateStakingPoolData } from '@/lib/api/staking';
import { useUIStore } from '@/lib/stores/ui.store';

/**
 * Get staking pools query hook
 */
export const useStakingPools = (filters?: { isActive?: boolean }) => {
  return useQuery({
    queryKey: ['staking', 'pools', filters],
    queryFn: async () => {
      const response = await stakingApi.getPools(filters);
      return response;
    },
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Get user stakes query hook
 */
export const useUserStakes = (stakerId?: string) => {
  return useQuery({
    queryKey: ['staking', 'stakes', stakerId],
    queryFn: async () => {
      const response = await stakingApi.getUserStakes(stakerId);
      return response;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Create staking pool mutation hook
 */
export const useCreateStakingPool = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: (data: CreateStakingPoolData) => stakingApi.createPool(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staking', 'pools'] });
      showNotification({
        type: 'success',
        message: 'Staking pool created successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to create staking pool';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

/**
 * Stake tokens mutation hook
 */
export const useStake = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: ({ poolId, amount }: { poolId: string; amount: number }) =>
      stakingApi.stake(poolId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staking', 'pools'] });
      queryClient.invalidateQueries({ queryKey: ['staking', 'stakes'] });
      showNotification({
        type: 'success',
        message: 'Tokens staked successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to stake tokens';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

/**
 * Unstake tokens mutation hook
 */
export const useUnstake = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: (stakeId: string) => stakingApi.unstake(stakeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staking', 'pools'] });
      queryClient.invalidateQueries({ queryKey: ['staking', 'stakes'] });
      showNotification({
        type: 'success',
        message: 'Tokens unstaked successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to unstake tokens';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

/**
 * Get staking pool by ID query hook
 */
export const useStakingPool = (id: string) => {
  return useQuery({
    queryKey: ['staking', 'pools', id],
    queryFn: async () => {
      const response = await stakingApi.getPoolById(id);
      return response;
    },
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Update staking pool mutation hook
 */
export const useUpdateStakingPool = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StakingPool> }) => stakingApi.updatePool(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staking', 'pools'] });
      queryClient.invalidateQueries({ queryKey: ['staking', 'pools', variables.id] });
      showNotification({
        type: 'success',
        message: 'Staking pool updated successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to update staking pool';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

/**
 * Deactivate staking pool mutation hook
 */
export const useDeactivateStakingPool = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: (id: string) => stakingApi.deactivatePool(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: ['staking', 'pools'] });
      queryClient.invalidateQueries({ queryKey: ['staking', 'pools', id] });
      showNotification({
        type: 'success',
        message: 'Staking pool deactivated successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to deactivate staking pool';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};




