/**
 * Learning Management System (LMS) Controller
 * Inspired by Moodle - Comprehensive learning management features
 */

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as learningService from '../services/learning.service';

// ============================================
// Course Management
// ============================================

export const createCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const course = await learningService.createCourse(req.body, req.user!.id);
    res.status(201).json({ success: true, data: course, message: 'Course created successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllCourses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Only admins can see all courses including drafts
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: { message: 'Insufficient permissions' },
      });
    }
    const courses = await learningService.getAllCourses();
    res.json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};

export const getPublishedCourses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const courses = await learningService.getPublishedCourses(userId);
    res.json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const course = await learningService.getCourseById(req.params.id, userId);
    res.json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const course = await learningService.updateCourse(req.params.id, req.body);
    res.json({ success: true, data: course, message: 'Course updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await learningService.deleteCourse(req.params.id);
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Enrollment Management
// ============================================

export const enrollInCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const enrollment = await learningService.enrollInCourse(req.user!.id, req.body);
    res.status(201).json({ success: true, data: enrollment, message: 'Enrolled in course successfully' });
  } catch (error) {
    next(error);
  }
};

export const getEnrollments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const enrollments = await learningService.getEnrollments(req.user!.id, req.query);
    res.json({ success: true, data: enrollments });
  } catch (error) {
    next(error);
  }
};

export const updateEnrollmentProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const enrollment = await learningService.updateEnrollmentProgress(req.user!.id, req.body);
    res.json({ success: true, data: enrollment, message: 'Progress updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const completeCourse = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const enrollment = await learningService.completeCourse(req.user!.id, req.body);
    res.json({ success: true, data: enrollment, message: 'Course completed successfully' });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Course Sections/Modules
// ============================================

export const createCourseSection = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const section = await learningService.createCourseSection(req.params.courseId, req.body);
    res.status(201).json({ success: true, data: section, message: 'Section created successfully' });
  } catch (error) {
    next(error);
  }
};

export const getCourseSections = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sections = await learningService.getCourseSections(req.params.courseId, req.user?.id);
    res.json({ success: true, data: sections });
  } catch (error) {
    next(error);
  }
};

export const updateCourseSection = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const section = await learningService.updateCourseSection(req.params.sectionId, req.body);
    res.json({ success: true, data: section, message: 'Section updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteCourseSection = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await learningService.deleteCourseSection(req.params.sectionId);
    res.json({ success: true, message: 'Section deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Assignments
// ============================================

export const createAssignment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const assignment = await learningService.createAssignment(req.params.courseId, req.body);
    res.status(201).json({ success: true, data: assignment, message: 'Assignment created successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAssignments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const assignments = await learningService.getAssignments(req.params.courseId, req.user?.id);
    res.json({ success: true, data: assignments });
  } catch (error) {
    next(error);
  }
};

export const getAssignmentById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const assignment = await learningService.getAssignmentById(req.params.id, req.user?.id);
    res.json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
};

export const updateAssignment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const assignment = await learningService.updateAssignment(req.params.id, req.body);
    res.json({ success: true, data: assignment, message: 'Assignment updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteAssignment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await learningService.deleteAssignment(req.params.id);
    res.json({ success: true, message: 'Assignment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Assignment Submissions
// ============================================

export const submitAssignment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const submission = await learningService.submitAssignment(req.user!.id, req.body);
    res.status(201).json({ success: true, data: submission, message: 'Assignment submitted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getSubmissions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const submissions = await learningService.getSubmissions(req.params.assignmentId, req.user?.id);
    res.json({ success: true, data: submissions });
  } catch (error) {
    next(error);
  }
};

export const getSubmissionById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const submission = await learningService.getSubmissionById(req.params.id, req.user?.id);
    res.json({ success: true, data: submission });
  } catch (error) {
    next(error);
  }
};

export const gradeSubmission = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const submission = await learningService.gradeSubmission(req.params.id, req.body, req.user!.id);
    res.json({ success: true, data: submission, message: 'Submission graded successfully' });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Forums/Discussions
// ============================================

export const createForum = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const forum = await learningService.createForum(req.params.courseId, req.body);
    res.status(201).json({ success: true, data: forum, message: 'Forum created successfully' });
  } catch (error) {
    next(error);
  }
};

export const getForums = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const forums = await learningService.getForums(req.params.courseId);
    res.json({ success: true, data: forums });
  } catch (error) {
    next(error);
  }
};

export const getForumById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const forum = await learningService.getForumById(req.params.id);
    res.json({ success: true, data: forum });
  } catch (error) {
    next(error);
  }
};

export const createForumPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await learningService.createForumPost(req.user!.id, req.params.forumId, req.body);
    res.status(201).json({ success: true, data: post, message: 'Post created successfully' });
  } catch (error) {
    next(error);
  }
};

export const getForumPosts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const posts = await learningService.getForumPosts(req.params.forumId, req.query);
    res.json({ success: true, data: posts });
  } catch (error) {
    next(error);
  }
};

export const updateForumPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await learningService.updateForumPost(req.params.id, req.user!.id, req.body);
    res.json({ success: true, data: post, message: 'Post updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteForumPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await learningService.deleteForumPost(req.params.id, req.user!.id);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Quizzes
// ============================================

export const createQuiz = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const quiz = await learningService.createQuiz(req.params.courseId, req.body);
    res.status(201).json({ success: true, data: quiz, message: 'Quiz created successfully' });
  } catch (error) {
    next(error);
  }
};

export const submitQuiz = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const attempt = await learningService.submitQuiz(req.user!.id, req.body);
    res.json({ success: true, data: attempt, message: 'Quiz submitted successfully' });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Gradebook
// ============================================

export const getGradebook = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const gradebook = await learningService.getGradebook(req.params.enrollmentId, req.user?.id);
    res.json({ success: true, data: gradebook });
  } catch (error) {
    next(error);
  }
};

export const addGradebookEntry = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const entry = await learningService.addGradebookEntry(req.body, req.user!.id);
    res.status(201).json({ success: true, data: entry, message: 'Grade added successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateGradebookEntry = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const entry = await learningService.updateGradebookEntry(req.params.id, req.body, req.user!.id);
    res.json({ success: true, data: entry, message: 'Grade updated successfully' });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Activity Completion
// ============================================

export const updateActivityCompletion = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const completion = await learningService.updateActivityCompletion(req.user!.id, req.body);
    res.json({ success: true, data: completion, message: 'Activity completion updated' });
  } catch (error) {
    next(error);
  }
};

export const getActivityCompletions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const completions = await learningService.getActivityCompletions(req.params.enrollmentId);
    res.json({ success: true, data: completions });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Learning Profile & Features
// ============================================

export const getLearningProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await learningService.getUserLearningProfile(req.user!.id);
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const checkFeatureUnlock = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const hasUnlocked = await learningService.hasUnlockedFeature(req.user!.id, req.params.feature);
    res.json({ success: true, data: { hasUnlocked, feature: req.params.feature } });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Credentials
// ============================================

export const getCredentials = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const credentials = await learningService.getCredentials(req.user!.id);
    res.json({ success: true, data: credentials });
  } catch (error) {
    next(error);
  }
};

export const getCredentialById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const credential = await learningService.getCredentialById(req.params.id, req.user?.id);
    res.json({ success: true, data: credential });
  } catch (error) {
    next(error);
  }
};

export const verifyCredential = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const credential = await learningService.verifyCredential(req.params.credentialNumber);
    res.json({ success: true, data: credential });
  } catch (error) {
    next(error);
  }
};

