/**
 * Learning Exchange Engine (LEE) React Query Hooks
 * Feature: Learning Exchange Engine
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { learningApi, Course, Enrollment, UserLearningProfile } from '../api/learning';
import { useUIStore } from '../stores/ui.store';

/**
 * Get all published courses query hook
 */
export const useCourses = () => {
  return useQuery({
    queryKey: ['learning', 'courses'],
    queryFn: async () => {
      const response = await learningApi.getCourses();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch courses');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get course by ID query hook
 */
export const useCourse = (courseId: string) => {
  return useQuery({
    queryKey: ['learning', 'courses', courseId],
    queryFn: async () => {
      const response = await learningApi.getCourse(courseId);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch course');
      }
      return response.data;
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get user learning profile query hook
 */
export const useLearningProfile = () => {
  return useQuery({
    queryKey: ['learning', 'profile'],
    queryFn: async () => {
      const response = await learningApi.getProfile();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch learning profile');
      }
      return response.data;
    },
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Enroll in course mutation hook
 */
export const useEnrollInCourse = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: (courseId: string) => learningApi.enroll(courseId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['learning'] });
      showNotification({
        type: 'success',
        message: response.message || 'Successfully enrolled in course',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to enroll in course';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

/**
 * Update enrollment progress mutation hook
 */
export const useUpdateProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enrollmentId, progress, status }: { enrollmentId: string; progress: number; status?: string }) =>
      learningApi.updateProgress(enrollmentId, progress, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning'] });
    },
  });
};

/**
 * Complete course mutation hook
 */
export const useCompleteCourse = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: ({ enrollmentId, quizScore }: { enrollmentId: string; quizScore?: number }) =>
      learningApi.completeCourse(enrollmentId, quizScore),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['learning'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      showNotification({
        type: 'success',
        message: response.message || 'Course completed successfully!',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to complete course';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

/**
 * Check feature unlock query hook
 */
export const useFeatureUnlock = (feature: string) => {
  return useQuery({
    queryKey: ['learning', 'features', feature],
    queryFn: async () => {
      const response = await learningApi.checkFeatureUnlock(feature);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to check feature unlock');
      }
      return response.data;
    },
    enabled: !!feature,
    staleTime: 60000, // 1 minute
  });
};

/**
 * Submit quiz mutation hook
 */
export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: ({ quizId, answers, enrollmentId }: { quizId: string; answers: any[]; enrollmentId?: string }) =>
      learningApi.submitQuiz(quizId, answers, enrollmentId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['learning'] });
      showNotification({
        type: response.data?.passed ? 'success' : 'warning',
        message: response.message || (response.data?.passed ? 'Quiz passed!' : 'Quiz failed. Please try again.'),
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to submit quiz';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

// ============================================
// Admin Course Management Hooks
// ============================================

/**
 * Get all courses including drafts (admin only)
 */
export const useAllCourses = () => {
  return useQuery({
    queryKey: ['learning', 'admin', 'courses'],
    queryFn: async () => {
      const response = await learningApi.getAllCourses();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch courses');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Create course mutation hook (admin only)
 */
export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: (course: Partial<Course>) => learningApi.createCourse(course),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['learning'] });
      showNotification({
        type: 'success',
        message: response.message || 'Course created successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to create course';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

/**
 * Update course mutation hook (admin only)
 */
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: ({ courseId, course }: { courseId: string; course: Partial<Course> }) =>
      learningApi.updateCourse(courseId, course),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['learning'] });
      showNotification({
        type: 'success',
        message: response.message || 'Course updated successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to update course';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

/**
 * Publish course mutation hook (admin only)
 */
export const usePublishCourse = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: (courseId: string) => learningApi.publishCourse(courseId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['learning'] });
      showNotification({
        type: 'success',
        message: 'Course published successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to publish course';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

/**
 * Unpublish course mutation hook (admin only)
 */
export const useUnpublishCourse = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: (courseId: string) => learningApi.unpublishCourse(courseId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['learning'] });
      showNotification({
        type: 'success',
        message: 'Course unpublished successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to unpublish course';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

/**
 * Delete course mutation hook (admin only)
 */
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: (courseId: string) => learningApi.deleteCourse(courseId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['learning'] });
      showNotification({
        type: 'success',
        message: 'Course deleted successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to delete course';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

