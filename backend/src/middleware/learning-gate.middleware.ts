/**
 * Learning Gate Middleware
 * Feature: Learning Exchange Engine
 * 
 * Gates access to features based on learning outcomes
 */

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { hasUnlockedFeature } from '../services/learning.service';
import { createError } from './errorHandler';

/**
 * Middleware to check if user has unlocked a required feature
 * Usage: learningGate('auction.bid.create')
 */
export function learningGate(requiredFeature: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        throw createError('Unauthorized', 401);
      }

      const unlocked = await hasUnlockedFeature(req.user.id, requiredFeature);

      if (!unlocked) {
        // Get course that unlocks this feature
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        const courses = await prisma.course.findMany({
          where: {
            unlocks: { not: null },
            status: 'PUBLISHED',
            isActive: true,
          },
        });

        const unlockingCourse = courses.find((course: any) => {
          if (!course.unlocks) return false;
          const unlocks = JSON.parse(course.unlocks) as string[];
          return unlocks.includes(requiredFeature);
        });

        await prisma.$disconnect();

        throw createError(
          `Feature requires learning. Please complete: ${unlockingCourse?.title || 'required course'}`,
          403,
          {
            requiredFeature,
            unlockingCourse: unlockingCourse ? {
              id: unlockingCourse.id,
              title: unlockingCourse.title,
            } : null,
          }
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to check multiple features (OR logic - any one unlocks)
 */
export function learningGateAny(requiredFeatures: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        throw createError('Unauthorized', 401);
      }

      const checks = await Promise.all(
        requiredFeatures.map((feature) => hasUnlockedFeature(req.user!.id, feature))
      );

      const unlocked = checks.some((unlocked) => unlocked);

      if (!unlocked) {
        throw createError(
          'Feature requires learning. Please complete required courses.',
          403,
          { requiredFeatures }
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to check multiple features (AND logic - all must unlock)
 */
export function learningGateAll(requiredFeatures: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        throw createError('Unauthorized', 401);
      }

      const checks = await Promise.all(
        requiredFeatures.map((feature) => hasUnlockedFeature(req.user!.id, feature))
      );

      const allUnlocked = checks.every((unlocked) => unlocked);

      if (!allUnlocked) {
        const missing = requiredFeatures.filter((_, i) => !checks[i]);
        throw createError(
          'Feature requires additional learning. Please complete required courses.',
          403,
          { missingFeatures: missing }
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

