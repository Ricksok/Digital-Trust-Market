import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import * as tokenService from './token.service';
import * as trustService from './trust.service';
import * as rewardService from './reward.service';

const prisma = new PrismaClient() as any; // Temporary workaround until Prisma client is regenerated

// Helper to safely access staking models
const getStakingPoolModel = () => {
  if (!prisma.stakingPool) {
    throw new Error('StakingPool model not available. Please run: npx prisma generate');
  }
  return prisma.stakingPool;
};

const getStakeModel = () => {
  if (!prisma.stake) {
    throw new Error('Stake model not available. Please run: npx prisma generate');
  }
  return prisma.stake;
};

/**
 * Create a staking pool
 */
export const createStakingPool = async (data: {
  tokenId: string;
  rewardTokenId?: string;
  name: string;
  description?: string;
  apy: number;
  minStakeAmount?: number;
  maxStakeAmount?: number;
  lockPeriod?: number; // days
  minTrustScore?: number;
}) => {
  const poolModel = getStakingPoolModel();
  const pool = await poolModel.create({
    data: {
      tokenId: data.tokenId,
      rewardTokenId: data.rewardTokenId,
      name: data.name,
      description: data.description,
      apy: data.apy,
      minStakeAmount: data.minStakeAmount || 0,
      maxStakeAmount: data.maxStakeAmount,
      lockPeriod: data.lockPeriod,
      minTrustScore: data.minTrustScore,
      isActive: true,
    },
    include: {
      token: true,
      rewardToken: true,
    },
  });

  return pool;
};

/**
 * Stake tokens
 */
export const stake = async (
  stakerId: string,
  poolId: string,
  amount: number
) => {
  if (amount <= 0) {
    throw createError('Stake amount must be positive', 400);
  }

  const poolModel = getStakingPoolModel();
  const pool = await poolModel.findUnique({
    where: { id: poolId },
    include: { token: true },
  });

  if (!pool) {
    throw createError('Staking pool not found', 404);
  }

  if (!pool.isActive) {
    throw createError('Staking pool is not active', 400);
  }

  if (amount < pool.minStakeAmount) {
    throw createError(`Minimum stake amount is ${pool.minStakeAmount}`, 400);
  }

  if (pool.maxStakeAmount && amount > pool.maxStakeAmount) {
    throw createError(`Maximum stake amount is ${pool.maxStakeAmount}`, 400);
  }

  // Check trust score requirement
  if (pool.minTrustScore) {
    const trustScore = await trustService.getTrustScore(stakerId);
    if (trustScore.trustScore < pool.minTrustScore) {
      throw createError(`Minimum trust score of ${pool.minTrustScore} required`, 400);
    }
  }

  // Check balance
  const balance = await tokenService.getBalance(stakerId, pool.tokenId);
  if (balance.available < amount) {
    throw createError('Insufficient balance', 400);
  }

  // Lock tokens
  await tokenService.lock(stakerId, pool.tokenId, amount);

  // Create stake
  const trustScore = await trustService.getTrustScore(stakerId);
  const stakeModel = getStakeModel();
  const stake = await stakeModel.create({
    data: {
      stakerId,
      poolId,
      tokenId: pool.tokenId,
      amount,
      isLocked: pool.lockPeriod ? true : false,
      lockedUntil: pool.lockPeriod
        ? new Date(Date.now() + pool.lockPeriod * 24 * 60 * 60 * 1000)
        : null,
      status: 'ACTIVE',
      stakerTrustScore: trustScore.trustScore,
    },
    include: {
      pool: {
        include: {
          token: true,
        },
      },
      token: true,
    },
  });

  // Update pool total
  await poolModel.update({
    where: { id: poolId },
    data: {
      totalStaked: pool.totalStaked + amount,
    },
  });

  // Create transaction record
  await prisma.tokenTransaction.create({
    data: {
      tokenId: pool.tokenId,
      fromEntityId: stakerId,
      amount,
      transactionType: 'STAKE',
      status: 'CONFIRMED',
      contextType: 'STAKING',
      contextId: poolId,
    },
  });

  return stake;
};

/**
 * Unstake tokens
 */
export const unstake = async (stakeId: string) => {
  const stakeModel = getStakeModel();
  const stake = await stakeModel.findUnique({
    where: { id: stakeId },
    include: {
      pool: true,
      token: true,
    },
  });

  if (!stake) {
    throw createError('Stake not found', 404);
  }

  if (stake.status !== 'ACTIVE') {
    throw createError('Stake is not active', 400);
  }

  // Check lock period
  if (stake.isLocked && stake.lockedUntil) {
    const now = new Date();
    if (now < stake.lockedUntil) {
      throw createError('Stake is still locked', 400);
    }
  }

  // Calculate rewards
  const rewards = await calculateStakingRewards(stakeId);

  // Unlock tokens
  await tokenService.unlock(stake.stakerId, stake.tokenId, stake.amount);

  // Update stake
  await stakeModel.update({
    where: { id: stakeId },
    data: {
      status: 'UNSTAKED',
      unstakedAt: new Date(),
      totalRewardsEarned: stake.totalRewardsEarned + rewards,
    },
  });

  // Update pool
  const poolModel = getStakingPoolModel();
  await poolModel.update({
    where: { id: stake.poolId },
    data: {
      totalStaked: stake.pool.totalStaked - stake.amount,
    },
  });

  // Create transaction record
  await prisma.tokenTransaction.create({
    data: {
      tokenId: stake.tokenId,
      toEntityId: stake.stakerId,
      amount: stake.amount,
      transactionType: 'UNSTAKE',
      status: 'CONFIRMED',
      contextType: 'STAKING',
      contextId: stake.poolId,
    },
  });

  // Distribute rewards if any
  if (rewards > 0 && stake.pool.rewardTokenId) {
    await distributeStakingRewards(stake.stakerId, stake.poolId, rewards);
  }

  return await stakeModel.findUnique({
    where: { id: stakeId },
    include: {
      pool: {
        include: {
          token: true,
          rewardToken: true,
        },
      },
      token: true,
    },
  });
};

/**
 * Calculate staking rewards
 */
export const calculateStakingRewards = async (stakeId: string) => {
  const stakeModel = getStakeModel();
  const stake = await stakeModel.findUnique({
    where: { id: stakeId },
    include: { pool: true },
  });

  if (!stake || stake.status !== 'ACTIVE') {
    return 0;
  }

  const now = new Date();
  const stakedAt = stake.stakedAt;
  const daysStaked = (now.getTime() - stakedAt.getTime()) / (1000 * 60 * 60 * 24);

  // Calculate rewards: amount * (APY / 100) * (days / 365)
  const rewards = stake.amount * (stake.pool.apy / 100) * (daysStaked / 365);

  return rewards;
};

/**
 * Distribute staking rewards
 */
export const distributeStakingRewards = async (
  recipientId: string,
  poolId: string,
  amount: number
) => {
  const pool = await prisma.stakingPool.findUnique({
    where: { id: poolId },
    include: { rewardToken: true },
  });

  if (!pool || !pool.rewardTokenId) {
    return;
  }

  // Mint reward tokens
  await tokenService.mint(
    recipientId,
    pool.rewardTokenId,
    amount,
    'STAKING',
    poolId
  );

  // Create reward distribution record using reward service
  await rewardService.distributeReward({
    recipientId,
    tokenId: pool.rewardTokenId,
    amount,
    rewardType: 'STAKING',
    reason: `Staking rewards from ${pool.name}`,
    poolId,
  });
};

/**
 * Get staking pools
 */
export const getStakingPools = async (filters?: { isActive?: boolean }) => {
  const pools = await prisma.stakingPool.findMany({
    where: {
      ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
    },
    include: {
      token: true,
      rewardToken: true,
      _count: {
        select: {
          stakes: true,
        },
      },
    },
    orderBy: { apy: 'desc' },
  });

  return pools;
};

/**
 * Get user's stakes
 */
export const getUserStakes = async (stakerId: string) => {
  const stakeModel = getStakeModel();
  const stakes = await stakeModel.findMany({
    where: { stakerId },
    include: {
      pool: {
        include: {
          token: true,
          rewardToken: true,
        },
      },
      token: true,
    },
    orderBy: { stakedAt: 'desc' },
  });

  // Calculate pending rewards for each stake
  const stakesWithRewards = await Promise.all(
    stakes.map(async (stake: any) => {
      const pendingRewards =
        stake.status === 'ACTIVE' ? await calculateStakingRewards(stake.id) : 0;

      return {
        ...stake,
        pendingRewards,
      };
    })
  );

  return stakesWithRewards;
};

