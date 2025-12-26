import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as authService from '../services/auth.service';
import { createError } from '../middleware/errorHandler';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const connectWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { walletAddress, signature, message } = req.body;
    const result = await authService.connectWallet(walletAddress, signature, message);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const verifyWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { walletAddress, signature } = req.body;
    const result = await authService.verifyWallet(walletAddress, signature);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Log logout event for audit purposes
    if (req.user?.id) {
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        await prisma.auditLog.create({
          data: {
            userId: req.user.id,
            action: 'USER_LOGOUT',
            entityType: 'USER',
            entityId: req.user.id,
            ipAddress: req.ip || req.headers['x-forwarded-for'] as string || 'unknown',
            userAgent: req.headers['user-agent'] || 'unknown',
          },
        });
        await prisma.$disconnect();
      } catch (auditError) {
        // Don't fail logout if audit logging fails
        console.error('Failed to log logout event:', auditError);
      }
    }

    // Note: In a production system, you would:
    // 1. Add token to a blacklist (Redis or database)
    // 2. Invalidate refresh tokens
    // 3. Clear any server-side sessions
    
    res.json({ 
      success: true, 
      message: 'Logged out successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getUserById(req.user!.id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};


