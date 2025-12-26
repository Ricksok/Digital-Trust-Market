import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboard = async (userId: string, role: string) => {
  // Different dashboards based on user role
  if (role.includes('INVESTOR')) {
    return getInvestorDashboard(userId);
  } else if (role.includes('FUNDRAISER') || role === 'SME_STARTUP' || role === 'SOCIAL_ENTERPRISE' || role === 'REAL_ESTATE_PROJECT') {
    return getFundraiserDashboard(userId);
  } else if (role === 'ADMIN') {
    return getAdminDashboard();
  }

  return {};
};

const getInvestorDashboard = async (userId: string) => {
  const [totalInvestments, totalAmount, activeProjects, recentInvestments] = await Promise.all([
    prisma.investment.count({
      where: { investorId: userId },
    }),
    prisma.investment.aggregate({
      where: { investorId: userId },
      _sum: { amount: true },
    }),
    prisma.investment.count({
      where: {
        investorId: userId,
        project: {
          status: { in: ['APPROVED', 'ACTIVE'] },
        },
      },
    }),
    prisma.investment.findMany({
      where: { investorId: userId },
      take: 5,
      include: {
        project: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    totalInvestments,
    totalAmount: totalAmount._sum.amount || 0,
    activeProjects,
    recentInvestments,
  };
};

const getFundraiserDashboard = async (userId: string) => {
  const [totalProjects, totalRaised, activeProjects, recentProjects] = await Promise.all([
    prisma.project.count({
      where: { fundraiserId: userId },
    }),
    prisma.project.aggregate({
      where: { fundraiserId: userId },
      _sum: { currentAmount: true },
    }),
    prisma.project.count({
      where: {
        fundraiserId: userId,
        status: { in: ['APPROVED', 'ACTIVE'] },
      },
    }),
    prisma.project.findMany({
      where: { fundraiserId: userId },
      take: 5,
      include: {
        _count: {
          select: {
            investments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return {
    totalProjects,
    totalRaised: totalRaised._sum.currentAmount || 0,
    activeProjects,
    recentProjects,
  };
};

const getAdminDashboard = async () => {
  const [totalUsers, totalProjects, totalInvestments, totalRevenue] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.investment.count(),
    prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalUsers,
    totalProjects,
    totalInvestments,
    totalRevenue: totalRevenue._sum.amount || 0,
  };
};

export const getProjectStats = async (query: any) => {
  const { startDate, endDate } = query;
  const where: any = {};
  
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [total, byStatus, byCategory] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.groupBy({
      by: ['status'],
      where,
      _count: true,
    }),
    prisma.project.groupBy({
      by: ['category'],
      where,
      _count: true,
    }),
  ]);

  return {
    total,
    byStatus,
    byCategory,
  };
};

export const getInvestmentStats = async (userId: string, query: any) => {
  const { startDate, endDate } = query;
  const where: any = { investorId: userId };
  
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [total, totalAmount, byStatus] = await Promise.all([
    prisma.investment.count({ where }),
    prisma.investment.aggregate({
      where,
      _sum: { amount: true },
    }),
    prisma.investment.groupBy({
      by: ['status'],
      where,
      _count: true,
    }),
  ]);

  return {
    total,
    totalAmount: totalAmount._sum.amount || 0,
    byStatus,
  };
};

export const getRevenueStats = async (query: any) => {
  const { startDate, endDate } = query;
  const where: any = { status: 'COMPLETED' };
  
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [totalRevenue, totalTransactions, byMonth] = await Promise.all([
    prisma.payment.aggregate({
      where,
      _sum: { amount: true },
    }),
    prisma.payment.count({ where }),
    // TODO: Group by month
    Promise.resolve([]),
  ]);

  return {
    totalRevenue: totalRevenue._sum.amount || 0,
    totalTransactions,
    byMonth,
  };
};

export const getUserStats = async (query: any) => {
  const { startDate, endDate } = query;
  const where: any = {};
  
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [total, byRole, byType, verified] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.groupBy({
      by: ['role'],
      where,
      _count: true,
    }),
    prisma.user.groupBy({
      by: ['userType'],
      where,
      _count: true,
    }),
    prisma.user.count({
      where: { ...where, isVerified: true },
    }),
  ]);

  return {
    total,
    byRole,
    byType,
    verified,
    unverified: total - verified,
  };
};


