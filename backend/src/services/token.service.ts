import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient() as any; // Temporary workaround until Prisma client is regenerated

// Token Types
const TOKEN_TYPES = {
  BTA_GOV: 'BTA_GOV',      // Governance Token
  BTA_REWARD: 'BTA_REWARD', // Rewards Token
  BTA_UTIL: 'BTA_UTIL',     // Utility & Staking Token
  BTA_GUAR: 'BTA_GUAR',     // Guarantee Token
};

// Transaction Types
const TRANSACTION_TYPES = {
  TRANSFER: 'TRANSFER',
  REWARD: 'REWARD',
  STAKE: 'STAKE',
  UNSTAKE: 'UNSTAKE',
  BURN: 'BURN',
  MINT: 'MINT',
};

/**
 * Initialize tokens (run once on setup)
 */
export const initializeTokens = async () => {
  const tokens = [
    {
      tokenType: TOKEN_TYPES.BTA_GOV,
      symbol: 'BTA-GOV',
      name: 'BarterTrade Governance Token',
      initialSupply: 1000000000, // 1 billion
      maxSupply: 1000000000,
      decimals: 18,
    },
    {
      tokenType: TOKEN_TYPES.BTA_REWARD,
      symbol: 'BTA-REWARD',
      name: 'BarterTrade Reward Token',
      initialSupply: 0,
      maxSupply: null, // Unlimited
      inflationRate: 5.0, // 5% annual
      decimals: 18,
    },
    {
      tokenType: TOKEN_TYPES.BTA_UTIL,
      symbol: 'BTA-UTIL',
      name: 'BarterTrade Utility Token',
      initialSupply: 500000000, // 500 million
      maxSupply: 2000000000, // 2 billion max
      decimals: 18,
    },
    {
      tokenType: TOKEN_TYPES.BTA_GUAR,
      symbol: 'BTA-GUAR',
      name: 'BarterTrade Guarantee Token',
      initialSupply: 0,
      maxSupply: null, // Unlimited (minted per guarantee)
      decimals: 18,
    },
  ];

  const createdTokens = [];
  for (const tokenData of tokens) {
    const existing = await prisma.token.findUnique({
      where: { symbol: tokenData.symbol },
    });

    if (!existing) {
      const token = await prisma.token.create({
        data: {
          ...tokenData,
          totalSupply: tokenData.initialSupply || 0,
          circulatingSupply: tokenData.initialSupply || 0,
        },
      });
      createdTokens.push(token);
    } else {
      createdTokens.push(existing);
    }
  }

  return createdTokens;
};

/**
 * Get token by symbol or type
 */
export const getToken = async (identifier: string) => {
  const token = await prisma.token.findFirst({
    where: {
      OR: [
        { symbol: identifier },
        { tokenType: identifier },
      ],
    },
  });

  if (!token) {
    throw createError('Token not found', 404);
  }

  return token;
};

/**
 * Get token balance for an entity
 */
export const getBalance = async (entityId: string, tokenId: string) => {
  let balance = await prisma.tokenBalance.findUnique({
    where: {
      entityId_tokenId: {
        entityId,
        tokenId,
      },
    },
    include: {
      token: true,
    },
  });

  if (!balance) {
    // Create zero balance
    balance = await prisma.tokenBalance.create({
      data: {
        entityId,
        tokenId,
        balance: 0,
        locked: 0,
        available: 0,
      },
      include: {
        token: true,
      },
    });
  }

  return balance;
};

/**
 * Get all balances for an entity
 */
export const getAllBalances = async (entityId: string) => {
  const balances = await prisma.tokenBalance.findMany({
    where: { entityId },
    include: {
      token: true,
    },
  });

  return balances;
};

/**
 * Transfer tokens between entities
 */
export const transfer = async (
  fromEntityId: string,
  toEntityId: string,
  tokenId: string,
  amount: number,
  contextType?: string,
  contextId?: string
) => {
  if (amount <= 0) {
    throw createError('Transfer amount must be positive', 400);
  }

  // Get or create balances
  const fromBalance = await getBalance(fromEntityId, tokenId);
  if (fromBalance.available < amount) {
    throw createError('Insufficient balance', 400);
  }

  // Update balances
  await prisma.tokenBalance.update({
    where: {
      entityId_tokenId: {
        entityId: fromEntityId,
        tokenId,
      },
    },
    data: {
      balance: fromBalance.balance - amount,
      available: fromBalance.available - amount,
    },
  });

  const toBalance = await getBalance(toEntityId, tokenId);
  await prisma.tokenBalance.update({
    where: {
      entityId_tokenId: {
        entityId: toEntityId,
        tokenId,
      },
    },
    data: {
      balance: toBalance.balance + amount,
      available: toBalance.available + amount,
    },
  });

  // Create transaction record
  const transaction = await prisma.tokenTransaction.create({
    data: {
      tokenId,
      fromEntityId,
      toEntityId,
      amount,
      transactionType: TRANSACTION_TYPES.TRANSFER,
      status: 'CONFIRMED',
      contextType,
      contextId,
    },
    include: {
      token: true,
    },
  });

  return transaction;
};

/**
 * Mint tokens (increase supply)
 */
export const mint = async (
  toEntityId: string,
  tokenId: string,
  amount: number,
  contextType?: string,
  contextId?: string
) => {
  if (amount <= 0) {
    throw createError('Mint amount must be positive', 400);
  }

  const token = await prisma.token.findUnique({ where: { id: tokenId } });
  if (!token) {
    throw createError('Token not found', 404);
  }

  // Check max supply
  if (token.maxSupply && token.totalSupply + amount > token.maxSupply) {
    throw createError('Minting would exceed max supply', 400);
  }

  // Update token supply
  await prisma.token.update({
    where: { id: tokenId },
    data: {
      totalSupply: token.totalSupply + amount,
      circulatingSupply: token.circulatingSupply + amount,
    },
  });

  // Update or create balance
  const balance = await getBalance(toEntityId, tokenId);
  await prisma.tokenBalance.update({
    where: {
      entityId_tokenId: {
        entityId: toEntityId,
        tokenId,
      },
    },
    data: {
      balance: balance.balance + amount,
      available: balance.available + amount,
    },
  });

  // Create transaction
  const transaction = await prisma.tokenTransaction.create({
    data: {
      tokenId,
      toEntityId,
      amount,
      transactionType: TRANSACTION_TYPES.MINT,
      status: 'CONFIRMED',
      contextType,
      contextId,
    },
  });

  return transaction;
};

/**
 * Burn tokens (decrease supply)
 */
export const burn = async (
  fromEntityId: string,
  tokenId: string,
  amount: number,
  contextType?: string,
  contextId?: string
) => {
  if (amount <= 0) {
    throw createError('Burn amount must be positive', 400);
  }

  const balance = await getBalance(fromEntityId, tokenId);
  if (balance.available < amount) {
    throw createError('Insufficient balance', 400);
  }

  // Update balance
  await prisma.tokenBalance.update({
    where: {
      entityId_tokenId: {
        entityId: fromEntityId,
        tokenId,
      },
    },
    data: {
      balance: balance.balance - amount,
      available: balance.available - amount,
    },
  });

  // Update token supply
  const token = await prisma.token.findUnique({ where: { id: tokenId } });
  if (token) {
    await prisma.token.update({
      where: { id: tokenId },
      data: {
        totalSupply: token.totalSupply - amount,
        circulatingSupply: token.circulatingSupply - amount,
      },
    });
  }

  // Create transaction
  const transaction = await prisma.tokenTransaction.create({
    data: {
      tokenId,
      fromEntityId,
      amount,
      transactionType: TRANSACTION_TYPES.BURN,
      status: 'CONFIRMED',
      contextType,
      contextId,
    },
  });

  return transaction;
};

/**
 * Lock tokens (for staking, escrow, etc.)
 */
export const lock = async (entityId: string, tokenId: string, amount: number) => {
  const balance = await getBalance(entityId, tokenId);
  if (balance.available < amount) {
    throw createError('Insufficient available balance', 400);
  }

  await prisma.tokenBalance.update({
    where: {
      entityId_tokenId: {
        entityId,
        tokenId,
      },
    },
    data: {
      available: balance.available - amount,
      locked: balance.locked + amount,
    },
  });

  return await getBalance(entityId, tokenId);
};

/**
 * Unlock tokens
 */
export const unlock = async (entityId: string, tokenId: string, amount: number) => {
  const balance = await getBalance(entityId, tokenId);
  if (balance.locked < amount) {
    throw createError('Insufficient locked balance', 400);
  }

  await prisma.tokenBalance.update({
    where: {
      entityId_tokenId: {
        entityId,
        tokenId,
      },
    },
    data: {
      available: balance.available + amount,
      locked: balance.locked - amount,
    },
  });

  return await getBalance(entityId, tokenId);
};

/**
 * Get transaction history
 */
export const getTransactionHistory = async (
  entityId: string,
  tokenId?: string,
  limit: number = 50
) => {
  const transactions = await prisma.tokenTransaction.findMany({
    where: {
      OR: [
        { fromEntityId: entityId },
        { toEntityId: entityId },
      ],
      ...(tokenId && { tokenId }),
    },
    include: {
      token: true,
    },
    orderBy: { timestamp: 'desc' },
    take: limit,
  });

  return transactions;
};

