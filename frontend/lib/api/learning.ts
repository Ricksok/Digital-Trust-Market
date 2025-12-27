/**
 * Learning Exchange Engine (LEE) API Client
 * Feature: Learning Exchange Engine
 */

import apiClient from './client';

export interface Course {
  id: string;
  title: string;
  description?: string;
  category: string;
  level: string;
  duration: number;
  publisher: string;
  contentUrl?: string;
  videoUrl?: string;
  isRequired: boolean;
  status: string;
  isEnrolled?: boolean;
  enrollmentId?: string;
  progress?: number;
  isCompleted?: boolean;
  hasCredential?: boolean;
  price?: number;
  isPremium?: boolean;
  currency?: string;
  enrollment?: Enrollment;
  sections?: CourseSection[];
  assignments?: Assignment[];
  forums?: Forum[];
  gradebook?: Gradebook;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: string;
  progress: number;
  startedAt?: string;
  completedAt?: string;
  quizScore?: number;
  passedQuiz: boolean;
}

export interface Credential {
  id: string;
  userId: string;
  courseId: string;
  type: string;
  title: string;
  issuer: string;
  credentialNumber: string;
  issuedAt: string;
  expiresAt?: string;
  isExpired: boolean;
  isRevoked: boolean;
}

export interface UserLearningProfile {
  userId: string;
  totalCoursesCompleted: number;
  totalCredentialsEarned: number;
  totalLearningHours: number;
  unlockedFeatures: string[];
  requiredCourses: Course[];
  recommendedCourses: Course[];
  recentEnrollments: Course[];
}

export interface CourseSection {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  isVisible: boolean;
  content?: any;
  assignments?: Assignment[];
  forums?: Forum[];
  completionStatus?: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  sectionId?: string;
  title: string;
  description?: string;
  assignmentType: string;
  dueDate: string;
  maxScore: number;
  passingScore: number;
  isActive: boolean;
}

export interface Forum {
  id: string;
  courseId: string;
  sectionId?: string;
  title: string;
  description?: string;
  forumType: string;
  postCount: number;
  isActive: boolean;
}

export interface Gradebook {
  id: string;
  enrollmentId: string;
  userId: string;
  courseId: string;
  finalScore: number;
  finalGrade?: string;
  isPassed: boolean;
}

export interface LearningResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export const learningApi = {
  /**
   * Get all published courses
   */
  getCourses: async (): Promise<LearningResponse<Course[]>> => {
    const response = await apiClient.get('/api/learning/courses');
    return response.data;
  },

  /**
   * Get course by ID
   */
  getCourse: async (courseId: string): Promise<LearningResponse<Course>> => {
    const response = await apiClient.get(`/api/learning/courses/${courseId}`);
    return response.data;
  },

  /**
   * Enroll in a course
   */
  enroll: async (courseId: string): Promise<LearningResponse<Enrollment>> => {
    const response = await apiClient.post('/api/learning/enroll', { courseId });
    return response.data;
  },

  /**
   * Update enrollment progress
   */
  updateProgress: async (
    enrollmentId: string,
    progress: number,
    status?: string
  ): Promise<LearningResponse<Enrollment>> => {
    const response = await apiClient.put('/api/learning/progress', {
      enrollmentId,
      progress,
      status,
    });
    return response.data;
  },

  /**
   * Complete a course
   */
  completeCourse: async (
    enrollmentId: string,
    quizScore?: number
  ): Promise<LearningResponse<Enrollment>> => {
    const response = await apiClient.post('/api/learning/complete', {
      enrollmentId,
      quizScore,
    });
    return response.data;
  },

  /**
   * Get user learning profile
   */
  getProfile: async (): Promise<LearningResponse<UserLearningProfile>> => {
    const response = await apiClient.get('/api/learning/profile');
    return response.data;
  },

  /**
   * Check if feature is unlocked
   */
  checkFeatureUnlock: async (feature: string): Promise<LearningResponse<{ unlocked: boolean; feature: string }>> => {
    const response = await apiClient.get(`/api/learning/features/${feature}`);
    return response.data;
  },

  /**
   * Submit quiz
   */
  submitQuiz: async (
    quizId: string,
    answers: any[],
    enrollmentId?: string
  ): Promise<LearningResponse<any>> => {
    const response = await apiClient.post('/api/learning/quiz/submit', {
      quizId,
      answers,
      enrollmentId,
    });
    return response.data;
  },

  // ============================================
  // Admin Course Management
  // ============================================

  /**
   * Get all courses including drafts (admin only)
   */
  getAllCourses: async (): Promise<LearningResponse<Course[]>> => {
    const response = await apiClient.get('/api/learning/admin/courses');
    return response.data;
  },

  /**
   * Create a new course (admin only)
   */
  createCourse: async (course: Partial<Course>): Promise<LearningResponse<Course>> => {
    const response = await apiClient.post('/api/learning/admin/courses', course);
    return response.data;
  },

  /**
   * Update a course (admin only)
   */
  updateCourse: async (courseId: string, course: Partial<Course>): Promise<LearningResponse<Course>> => {
    const response = await apiClient.put(`/api/learning/admin/courses/${courseId}`, course);
    return response.data;
  },

  /**
   * Publish a course (admin only)
   */
  publishCourse: async (courseId: string): Promise<LearningResponse<Course>> => {
    const response = await apiClient.post(`/api/learning/admin/courses/${courseId}/publish`);
    return response.data;
  },

  /**
   * Unpublish a course (admin only)
   */
  unpublishCourse: async (courseId: string): Promise<LearningResponse<Course>> => {
    const response = await apiClient.post(`/api/learning/admin/courses/${courseId}/unpublish`);
    return response.data;
  },

  /**
   * Delete a course (admin only)
   */
  deleteCourse: async (courseId: string): Promise<LearningResponse<void>> => {
    const response = await apiClient.delete(`/api/learning/admin/courses/${courseId}`);
    return response.data;
  },

  /**
   * Get course sections
   */
  getCourseSections: async (courseId: string): Promise<LearningResponse<any[]>> => {
    const response = await apiClient.get(`/api/learning/courses/${courseId}/sections`);
    return response.data;
  },

  /**
   * Get gradebook for enrollment
   */
  getGradebook: async (enrollmentId: string): Promise<LearningResponse<any>> => {
    const response = await apiClient.get(`/api/learning/enrollments/${enrollmentId}/gradebook`);
    return response.data;
  },
};

