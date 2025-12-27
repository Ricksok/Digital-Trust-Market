/**
 * Learning Gate Middleware
 * Ensures users have completed required courses before accessing certain features
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { createError } from './errorHandler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Learning gate middleware
 * Checks if user has completed required courses before allowing access
 */
export const learningGate = (requiredCourses?: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(createError('Authentication required', 401));
      }

      // Admin bypass
      if (req.user.role === 'ADMIN') {
        return next();
      }

      // If no required courses specified, allow access
      if (!requiredCourses || requiredCourses.length === 0) {
        return next();
      }

      // Check if user has completed all required courses
      const enrollments = await prisma.enrollment.findMany({
        where: {
          userId: req.user.id,
          courseId: { in: requiredCourses },
          status: 'COMPLETED',
        },
        select: {
          courseId: true,
        },
      });

      const completedCourseIds = enrollments.map((e) => e.courseId);
      const missingCourses = requiredCourses.filter(
        (courseId) => !completedCourseIds.includes(courseId)
      );

      if (missingCourses.length > 0) {
        // Get course titles for error message
        const courses = await prisma.course.findMany({
          where: { id: { in: missingCourses } },
          select: { title: true },
        });

        return next(
          createError(
            `You must complete the following courses: ${courses.map((c) => c.title).join(', ')}`,
            403
          )
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
