import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import { ethers } from 'ethers';

const prisma = new PrismaClient();

// String constants for SQLite (no enums)
const EscrowStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  RELEASED: 'RELEASED',
  REFUNDED: 'REFUNDED',
  DISPUTED: 'DISPUTED',
};

export const createEscrow = async (userId: string, data: {
  investmentId: string;
  amount: number;
  releaseConditions?: any;
}) => {
  const investment = await prisma.investment.findUnique({
    where: { id: data.investmentId },
    include: { project: true },
  });

  if (!investment) {
    throw createError('Investment not found', 404);
  }

  if (investment.investorId !== userId) {
    throw createError('Unauthorized', 403);
  }

  // TODO: Deploy smart contract
  // const contractAddress = await deployEscrowContract(data);

  const escrow = await prisma.escrowContract.create({
    data: {
      investmentId: data.investmentId,
      projectId: investment.projectId,
      amount: data.amount,
      contractAddress: '0x0000000000000000000000000000000000000000', // TODO: Replace with actual contract address
      status: EscrowStatus.PENDING,
      releaseConditions: data.releaseConditions ? JSON.stringify(data.releaseConditions) : null,
    },
    include: {
      investment: {
        include: {
          investor: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      },
      project: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return escrow;
};

export const getEscrowById = async (id: string, userId: string) => {
  const escrow = await prisma.escrowContract.findUnique({
    where: { id },
    include: {
      investment: {
        include: {
          investor: true,
        },
      },
      project: true,
    },
  });

  if (!escrow) {
    throw createError('Escrow not found', 404);
  }

  // Check authorization
  if (escrow.investment.investorId !== userId && escrow.project.fundraiserId !== userId) {
    throw createError('Unauthorized', 403);
  }

  return escrow;
};

export const releaseEscrow = async (id: string, userId: string) => {
  const escrow = await prisma.escrowContract.findUnique({
    where: { id },
    include: {
      project: true,
    },
  });

  if (!escrow) {
    throw createError('Escrow not found', 404);
  }

  if (escrow.project.fundraiserId !== userId) {
    throw createError('Unauthorized', 403);
  }

  if (escrow.status !== EscrowStatus.ACTIVE) {
    throw createError('Escrow is not active', 400);
  }

  // TODO: Call smart contract to release funds
  // await releaseFundsFromContract(escrow.contractAddress);

  const updatedEscrow = await prisma.escrowContract.update({
    where: { id },
    data: {
      status: EscrowStatus.RELEASED,
      releasedAt: new Date(),
    },
  });

  return updatedEscrow;
};

export const refundEscrow = async (id: string, userId: string) => {
  const escrow = await prisma.escrowContract.findUnique({
    where: { id },
    include: {
      investment: true,
    },
  });

  if (!escrow) {
    throw createError('Escrow not found', 404);
  }

  if (escrow.investment.investorId !== userId) {
    throw createError('Unauthorized', 403);
  }

  if (escrow.status !== EscrowStatus.ACTIVE) {
    throw createError('Escrow is not active', 400);
  }

  // TODO: Call smart contract to refund funds
  // await refundFundsFromContract(escrow.contractAddress);

  const updatedEscrow = await prisma.escrowContract.update({
    where: { id },
    data: {
      status: EscrowStatus.REFUNDED,
      refundedAt: new Date(),
    },
  });

  return updatedEscrow;
};

export const createDispute = async (id: string, userId: string, data: {
  reason: string;
}) => {
  const escrow = await prisma.escrowContract.findUnique({
    where: { id },
  });

  if (!escrow) {
    throw createError('Escrow not found', 404);
  }

  // TODO: Verify user authorization

  const updatedEscrow = await prisma.escrowContract.update({
    where: { id },
    data: {
      status: EscrowStatus.DISPUTED,
      disputeReason: data.reason,
    },
  });

  return updatedEscrow;
};

export const getEscrowByInvestment = async (investmentId: string, userId: string) => {
  const escrow = await prisma.escrowContract.findFirst({
    where: { investmentId },
    include: {
      investment: {
        include: {
          investor: true,
        },
      },
      project: true,
    },
  });

  if (!escrow) {
    throw createError('Escrow not found', 404);
  }

  // Check authorization
  if (escrow.investment.investorId !== userId && escrow.project.fundraiserId !== userId) {
    throw createError('Unauthorized', 403);
  }

  return escrow;
};


