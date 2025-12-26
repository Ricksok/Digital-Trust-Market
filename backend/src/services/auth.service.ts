import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const register = async (data: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: string;
  userType: string;
  walletAddress?: string;
}) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw createError('User already exists', 400);
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role as any,
      userType: data.userType as any,
      walletAddress: data.walletAddress,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      userType: true,
      walletAddress: true,
      isVerified: true,
      createdAt: true,
    },
  });

  return user;
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.passwordHash) {
    throw createError('Invalid credentials', 401);
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    throw createError('Invalid credentials', 401);
  }

  if (!user.isActive) {
    throw createError('Account is deactivated', 403);
  }

  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      userType: user.userType,
      walletAddress: user.walletAddress,
      isVerified: user.isVerified,
    },
    token,
    refreshToken,
  };
};

export const connectWallet = async (walletAddress: string, signature: string, message: string) => {
  // TODO: Implement wallet signature verification
  // This should verify that the signature matches the wallet address and message
  
  const user = await prisma.user.findUnique({
    where: { walletAddress },
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  // Update user's wallet connection
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { walletAddress },
  });

  const token = generateToken(updatedUser);

  return {
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      walletAddress: updatedUser.walletAddress,
      role: updatedUser.role,
    },
    token,
  };
};

export const verifyWallet = async (walletAddress: string, signature: string) => {
  // TODO: Implement wallet verification logic
  return { verified: true, walletAddress };
};

export const refreshToken = async (refreshToken: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw createError('JWT secret not configured', 500);
  }

  try {
    const decoded = jwt.verify(refreshToken, secret) as { id: string; exp?: number };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    if (!user.isActive) {
      throw createError('Account is deactivated', 403);
    }

    // Generate new access token
    const token = generateToken(user);
    
    // Optionally generate a new refresh token (rotate refresh tokens for security)
    // For now, we'll return the same refresh token
    // In production, you might want to rotate refresh tokens
    const newRefreshToken = generateRefreshToken(user);

    return { 
      token,
      refreshToken: newRefreshToken,
    };
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw createError('Refresh token expired', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      throw createError('Invalid refresh token', 401);
    }
    throw error;
  }
};

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

const generateToken = (user: any) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw createError('JWT secret not configured', 500);
  }

  const signOptions: SignOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as SignOptions;
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      walletAddress: user.walletAddress,
    },
    secret,
    signOptions
  );
};

const generateRefreshToken = (user: any) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw createError('JWT secret not configured', 500);
  }

  return jwt.sign(
    { id: user.id },
    secret,
    { expiresIn: '30d' }
  );
};


