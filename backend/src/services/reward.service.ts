import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import * as tokenService from './token.service';
import * as trustService from './trust.service';

const prisma = new PrismaClient();

// Helper to safely access reward models
const getRewardDistributionModel = () => {
  return prisma.rewardDistribution;
};

// Reward Types
const REWARD_TYPES = {
  STAKING: 'STAKING',
  GOVERNANCE: 'GOVERNANCE',
  TRANSACTION: 'TRANSACTION',
  REFERRAL: 'REFERRAL',
  LEARNING: 'LEARNING',
};

/**
 * Distribute reward tokens
 */
export const distributeReward = async (data: {
  recipientId: string;
  tokenId: string;
  amount: number;
  rewardType: string;
  reason?: string;
  poolId?: string;
  proposalId?: string;
}) => {
  if (data.amount <= 0) {
    throw createError('Reward amount must be positive', 400);
  }

  // Get recipient's trust score
  const trustScore = await trustService.getTrustScore(data.recipientId);

  // Mint reward tokens
  await tokenService.mint(
    data.recipientId,
    data.tokenId,
    data.amount,
    'REWARD',
    undefined
  );

  // Create reward distribution record
  const rewardModel = getRewardDistributionModel();
  const reward = await rewardModel.create({
    data: {
      recipientId: data.recipientId,
      tokenId: data.tokenId,
      poolId: data.poolId,
      proposalId: data.proposalId,
      amount: data.amount,
      rewardType: data.rewardType,
      reason: data.reason,
      recipientTrustScore: trustScore.trustScore,
      status: 'DISTRIBUTED',
      distributedAt: new Date(),
    },
    include: {
      recipient: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          companyName: true,
        },
      },
      token: true,
      pool: {
        include: {
          token: true,
        },
      },
    },
  });

  return reward;
};

/**
 * Claim reward (mark as claimed)
 */
export const claimReward = async (rewardId: string, transactionHash?: string) => {
  const rewardModel = getRewardDistributionModel();
  const reward = await rewardModel.findUnique({
    where: { id: rewardId },
  });

  if (!reward) {
    throw createError('Reward not found', 404);
  }

  if (reward.status !== 'DISTRIBUTED') {
    throw createError('Reward is not available for claiming', 400);
  }

  await rewardModel.update({
    where: { id: rewardId },
    data: {
      status: 'CLAIMED',
      claimedAt: new Date(),
      transactionHash,
    },
  });

  return await rewardModel.findUnique({
    where: { id: rewardId },
    include: {
      recipient: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          companyName: true,
        },
      },
      token: true,
    },
  });
};

/**
 * Get rewards for a user
 */
export const getUserRewards = async (
  recipientId: string,
  filters?: {
    rewardType?: string;
    status?: string;
    limit?: number;
  }
) => {
  const rewardModel = getRewardDistributionModel();
  const rewards = await rewardModel.findMany({
    where: {
      recipientId,
      ...(filters?.rewardType && { rewardType: filters.rewardType }),
      ...(filters?.status && { status: filters.status }),
    },
    include: {
      token: true,
      pool: {
        include: {
          token: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: filters?.limit || 50,
  });

  return rewards;
};

/**
 * Get total rewards earned by user
 */
export const getTotalRewards = async (recipientId: string) => {
  const rewardModel = getRewardDistributionModel();
  const rewards = await rewardModel.findMany({
    where: {
      recipientId,
      status: { in: ['DISTRIBUTED', 'CLAIMED'] },
    },
    include: {
      token: true,
    },
  });

  const totals: Record<string, number> = {};
  rewards.forEach((reward: any) => {
    const symbol = reward.token.symbol;
    totals[symbol] = (totals[symbol] || 0) + reward.amount;
  });

  return totals;
};

/**
 * Reward for transaction completion
 */
export const rewardTransaction = async (
  recipientId: string,
  amount: number,
  reason: string
) => {
  const rewardToken = await tokenService.getToken('BTA-REWARD');
  return await distributeReward({
    recipientId,
    tokenId: rewardToken.id,
    amount,
    rewardType: REWARD_TYPES.TRANSACTION,
    reason,
  });
};

/**
 * Reward for learning/course completion
 */
export const rewardLearning = async (
  recipientId: string,
  amount: number,
  courseName: string
) => {
  const rewardToken = await tokenService.getToken('BTA-REWARD');
  return await distributeReward({
    recipientId,
    tokenId: rewardToken.id,
    amount,
    rewardType: REWARD_TYPES.LEARNING,
    reason: `Course completion: ${courseName}`,
  });
};

/**
 * Reward for governance participation
 */
export const rewardGovernance = async (
  recipientId: string,
  proposalId: string,
  amount: number
) => {
  const rewardToken = await tokenService.getToken('BTA-REWARD');
  return await distributeReward({
    recipientId,
    tokenId: rewardToken.id,
    amount,
    rewardType: REWARD_TYPES.GOVERNANCE,
    reason: 'Governance participation',
    proposalId,
  });
};

