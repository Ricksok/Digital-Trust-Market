/**
 * Learning Exchange Engine (LEE) Service
 * Feature: Learning Exchange Engine
 * 
 * Handles course management, enrollment, credentials, and learning-to-access gating
 */

import { PrismaClient } from '@prisma/client';
import {
  CreateCourseInput,
  UpdateCourseInput,
  EnrollInCourseInput,
  UpdateEnrollmentProgressInput,
  CompleteCourseInput,
  CreateQuizInput,
  SubmitQuizInput,
  CourseWithProgress,
  UserLearningProfile,
  CourseStatus,
  EnrollmentStatus,
  CredentialType,
} from '../types/learning.types';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

/**
 * Create a new course
 */
export async function createCourse(input: CreateCourseInput, publisherId?: string) {
  try {
    const course = await prisma.course.create({
      data: {
        title: input.title,
        description: input.description,
        category: input.category,
        level: input.level || 'BEGINNER',
        duration: input.duration,
        publisher: input.publisher,
        publisherId: input.publisherId || publisherId,
        contentUrl: input.contentUrl,
        videoUrl: input.videoUrl,
        materials: input.materials ? JSON.stringify(input.materials) : null,
        prerequisites: input.prerequisites ? JSON.stringify(input.prerequisites) : null,
        unlocks: input.unlocks ? JSON.stringify(input.unlocks) : null,
        credentialType: input.credentialType,
        isRequired: input.isRequired || false,
        expiryDays: input.expiryDays,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        status: 'DRAFT',
      },
    });

    return course;
  } catch (error: any) {
    console.error('Error creating course:', error);
    throw createError('Failed to create course', 500);
  }
}

/**
 * Update a course
 */
export async function updateCourse(courseId: string, input: UpdateCourseInput) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw createError('Course not found', 404);
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        title: input.title,
        description: input.description,
        category: input.category,
        level: input.level,
        duration: input.duration,
        publisher: input.publisher,
        contentUrl: input.contentUrl,
        videoUrl: input.videoUrl,
        materials: input.materials ? JSON.stringify(input.materials) : undefined,
        prerequisites: input.prerequisites ? JSON.stringify(input.prerequisites) : undefined,
        unlocks: input.unlocks ? JSON.stringify(input.unlocks) : undefined,
        credentialType: input.credentialType,
        isRequired: input.isRequired,
        expiryDays: input.expiryDays,
        metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
        status: input.status,
        publishedAt: input.status === CourseStatus.PUBLISHED && course.status !== 'PUBLISHED' ? (input.publishedAt || new Date()) : undefined,
      },
    });

    return updated;
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error updating course:', error);
    throw createError('Failed to update course', 500);
  }
}

/**
 * Delete a course
 */
export async function deleteCourse(courseId: string) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        enrollments: true,
      },
    });

    if (!course) {
      throw createError('Course not found', 404);
    }

    // Check if course has active enrollments
    if (course.enrollments.length > 0) {
      throw createError('Cannot delete course with active enrollments', 400);
    }

    await prisma.course.delete({
      where: { id: courseId },
    });

    return { success: true };
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error deleting course:', error);
    throw createError('Failed to delete course', 500);
  }
}

/**
 * Get all courses (including drafts) - admin only
 */
export async function getAllCourses() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        enrollments: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    return courses.map((course) => ({
      ...course,
      enrollmentCount: course.enrollments.length,
      enrollments: undefined, // Remove from response
    }));
  } catch (error: any) {
    console.error('Error fetching all courses:', error);
    throw createError('Failed to fetch courses', 500);
  }
}

/**
 * Get all published courses
 */
export async function getPublishedCourses(userId?: string) {
  try {
    const courses = await prisma.course.findMany({
      where: {
        status: 'PUBLISHED',
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // If userId provided, enrich with enrollment status
    if (userId) {
      const enrollments = await prisma.enrollment.findMany({
        where: {
          userId,
          courseId: { in: courses.map((c) => c.id) },
        },
      });

      const enrollmentMap = new Map(
        enrollments.map((e) => [e.courseId, e])
      );

      // Get credentials for enrollments
      const enrollmentIds = enrollments.map((e) => e.id);
      const credentials = await prisma.credential.findMany({
        where: {
          enrollmentId: { in: enrollmentIds },
          isRevoked: false,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
      });
      const credentialMap = new Map(
        credentials.map((c) => [c.enrollmentId, true])
      );

      return courses.map((course) => {
        const enrollment = enrollmentMap.get(course.id);
        const hasCredential = enrollment ? credentialMap.has(enrollment.id) : false;
        return {
          ...course,
          isEnrolled: !!enrollment,
          enrollmentId: enrollment?.id,
          progress: enrollment?.progress || 0,
          status: enrollment?.status,
          isCompleted: enrollment?.status === 'COMPLETED',
          hasCredential,
        } as CourseWithProgress;
      });
    }

    return courses.map((course) => ({
      ...course,
      isEnrolled: false,
      isCompleted: false,
      hasCredential: false,
    } as CourseWithProgress));
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    throw createError('Failed to fetch courses', 500);
  }
}

/**
 * Get course by ID
 */
export async function getCourseById(courseId: string, userId?: string) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        quizzes: {
          where: { isActive: true },
        },
      },
    });

    if (!course) {
      throw createError('Course not found', 404);
    }

    if (userId) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        include: {
          credentials: {
            where: {
              isRevoked: false,
              OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } },
              ],
            },
          },
        },
      });

      return {
        ...course,
        enrollment,
        isEnrolled: !!enrollment,
        hasCredential: (enrollment?.credentials?.length || 0) > 0,
      };
    }

    return course;
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error fetching course:', error);
    throw createError('Failed to fetch course', 500);
  }
}

/**
 * Enroll user in a course
 */
export async function enrollInCourse(userId: string, input: EnrollInCourseInput) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: input.courseId },
    });

    if (!course) {
      throw createError('Course not found', 404);
    }

    if (course.status !== 'PUBLISHED') {
      throw createError('Course is not available for enrollment', 400);
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: input.courseId,
        },
      },
    });

    if (existing) {
      if (existing.status === 'COMPLETED') {
        throw createError('Course already completed', 400);
      }
      // Return existing enrollment
      return existing;
    }

    // Check prerequisites
    if (course.prerequisites) {
      const prerequisites = JSON.parse(course.prerequisites) as string[];
      const completedCourses = await prisma.enrollment.findMany({
        where: {
          userId,
          courseId: { in: prerequisites },
          status: 'COMPLETED',
        },
      });

      if (completedCourses.length < prerequisites.length) {
        throw createError('Prerequisites not met', 400);
      }
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId: input.courseId,
        status: 'ENROLLED',
        startedAt: new Date(),
      },
    });

    // Update ReadinessMetrics
    await updateReadinessMetrics(userId);

    // Track user activity (enrollment)
    try {
      const { trackUserActivity } = await import('./trust.service');
      await trackUserActivity(userId, 'LEARNING', 1.0);
    } catch (error) {
      // Non-critical - log but don't fail enrollment
      console.error('Failed to track user activity on enrollment:', error);
    }

    return enrollment;
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error enrolling in course:', error);
    throw createError('Failed to enroll in course', 500);
  }
}

/**
 * Update enrollment progress
 */
export async function updateEnrollmentProgress(
  userId: string,
  input: UpdateEnrollmentProgressInput
) {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: input.enrollmentId },
    });

    if (!enrollment || enrollment.userId !== userId) {
      throw createError('Enrollment not found', 404);
    }

    const updated = await prisma.enrollment.update({
      where: { id: input.enrollmentId },
      data: {
        progress: input.progress,
        status: input.status || enrollment.status,
      },
    });

    return updated;
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error updating enrollment:', error);
    throw createError('Failed to update enrollment', 500);
  }
}

/**
 * Complete a course
 */
export async function completeCourse(userId: string, input: CompleteCourseInput) {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: input.enrollmentId },
      include: {
        course: {
          include: {
            quizzes: true,
          },
        },
      },
    });

    if (!enrollment || enrollment.userId !== userId) {
      throw createError('Enrollment not found', 404);
    }

    if (enrollment.status === 'COMPLETED') {
      throw createError('Course already completed', 400);
    }

    // Check if quiz passed (if applicable)
    const hasQuiz = (enrollment.course.quizzes?.length || 0) > 0;
    if (hasQuiz && input.quizScore !== undefined) {
      // Quiz score validation would happen in quiz submission
      if (input.quizScore < 70) {
        throw createError('Quiz score below passing threshold', 400);
      }
    }

    // Update enrollment
    const updated = await prisma.enrollment.update({
      where: { id: input.enrollmentId },
      data: {
        status: 'COMPLETED',
        progress: 100,
        completedAt: new Date(),
        passedQuiz: hasQuiz && (input.quizScore || 0) >= 70,
        quizScore: input.quizScore,
      },
    });

    // Issue credential if course has credential type
    if (enrollment.course.credentialType) {
      await issueCredential(userId, enrollment.courseId, input.enrollmentId);
    }

    // Unlock features
    if (enrollment.course.unlocks) {
      const unlocks = JSON.parse(enrollment.course.unlocks) as string[];
      await unlockFeatures(userId, enrollment.courseId, unlocks);
    }

    // Update ReadinessMetrics and TrustScore
    await updateReadinessMetrics(userId);
    await updateLearningTrust(userId);

    // Track user activity (course completion - higher value for completion)
    try {
      const { trackUserActivity } = await import('./trust.service');
      await trackUserActivity(userId, 'LEARNING', 2.0); // Higher value for completion
    } catch (error) {
      // Non-critical - log but don't fail completion
      console.error('Failed to track user activity on course completion:', error);
    }

    return updated;
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error completing course:', error);
    throw createError('Failed to complete course', 500);
  }
}

/**
 * Issue credential for completed course
 */
async function issueCredential(userId: string, courseId: string, enrollmentId: string) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) return;

    const credentialNumber = `CRED-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const expiresAt = course.expiryDays
      ? new Date(Date.now() + course.expiryDays * 24 * 60 * 60 * 1000)
      : null;

    await prisma.credential.create({
      data: {
        userId,
        courseId,
        enrollmentId,
        type: course.credentialType || CredentialType.CERTIFICATE,
        title: `${course.title} - Certificate`,
        issuer: course.publisher,
        issuerId: course.publisherId,
        credentialNumber,
        expiresAt,
      },
    });
  } catch (error: any) {
    console.error('Error issuing credential:', error);
    // Don't fail course completion if credential issuance fails
  }
}

/**
 * Unlock features based on learning outcomes
 */
async function unlockFeatures(userId: string, courseId: string, features: string[]) {
  try {
    for (const feature of features) {
      await prisma.learningOutcome.create({
        data: {
          userId,
          courseId,
          unlockedFeature: feature,
        },
      });
    }
  } catch (error: any) {
    console.error('Error unlocking features:', error);
    // Don't fail course completion if feature unlock fails
  }
}

/**
 * Update ReadinessMetrics after learning activity
 */
async function updateReadinessMetrics(userId: string) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId,
        status: 'COMPLETED',
      },
      include: {
        course: true,
      },
    });

    const credentials = await prisma.credential.findMany({
      where: {
        userId,
        isRevoked: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    const metrics = await prisma.readinessMetrics.upsert({
      where: { entityId: userId },
      update: {
        coursesCompleted: enrollments.length,
        certificationsEarned: credentials.length,
        learningHours: enrollments.reduce((sum, e) => sum + (e.course.duration / 60), 0),
        financeCourses: enrollments.filter((e) => e.course.category === 'TAX_INVOICING').length,
        governanceCourses: enrollments.filter((e) => e.course.category === 'COMPLIANCE').length,
        complianceCourses: enrollments.filter((e) => e.course.category === 'COMPLIANCE').length,
      },
      create: {
        entityId: userId,
        coursesCompleted: enrollments.length,
        certificationsEarned: credentials.length,
        learningHours: enrollments.reduce((sum, e) => sum + (e.course.duration / 60), 0),
        financeCourses: enrollments.filter((e) => e.course.category === 'TAX_INVOICING').length,
        governanceCourses: enrollments.filter((e) => e.course.category === 'COMPLIANCE').length,
        complianceCourses: enrollments.filter((e) => e.course.category === 'COMPLIANCE').length,
      },
    });

    return metrics;
  } catch (error: any) {
    console.error('Error updating readiness metrics:', error);
    // Don't throw - this is a background update
  }
}

/**
 * Update learning trust dimension in TrustScore
 */
async function updateLearningTrust(userId: string) {
  try {
    const metrics = await prisma.readinessMetrics.findUnique({
      where: { entityId: userId },
    });

    if (!metrics) return;

    // Calculate learning trust (0-100)
    // Based on courses completed, certifications, quiz scores
    let learningTrust = 0;

    if (metrics.coursesCompleted > 0) {
      learningTrust += Math.min(metrics.coursesCompleted * 10, 50); // Max 50 points
    }

    if (metrics.certificationsEarned > 0) {
      learningTrust += Math.min(metrics.certificationsEarned * 10, 30); // Max 30 points
    }

    if (metrics.quizAverageScore) {
      learningTrust += metrics.quizAverageScore * 0.2; // Max 20 points
    }

    learningTrust = Math.min(learningTrust, 100);

    // Update TrustScore
    await prisma.trustScore.updateMany({
      where: { entityId: userId },
      data: {
        learningTrust,
      },
    });
  } catch (error: any) {
    console.error('Error updating learning trust:', error);
    // Don't throw - this is a background update
  }
}

/**
 * Get user learning profile
 */
export async function getUserLearningProfile(userId: string): Promise<UserLearningProfile> {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: true,
        credentials: {
          where: {
            isRevoked: false,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
        },
      },
    });

    const completed = enrollments.filter((e) => e.status === 'COMPLETED');
    const credentials = await prisma.credential.findMany({
      where: {
        userId,
        isRevoked: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    const outcomes = await prisma.learningOutcome.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    const requiredCourses = await prisma.course.findMany({
      where: {
        isRequired: true,
        status: 'PUBLISHED',
        isActive: true,
      },
    });

    const totalHours = completed.reduce(
      (sum, e) => sum + (e.course.duration / 60),
      0
    );

    return {
      userId,
      totalCoursesCompleted: completed.length,
      totalCredentialsEarned: credentials.length,
      totalLearningHours: totalHours,
      unlockedFeatures: outcomes.map((o) => o.unlockedFeature),
      requiredCourses: requiredCourses.map((course) => {
        const enrollment = enrollments.find((e) => e.courseId === course.id);
        return {
          ...course,
          isEnrolled: !!enrollment,
          enrollmentId: enrollment?.id,
          progress: enrollment?.progress || 0,
          status: enrollment?.status,
          isCompleted: enrollment?.status === 'COMPLETED',
          hasCredential: (enrollment?.credentials?.length || 0) > 0,
        } as CourseWithProgress;
      }),
      recommendedCourses: [], // TODO: Implement recommendation logic
      recentEnrollments: enrollments
        .slice(0, 5)
        .map((e) => ({
          ...e.course,
          isEnrolled: true,
          enrollmentId: e.id,
          progress: e.progress,
          status: e.status,
          isCompleted: e.status === 'COMPLETED',
          hasCredential: e.credentials.length > 0,
        } as CourseWithProgress)),
    };
  } catch (error: any) {
    console.error('Error fetching learning profile:', error);
    throw createError('Failed to fetch learning profile', 500);
  }
}

/**
 * Check if user has unlocked a specific feature
 */
export async function hasUnlockedFeature(userId: string, feature: string): Promise<boolean> {
  try {
    const outcome = await prisma.learningOutcome.findFirst({
      where: {
        userId,
        unlockedFeature: feature,
        isActive: true,
      },
    });

    return !!outcome;
  } catch (error: any) {
    console.error('Error checking feature unlock:', error);
    return false;
  }
}

/**
 * Submit quiz attempt
 */
export async function submitQuiz(userId: string, input: SubmitQuizInput) {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: input.quizId },
      include: { course: true },
    });

    if (!quiz) {
      throw createError('Quiz not found', 404);
    }

    // Check attempts
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        quizId: input.quizId,
        userId,
      },
    });

    if (attempts.length >= quiz.attemptsAllowed) {
      throw createError('Maximum attempts reached', 400);
    }

    // Calculate score (simplified - would need actual question validation)
    const questions = JSON.parse(quiz.questions as string) as any[];
    let correct = 0;
    // TODO: Implement actual answer validation

    const score = questions.length > 0 ? (correct / questions.length) * 100 : 0;
    const passed = score >= quiz.passingScore;

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: input.quizId,
        userId,
        enrollmentId: input.enrollmentId,
        score,
        passed,
        answers: JSON.stringify(input.answers),
        completedAt: new Date(),
      },
    });

    // Update enrollment quiz score if passed
    if (passed && input.enrollmentId) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { id: input.enrollmentId },
      });

      if (enrollment) {
        await prisma.enrollment.update({
          where: { id: input.enrollmentId },
          data: {
            passedQuiz: true,
            quizScore: score,
          },
        });
      }
    }

    return attempt;
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error submitting quiz:', error);
    throw createError('Failed to submit quiz', 500);
  }
}

