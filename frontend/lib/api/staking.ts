import apiClient from './client';

export interface StakingPool {
  id: string;
  tokenId: string;
  name: string;
  description?: string;
  apy: number;
  minStakeAmount: number;
  maxStakeAmount?: number;
  lockPeriodDays: number;
  isActive: boolean;
  totalStaked: number;
  totalStakers: number;
  createdAt: string;
  updatedAt: string;
  token?: {
    id: string;
    symbol: string;
    name: string;
  };
}

export interface Stake {
  id: string;
  stakerId: string;
  poolId: string;
  tokenId: string;
  amount: number;
  stakedAt: string;
  lockedUntil?: string;
  isLocked: boolean;
  status: string;
  totalRewardsEarned: number;
  pendingRewards: number;
  pool?: StakingPool;
  staker?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateStakingPoolData {
  tokenId: string;
  name: string;
  description?: string;
  apy: number;
  minStakeAmount: number;
  maxStakeAmount?: number;
  lockPeriodDays: number;
}

export const stakingApi = {
  // Pools
  createPool: async (data: CreateStakingPoolData) => {
    const response = await apiClient.post('/api/staking/pools', data);
    return response.data;
  },

  getPools: async (params?: { isActive?: boolean }) => {
    const response = await apiClient.get('/api/staking/pools', { params });
    return response.data;
  },

  // Staking
  stake: async (poolId: string, amount: number) => {
    const response = await apiClient.post('/api/staking/stake', { poolId, amount });
    return response.data;
  },

  unstake: async (stakeId: string) => {
    const response = await apiClient.post(`/api/staking/unstake/${stakeId}`);
    return response.data;
  },

  getUserStakes: async (stakerId?: string) => {
    const url = stakerId 
      ? `/api/staking/stakes/${stakerId}`
      : '/api/staking/stakes';
    const response = await apiClient.get(url);
    return response.data;
  },

  getPoolById: async (id: string) => {
    const response = await apiClient.get(`/api/staking/pools/${id}`);
    return response.data;
  },

  updatePool: async (id: string, data: Partial<StakingPool>) => {
    const response = await apiClient.put(`/api/staking/pools/${id}`, data);
    return response.data;
  },

  deactivatePool: async (id: string) => {
    const response = await apiClient.delete(`/api/staking/pools/${id}`);
    return response.data;
  },
};

