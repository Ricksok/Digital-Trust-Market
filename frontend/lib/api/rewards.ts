import apiClient from './client';

export interface RewardDistribution {
  id: string;
  recipientId: string;
  rewardType: string;
  amount: number;
  tokenId: string;
  status: string;
  distributedAt?: string;
  claimedAt?: string;
  transactionHash?: string;
  reason?: string;
  metadata?: any;
  recipient?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  token?: {
    id: string;
    symbol: string;
    name: string;
  };
}

export interface TotalRewards {
  totalClaimed: number;
  totalPending: number;
  totalAvailable: number;
  byType: {
    [key: string]: {
      claimed: number;
      pending: number;
      available: number;
    };
  };
}

export const rewardsApi = {
  getUserRewards: async (
    recipientId?: string,
    params?: { rewardType?: string; status?: string; limit?: number }
  ) => {
    const url = recipientId 
      ? `/api/rewards/rewards/${recipientId}`
      : '/api/rewards/rewards';
    const response = await apiClient.get(url, { params });
    return response.data;
  },

  getTotalRewards: async (recipientId?: string) => {
    const url = recipientId 
      ? `/api/rewards/rewards/${recipientId}/totals`
      : '/api/rewards/rewards/totals';
    const response = await apiClient.get(url);
    return response.data;
  },

  claimReward: async (rewardId: string, transactionHash?: string) => {
    const response = await apiClient.post(`/api/rewards/rewards/${rewardId}/claim`, {
      transactionHash,
    });
    return response.data;
  },
};

