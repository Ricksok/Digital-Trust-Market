/**
 * Learning Management System (LMS) Routes
 * Inspired by Moodle - Comprehensive learning management
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as learningController from '../controllers/learning.controller';

const router = Router();

// ============================================
// Course Management
// ============================================

// Public routes
router.get('/courses', learningController.getPublishedCourses);
router.get('/courses/:id', learningController.getCourseById);

// Authenticated routes
router.post('/courses', authenticate, learningController.createCourse);
router.put('/courses/:id', authenticate, learningController.updateCourse);
router.delete('/courses/:id', authenticate, learningController.deleteCourse);

// Admin only - get all courses including drafts
router.get('/admin/courses', authenticate, learningController.getAllCourses);

// ============================================
// Enrollment Management
// ============================================

router.post('/enroll', authenticate, learningController.enrollInCourse);
router.get('/enrollments', authenticate, learningController.getEnrollments);
router.put('/progress', authenticate, learningController.updateEnrollmentProgress);
router.post('/complete', authenticate, learningController.completeCourse);

// ============================================
// Course Sections/Modules
// ============================================

router.post('/courses/:courseId/sections', authenticate, learningController.createCourseSection);
router.get('/courses/:courseId/sections', authenticate, learningController.getCourseSections);
router.put('/sections/:sectionId', authenticate, learningController.updateCourseSection);
router.delete('/sections/:sectionId', authenticate, learningController.deleteCourseSection);

// ============================================
// Assignments
// ============================================

router.post('/courses/:courseId/assignments', authenticate, learningController.createAssignment);
router.get('/courses/:courseId/assignments', authenticate, learningController.getAssignments);
router.get('/assignments/:id', authenticate, learningController.getAssignmentById);
router.put('/assignments/:id', authenticate, learningController.updateAssignment);
router.delete('/assignments/:id', authenticate, learningController.deleteAssignment);

// ============================================
// Assignment Submissions
// ============================================

router.post('/assignments/submit', authenticate, learningController.submitAssignment);
router.get('/assignments/:assignmentId/submissions', authenticate, learningController.getSubmissions);
router.get('/submissions/:id', authenticate, learningController.getSubmissionById);
router.post('/submissions/:id/grade', authenticate, learningController.gradeSubmission);

// ============================================
// Forums/Discussions
// ============================================

router.post('/courses/:courseId/forums', authenticate, learningController.createForum);
router.get('/courses/:courseId/forums', authenticate, learningController.getForums);
router.get('/forums/:id', authenticate, learningController.getForumById);

// Forum Posts
router.post('/forums/:forumId/posts', authenticate, learningController.createForumPost);
router.get('/forums/:forumId/posts', authenticate, learningController.getForumPosts);
router.put('/posts/:id', authenticate, learningController.updateForumPost);
router.delete('/posts/:id', authenticate, learningController.deleteForumPost);

// ============================================
// Quizzes
// ============================================

router.post('/courses/:courseId/quizzes', authenticate, learningController.createQuiz);
router.post('/quizzes/submit', authenticate, learningController.submitQuiz);

// ============================================
// Gradebook
// ============================================

router.get('/enrollments/:enrollmentId/gradebook', authenticate, learningController.getGradebook);
router.post('/gradebook', authenticate, learningController.addGradebookEntry);
router.put('/gradebook/:id', authenticate, learningController.updateGradebookEntry);

// ============================================
// Activity Completion
// ============================================

router.put('/activities/complete', authenticate, learningController.updateActivityCompletion);
router.get('/enrollments/:enrollmentId/activities', authenticate, learningController.getActivityCompletions);

// ============================================
// Learning Profile & Features
// ============================================

router.get('/profile', authenticate, learningController.getLearningProfile);
router.get('/features/:feature', authenticate, learningController.checkFeatureUnlock);

// ============================================
// Credentials
// ============================================

router.get('/credentials', authenticate, learningController.getCredentials);
router.get('/credentials/:id', authenticate, learningController.getCredentialById);
router.get('/credentials/verify/:credentialNumber', learningController.verifyCredential);

export default router;
