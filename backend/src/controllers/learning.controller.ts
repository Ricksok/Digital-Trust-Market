/**
 * Learning Exchange Engine (LEE) Controller
 * Feature: Learning Exchange Engine
 */

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as learningService from '../services/learning.service';
import { createError } from '../middleware/errorHandler';
import { CourseStatus } from '../types/learning.types';

/**
 * Get all published courses
 */
export const getCourses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const courses = await learningService.getPublishedCourses(userId);
    res.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get course by ID
 */
export const getCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;
    const course = await learningService.getCourseById(courseId, userId);
    res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Enroll in a course
 */
export const enrollInCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      throw createError('Unauthorized', 401);
    }

    const enrollment = await learningService.enrollInCourse(req.user.id, req.body);
    res.json({
      success: true,
      data: enrollment,
      message: 'Successfully enrolled in course',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update enrollment progress
 */
export const updateProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      throw createError('Unauthorized', 401);
    }

    const enrollment = await learningService.updateEnrollmentProgress(req.user.id, req.body);
    res.json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete a course
 */
export const completeCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      throw createError('Unauthorized', 401);
    }

    const enrollment = await learningService.completeCourse(req.user.id, req.body);
    res.json({
      success: true,
      data: enrollment,
      message: 'Course completed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user learning profile
 */
export const getLearningProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      throw createError('Unauthorized', 401);
    }

    const profile = await learningService.getUserLearningProfile(req.user.id);
    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if feature is unlocked
 */
export const checkFeatureUnlock = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      throw createError('Unauthorized', 401);
    }

    const { feature } = req.params;
    const unlocked = await learningService.hasUnlockedFeature(req.user.id, feature);
    res.json({
      success: true,
      data: { unlocked, feature },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit quiz
 */
export const submitQuiz = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      throw createError('Unauthorized', 401);
    }

    const attempt = await learningService.submitQuiz(req.user.id, req.body);
    res.json({
      success: true,
      data: attempt,
      message: attempt.passed ? 'Quiz passed!' : 'Quiz failed. Please try again.',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Admin Course Management Endpoints
// ============================================

/**
 * Create a new course (admin only)
 */
export const createCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      throw createError('Unauthorized', 401);
    }

    // Check if user is admin (role check)
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MARKETPLACE_ADMIN') {
      throw createError('Insufficient permissions. Admin access required.', 403);
    }

    const course = await learningService.createCourse(req.body, req.user.id);
    res.status(201).json({
      success: true,
      data: course,
      message: 'Course created successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a course (admin only)
 */
export const updateCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      throw createError('Unauthorized', 401);
    }

    // Check if user is admin
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MARKETPLACE_ADMIN') {
      throw createError('Insufficient permissions. Admin access required.', 403);
    }

    const { courseId } = req.params;
    const course = await learningService.updateCourse(courseId, req.body);
    res.json({
      success: true,
      data: course,
      message: 'Course updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Publish a course (admin only)
 */
export const publishCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      throw createError('Unauthorized', 401);
    }

    // Check if user is admin
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MARKETPLACE_ADMIN') {
      throw createError('Insufficient permissions. Admin access required.', 403);
    }

    const { courseId } = req.params;
    const course = await learningService.updateCourse(courseId, {
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(),
    });
    res.json({
      success: true,
      data: course,
      message: 'Course published successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unpublish a course (admin only)
 */
export const unpublishCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      throw createError('Unauthorized', 401);
    }

    // Check if user is admin
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MARKETPLACE_ADMIN') {
      throw createError('Insufficient permissions. Admin access required.', 403);
    }

    const { courseId } = req.params;
    const course = await learningService.updateCourse(courseId, {
      status: CourseStatus.DRAFT,
    });
    res.json({
      success: true,
      data: course,
      message: 'Course unpublished successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a course (admin only)
 */
export const deleteCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      throw createError('Unauthorized', 401);
    }

    // Check if user is admin
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MARKETPLACE_ADMIN') {
      throw createError('Insufficient permissions. Admin access required.', 403);
    }

    const { courseId } = req.params;
    await learningService.deleteCourse(courseId);
    res.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all courses including drafts (admin only)
 */
export const getAllCourses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      throw createError('Unauthorized', 401);
    }

    // Check if user is admin
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MARKETPLACE_ADMIN') {
      throw createError('Insufficient permissions. Admin access required.', 403);
    }

    const courses = await learningService.getAllCourses();
    res.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

