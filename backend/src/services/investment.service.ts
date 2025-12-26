import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

// String constants for SQLite (no enums)
const InvestmentStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  ESCROWED: 'ESCROWED',
  RELEASED: 'RELEASED',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED',
};

export const createInvestment = async (investorId: string, data: {
  projectId: string;
  amount: number;
  notes?: string;
}) => {
  // Verify user is an investor
  const user = await prisma.user.findUnique({
    where: { id: investorId },
    select: { userType: true },
  });

  if (!user || user.userType !== 'INVESTOR') {
    throw createError('Only investors can create investments', 403);
  }

  const project = await prisma.project.findUnique({
    where: { id: data.projectId },
  });

  if (!project) {
    throw createError('Project not found', 404);
  }

  if (project.status !== 'APPROVED' && project.status !== 'ACTIVE') {
    throw createError('Project is not accepting investments', 400);
  }

  if (data.amount < Number(project.minInvestment)) {
    throw createError(`Minimum investment is ${project.minInvestment}`, 400);
  }

  if (project.maxInvestment && data.amount > Number(project.maxInvestment)) {
    throw createError(`Maximum investment is ${project.maxInvestment}`, 400);
  }

  const investment = await prisma.investment.create({
    data: {
      investorId,
      projectId: data.projectId,
      amount: data.amount,
      notes: data.notes,
      status: InvestmentStatus.PENDING,
    },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          targetAmount: true,
          currentAmount: true,
        },
      },
      investor: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return investment;
};

export const getInvestments = async (userId: string, query: any) => {
  const { page = 1, limit = 10, status } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = { investorId: userId };
  if (status) where.status = status;

  const [investments, total] = await Promise.all([
    prisma.investment.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
            targetAmount: true,
            currentAmount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.investment.count({ where }),
  ]);

  return {
    investments,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getInvestmentById = async (id: string, userId: string) => {
  const investment = await prisma.investment.findUnique({
    where: { id },
    include: {
      project: true,
      investor: true,
      escrowContract: true,
      payments: true,
    },
  });

  if (!investment) {
    throw createError('Investment not found', 404);
  }

  if (investment.investorId !== userId) {
    throw createError('Unauthorized', 403);
  }

  return investment;
};

export const cancelInvestment = async (id: string, userId: string) => {
  const investment = await prisma.investment.findUnique({
    where: { id },
  });

  if (!investment) {
    throw createError('Investment not found', 404);
  }

  if (investment.investorId !== userId) {
    throw createError('Unauthorized', 403);
  }

  if (investment.status !== InvestmentStatus.PENDING) {
    throw createError('Cannot cancel investment in current status', 400);
  }

  const updatedInvestment = await prisma.investment.update({
    where: { id },
    data: { status: InvestmentStatus.CANCELLED },
  });

  return updatedInvestment;
};

export const getProjectInvestments = async (projectId: string, userId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw createError('Project not found', 404);
  }

  // Only project owner or admin can view all investments
  if (project.fundraiserId !== userId) {
    throw createError('Unauthorized', 403);
  }

  const investments = await prisma.investment.findMany({
    where: { projectId },
    include: {
      investor: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return investments;
};


