/**
 * Learning Exchange Engine (LEE) Routes
 * Feature: Learning Exchange Engine
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as learningController from '../controllers/learning.controller';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

/**
 * GET /api/learning/courses
 * Get all published courses
 */
router.get('/courses', authenticate, learningController.getCourses);

/**
 * GET /api/learning/courses/:courseId
 * Get course by ID
 */
router.get('/courses/:courseId', authenticate, learningController.getCourse);

/**
 * POST /api/learning/enroll
 * Enroll in a course
 */
router.post(
  '/enroll',
  authenticate,
  validateRequest({
    body: {
      courseId: { type: 'string', required: true },
    },
  }),
  learningController.enrollInCourse
);

/**
 * PUT /api/learning/progress
 * Update enrollment progress
 */
router.put(
  '/progress',
  authenticate,
  validateRequest({
    body: {
      enrollmentId: { type: 'string', required: true },
      progress: { type: 'number', required: true, min: 0, max: 100 },
      status: { type: 'string', required: false },
    },
  }),
  learningController.updateProgress
);

/**
 * POST /api/learning/complete
 * Complete a course
 */
router.post(
  '/complete',
  authenticate,
  validateRequest({
    body: {
      enrollmentId: { type: 'string', required: true },
      quizScore: { type: 'number', required: false },
    },
  }),
  learningController.completeCourse
);

/**
 * GET /api/learning/profile
 * Get user learning profile
 */
router.get('/profile', authenticate, learningController.getLearningProfile);

/**
 * GET /api/learning/features/:feature
 * Check if feature is unlocked
 */
router.get('/features/:feature', authenticate, learningController.checkFeatureUnlock);

/**
 * POST /api/learning/quiz/submit
 * Submit quiz attempt
 */
router.post(
  '/quiz/submit',
  authenticate,
  validateRequest({
    body: {
      quizId: { type: 'string', required: true },
      enrollmentId: { type: 'string', required: false },
      answers: { type: 'array', required: true },
    },
  }),
  learningController.submitQuiz
);

// ============================================
// Admin Course Management Routes
// ============================================

/**
 * GET /api/learning/admin/courses
 * Get all courses including drafts (admin only)
 */
router.get('/admin/courses', authenticate, learningController.getAllCourses);

/**
 * POST /api/learning/admin/courses
 * Create a new course (admin only)
 */
router.post(
  '/admin/courses',
  authenticate,
  validateRequest({
    body: {
      title: { type: 'string', required: true },
      description: { type: 'string', required: false },
      category: { type: 'string', required: true },
      level: { type: 'string', required: false },
      duration: { type: 'number', required: true },
      publisher: { type: 'string', required: true },
      contentUrl: { type: 'string', required: false },
      videoUrl: { type: 'string', required: false },
      unlocks: { type: 'array', required: false },
      credentialType: { type: 'string', required: false },
      isRequired: { type: 'boolean', required: false },
    },
  }),
  learningController.createCourse
);

/**
 * PUT /api/learning/admin/courses/:courseId
 * Update a course (admin only)
 */
router.put(
  '/admin/courses/:courseId',
  authenticate,
  learningController.updateCourse
);

/**
 * POST /api/learning/admin/courses/:courseId/publish
 * Publish a course (admin only)
 */
router.post('/admin/courses/:courseId/publish', authenticate, learningController.publishCourse);

/**
 * POST /api/learning/admin/courses/:courseId/unpublish
 * Unpublish a course (admin only)
 */
router.post('/admin/courses/:courseId/unpublish', authenticate, learningController.unpublishCourse);

/**
 * DELETE /api/learning/admin/courses/:courseId
 * Delete a course (admin only)
 */
router.delete('/admin/courses/:courseId', authenticate, learningController.deleteCourse);

export default router;

