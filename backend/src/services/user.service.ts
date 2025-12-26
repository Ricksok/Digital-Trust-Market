import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      userType: true,
      walletAddress: true,
      isVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  return user;
};

export const updateUser = async (id: string, data: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  walletAddress?: string;
}) => {
  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      userType: true,
      walletAddress: true,
      isVerified: true,
      updatedAt: true,
    },
  });

  return user;
};

export const getAllUsers = async (query: any) => {
  const { page = 1, limit = 10, role, userType } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (role) where.role = role;
  if (userType) where.userType = userType;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: Number(limit),
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        userType: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};


