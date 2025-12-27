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
        price: input.price || 0,
        isPremium: input.isPremium || (input.price ? input.price > 0 : false),
        currency: input.currency || 'KES',
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

    // Check if course is premium and requires payment
    if (course.isPremium && (course.price || 0) > 0) {
      // For premium courses, we would typically check payment status here
      // For now, we'll allow enrollment but this should be integrated with payment service
      // TODO: Integrate with payment service to verify payment before enrollment
      // const payment = await verifyCoursePayment(userId, courseId);
      // if (!payment || payment.status !== 'COMPLETED') {
      //   throw createError('Payment required for premium course', 402);
      // }
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

// ============================================
// Course Sections/Modules
// ============================================

/**
 * Create a course section
 */
export async function createCourseSection(courseId: string, input: { title: string; description?: string; order?: number; content?: any[] }) {
  try {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      throw createError('Course not found', 404);
    }

    // Get max order if not provided
    let order = input.order;
    if (order === undefined) {
      const maxSection = await prisma.courseSection.findFirst({
        where: { courseId },
        orderBy: { order: 'desc' },
      });
      order = maxSection ? maxSection.order + 1 : 0;
    }

    const section = await prisma.courseSection.create({
      data: {
        courseId,
        title: input.title,
        description: input.description,
        order: order,
        content: input.content ? JSON.stringify(input.content) : null,
      },
    });

    return section;
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error creating course section:', error);
    throw createError('Failed to create course section', 500);
  }
}

/**
 * Get course sections
 */
export async function getCourseSections(courseId: string, userId?: string) {
  try {
    const sections = await prisma.courseSection.findMany({
      where: {
        courseId,
        isVisible: true,
      },
      orderBy: { order: 'asc' },
      include: {
        assignments: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        },
        forums: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // If userId provided, enrich with completion status
    if (userId) {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId,
          courseId,
        },
      });

      if (enrollment) {
        const completions = await prisma.activityCompletion.findMany({
          where: {
            enrollmentId: enrollment.id,
            sectionId: { in: sections.map((s) => s.id) },
          },
        });

        const completionMap = new Map(completions.map((c) => [c.sectionId, c]));

        return sections.map((section) => ({
          ...section,
          completion: completionMap.get(section.id),
        }));
      }
    }

    return sections;
  } catch (error: any) {
    console.error('Error fetching course sections:', error);
    throw createError('Failed to fetch course sections', 500);
  }
}

/**
 * Update course section
 */
export async function updateCourseSection(sectionId: string, input: { title?: string; description?: string; order?: number; content?: any[]; isVisible?: boolean }) {
  try {
    const section = await prisma.courseSection.findUnique({ where: { id: sectionId } });
    if (!section) {
      throw createError('Section not found', 404);
    }

    const updated = await prisma.courseSection.update({
      where: { id: sectionId },
      data: {
        title: input.title,
        description: input.description,
        order: input.order,
        content: input.content ? JSON.stringify(input.content) : undefined,
        isVisible: input.isVisible,
      },
    });

    return updated;
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error updating course section:', error);
    throw createError('Failed to update course section', 500);
  }
}

/**
 * Delete course section
 */
export async function deleteCourseSection(sectionId: string) {
  try {
    const section = await prisma.courseSection.findUnique({
      where: { id: sectionId },
      include: {
        assignments: true,
        forums: true,
      },
    });

    if (!section) {
      throw createError('Section not found', 404);
    }

    if (section.assignments.length > 0 || section.forums.length > 0) {
      throw createError('Cannot delete section with assignments or forums', 400);
    }

    await prisma.courseSection.delete({ where: { id: sectionId } });
    return { success: true };
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error deleting course section:', error);
    throw createError('Failed to delete course section', 500);
  }
}

// ============================================
// Assignments
// ============================================

/**
 * Create assignment
 */
export async function createAssignment(courseId: string, input: any) {
  try {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      throw createError('Course not found', 404);
    }

    const assignment = await prisma.assignment.create({
      data: {
        courseId,
        sectionId: input.sectionId,
        title: input.title,
        description: input.description,
        assignmentType: input.assignmentType || 'FILE_UPLOAD',
        maxFileSize: input.maxFileSize,
        allowedFileTypes: input.allowedFileTypes ? JSON.stringify(input.allowedFileTypes) : null,
        maxFiles: input.maxFiles || 1,
        maxScore: input.maxScore || 100,
        passingScore: input.passingScore,
        gradingType: input.gradingType || 'MANUAL',
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        allowLateSubmissions: input.allowLateSubmissions || false,
        latePenalty: input.latePenalty,
      },
    });

    return assignment;
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error creating assignment:', error);
    throw createError('Failed to create assignment', 500);
  }
}

/**
 * Get assignments for a course
 */
export async function getAssignments(courseId: string, userId?: string) {
  try {
    const assignments = await prisma.assignment.findMany({
      where: {
        courseId,
        isActive: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // If userId provided, enrich with submission status
    if (userId) {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId,
          courseId,
        },
      });

      if (enrollment) {
        const submissions = await prisma.assignmentSubmission.findMany({
          where: {
            userId,
            assignmentId: { in: assignments.map((a) => a.id) },
          },
        });

        const submissionMap = new Map(submissions.map((s) => [s.assignmentId, s]));

        return assignments.map((assignment) => ({
          ...assignment,
          submission: submissionMap.get(assignment.id),
          hasSubmission: submissionMap.has(assignment.id),
        }));
      }
    }

    return assignments;
  } catch (error: any) {
    console.error('Error fetching assignments:', error);
    throw createError('Failed to fetch assignments', 500);
  }
}

/**
 * Get assignment by ID
 */
export async function getAssignmentById(assignmentId: string, userId?: string) {
  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: true,
        section: true,
      },
    });

    if (!assignment) {
      throw createError('Assignment not found', 404);
    }

    if (userId) {
      const submission = await prisma.assignmentSubmission.findUnique({
        where: {
          assignmentId_userId: {
            assignmentId,
            userId,
          },
        },
      });

      return {
        ...assignment,
        submission,
      };
    }

    return assignment;
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error fetching assignment:', error);
    throw createError('Failed to fetch assignment', 500);
  }
}

/**
 * Update assignment
 */
export async function updateAssignment(assignmentId: string, input: any) {
  try {
    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) {
      throw createError('Assignment not found', 404);
    }

    const updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        title: input.title,
        description: input.description,
        sectionId: input.sectionId,
        assignmentType: input.assignmentType,
        maxFileSize: input.maxFileSize,
        allowedFileTypes: input.allowedFileTypes ? JSON.stringify(input.allowedFileTypes) : undefined,
        maxFiles: input.maxFiles,
        maxScore: input.maxScore,
        passingScore: input.passingScore,
        gradingType: input.gradingType,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        allowLateSubmissions: input.allowLateSubmissions,
        latePenalty: input.latePenalty,
        isActive: input.isActive,
      },
    });

    return updated;
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error updating assignment:', error);
    throw createError('Failed to update assignment', 500);
  }
}

/**
 * Delete assignment
 */
export async function deleteAssignment(assignmentId: string) {
  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        submissions: true,
      },
    });

    if (!assignment) {
      throw createError('Assignment not found', 404);
    }

    if (assignment.submissions.length > 0) {
      throw createError('Cannot delete assignment with submissions', 400);
    }

    await prisma.assignment.delete({ where: { id: assignmentId } });
    return { success: true };
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error deleting assignment:', error);
    throw createError('Failed to delete assignment', 500);
  }
}

// ============================================
// Assignment Submissions
// ============================================

/**
 * Submit assignment
 */
export async function submitAssignment(userId: string, input: { assignmentId: string; enrollmentId?: string; submissionType: string; fileUrls?: string[]; onlineText?: string; notes?: string }) {
  try {
    const assignment = await prisma.assignment.findUnique({ where: { id: input.assignmentId } });
    if (!assignment) {
      throw createError('Assignment not found', 404);
    }

    if (!assignment.isActive) {
      throw createError('Assignment is not active', 400);
    }

    // Check if already submitted
    const existing = await prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_userId: {
          assignmentId: input.assignmentId,
          userId,
        },
      },
    });

    if (existing && existing.status !== 'DRAFT') {
      throw createError('Assignment already submitted', 400);
    }

    // Check due date
    const now = new Date();
    const isLate = assignment.dueDate && now > assignment.dueDate;
    const lateDays = isLate && assignment.dueDate
      ? Math.floor((now.getTime() - assignment.dueDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    if (isLate && !assignment.allowLateSubmissions) {
      throw createError('Assignment deadline has passed', 400);
    }

    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_userId: {
          assignmentId: input.assignmentId,
          userId,
        },
      },
      update: {
        submissionType: input.submissionType,
        fileUrls: input.fileUrls ? JSON.stringify(input.fileUrls) : null,
        onlineText: input.onlineText,
        notes: input.notes,
        status: 'SUBMITTED',
        submittedAt: new Date(),
        isLate: isLate || false,
        lateDays,
      },
      create: {
        assignmentId: input.assignmentId,
        userId,
        enrollmentId: input.enrollmentId,
        submissionType: input.submissionType,
        fileUrls: input.fileUrls ? JSON.stringify(input.fileUrls) : null,
        onlineText: input.onlineText,
        notes: input.notes,
        status: 'SUBMITTED',
        submittedAt: new Date(),
        isLate: isLate || false,
        lateDays,
      },
    });

    // Update activity completion
    if (input.enrollmentId) {
      await updateActivityCompletion(userId, {
        enrollmentId: input.enrollmentId,
        activityType: 'ASSIGNMENT',
        activityId: input.assignmentId,
        status: 'COMPLETED',
        progress: 100,
      });
    }

    return submission;
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error submitting assignment:', error);
    throw createError('Failed to submit assignment', 500);
  }
}

/**
 * Get submissions for an assignment
 */
export async function getSubmissions(assignmentId: string, userId?: string) {
  try {
    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) {
      throw createError('Assignment not found', 404);
    }

    // If userId is the instructor or admin, show all submissions
    // Otherwise, only show user's own submission
    const where: any = { assignmentId };
    if (userId) {
      // Check if user is instructor (would need course instructor relation)
      // For now, only show own submissions
      where.userId = userId;
    }

    const submissions = await prisma.assignmentSubmission.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return submissions;
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error fetching submissions:', error);
    throw createError('Failed to fetch submissions', 500);
  }
}

/**
 * Get submission by ID
 */
export async function getSubmissionById(submissionId: string, userId?: string) {
  try {
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!submission) {
      throw createError('Submission not found', 404);
    }

    // Check permissions
    if (userId && submission.userId !== userId) {
      // Check if user is instructor/admin (would need proper role check)
      // For now, only allow own submissions
      throw createError('Access denied', 403);
    }

    return submission;
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error fetching submission:', error);
    throw createError('Failed to fetch submission', 500);
  }
}

/**
 * Grade assignment submission
 */
export async function gradeSubmission(submissionId: string, input: { score: number; grade?: string; feedback?: string }, graderId: string) {
  try {
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: { assignment: true },
    });

    if (!submission) {
      throw createError('Submission not found', 404);
    }

    if (submission.status !== 'SUBMITTED') {
      throw createError('Submission is not in a gradable state', 400);
    }

    // Calculate percentage
    const percentage = (input.score / submission.assignment.maxScore) * 100;

    // Update submission
    const updated = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'GRADED',
        score: input.score,
        grade: input.grade,
        feedback: input.feedback,
        gradedAt: new Date(),
        gradedBy: graderId,
      },
    });

    // Add to gradebook
    if (submission.enrollmentId) {
      await prisma.gradebook.upsert({
        where: {
          enrollmentId_activityType_activityId: {
            enrollmentId: submission.enrollmentId,
            activityType: 'ASSIGNMENT',
            activityId: submission.assignmentId,
          },
        },
        update: {
          score: input.score,
          maxScore: submission.assignment.maxScore,
          percentage,
          grade: input.grade,
          isGraded: true,
          gradedAt: new Date(),
          gradedBy: graderId,
          feedback: input.feedback,
        },
        create: {
          enrollmentId: submission.enrollmentId,
          userId: submission.userId,
          courseId: submission.assignment.courseId,
          activityType: 'ASSIGNMENT',
          activityId: submission.assignmentId,
          activityTitle: submission.assignment.title,
          score: input.score,
          maxScore: submission.assignment.maxScore,
          percentage,
          grade: input.grade,
          isGraded: true,
          gradedAt: new Date(),
          gradedBy: graderId,
          feedback: input.feedback,
        },
      });
    }

    return updated;
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error grading submission:', error);
    throw createError('Failed to grade submission', 500);
  }
}

// ============================================
// Forums/Discussions
// ============================================

/**
 * Create forum
 */
export async function createForum(courseId: string, input: { title: string; description?: string; sectionId?: string; forumType?: string; allowAnonymous?: boolean; requireInitialPost?: boolean; isModerated?: boolean }) {
  try {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      throw createError('Course not found', 404);
    }

    const forum = await prisma.forum.create({
      data: {
        courseId,
        sectionId: input.sectionId,
        title: input.title,
        description: input.description,
        forumType: input.forumType || 'STANDARD',
        allowAnonymous: input.allowAnonymous || false,
        requireInitialPost: input.requireInitialPost || false,
        isModerated: input.isModerated || false,
      },
    });

    return forum;
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error creating forum:', error);
    throw createError('Failed to create forum', 500);
  }
}

/**
 * Get forums for a course
 */
export async function getForums(courseId: string) {
  try {
    const forums = await prisma.forum.findMany({
      where: {
        courseId,
        isActive: true,
        isLocked: false,
      },
      orderBy: { lastPostAt: 'desc' },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    return forums;
  } catch (error: any) {
    console.error('Error fetching forums:', error);
    throw createError('Failed to fetch forums', 500);
  }
}

/**
 * Get forum by ID
 */
export async function getForumById(forumId: string) {
  try {
    const forum = await prisma.forum.findUnique({
      where: { id: forumId },
      include: {
        course: true,
        section: true,
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!forum) {
      throw createError('Forum not found', 404);
    }

    return forum;
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error fetching forum:', error);
    throw createError('Failed to fetch forum', 500);
  }
}

/**
 * Create forum post
 */
export async function createForumPost(userId: string, forumId: string, input: { subject?: string; message: string; parentPostId?: string }) {
  try {
    const forum = await prisma.forum.findUnique({ where: { id: forumId } });
    if (!forum) {
      throw createError('Forum not found', 404);
    }

    if (forum.isLocked) {
      throw createError('Forum is locked', 400);
    }

    // Get enrollment if exists
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId,
        courseId: forum.courseId,
      },
    });

    const post = await prisma.forumPost.create({
      data: {
        forumId,
        userId,
        enrollmentId: enrollment?.id,
        subject: input.subject,
        message: input.message,
        parentPostId: input.parentPostId,
      },
    });

    // Update forum post count and last post time
    await prisma.forum.update({
      where: { id: forumId },
      data: {
        postCount: { increment: 1 },
        lastPostAt: new Date(),
      },
    });

    // Update parent post reply count if it's a reply
    if (input.parentPostId) {
      await prisma.forumPost.update({
        where: { id: input.parentPostId },
        data: {
          replyCount: { increment: 1 },
        },
      });
    }

    // Update activity completion
    if (enrollment) {
      await updateActivityCompletion(userId, {
        enrollmentId: enrollment.id,
        activityType: 'FORUM',
        activityId: forumId,
        status: 'COMPLETED',
        progress: 100,
      });
    }

    return post;
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error creating forum post:', error);
    throw createError('Failed to create forum post', 500);
  }
}

/**
 * Get forum posts
 */
export async function getForumPosts(forumId: string, query: any) {
  try {
    const forum = await prisma.forum.findUnique({ where: { id: forumId } });
    if (!forum) {
      throw createError('Forum not found', 404);
    }

    const where: any = {
      forumId,
      isDeleted: false,
    };

    // If Q&A forum and requireInitialPost, only show replies to user's posts
    if (forum.forumType === 'Q_AND_A' && forum.requireInitialPost && query.userId) {
      const userPosts = await prisma.forumPost.findMany({
        where: {
          forumId,
          userId: query.userId,
          parentPostId: null,
        },
        select: { id: true },
      });

      where.OR = [
        { parentPostId: null }, // Show all initial posts
        { parentPostId: { in: userPosts.map((p) => p.id) } }, // Show replies to user's posts
      ];
    }

    const posts = await prisma.forumPost.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: { replies: true },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    return posts;
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error fetching forum posts:', error);
    throw createError('Failed to fetch forum posts', 500);
  }
}

/**
 * Update forum post
 */
export async function updateForumPost(postId: string, userId: string, input: { subject?: string; message?: string }) {
  try {
    const post = await prisma.forumPost.findUnique({ where: { id: postId } });
    if (!post) {
      throw createError('Post not found', 404);
    }

    if (post.userId !== userId) {
      throw createError('Access denied', 403);
    }

    if (post.isDeleted) {
      throw createError('Post is deleted', 400);
    }

    const updated = await prisma.forumPost.update({
      where: { id: postId },
      data: {
        subject: input.subject,
        message: input.message,
      },
    });

    return updated;
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error updating forum post:', error);
    throw createError('Failed to update forum post', 500);
  }
}

/**
 * Delete forum post
 */
export async function deleteForumPost(postId: string, userId: string) {
  try {
    const post = await prisma.forumPost.findUnique({ where: { id: postId } });
    if (!post) {
      throw createError('Post not found', 404);
    }

    // Only allow deletion by post author or admin
    if (post.userId !== userId) {
      // Check if user is admin (would need proper role check)
      throw createError('Access denied', 403);
    }

    const updated = await prisma.forumPost.update({
      where: { id: postId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    // Update forum post count
    await prisma.forum.update({
      where: { id: post.forumId },
      data: {
        postCount: { decrement: 1 },
      },
    });

    return { success: true };
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error deleting forum post:', error);
    throw createError('Failed to delete forum post', 500);
  }
}

// ============================================
// Gradebook
// ============================================

/**
 * Get gradebook for enrollment
 */
export async function getGradebook(enrollmentId: string, userId?: string) {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { user: true, course: true },
    });

    if (!enrollment) {
      throw createError('Enrollment not found', 404);
    }

    // Check permissions
    if (userId && enrollment.userId !== userId) {
      // Check if user is instructor/admin
      throw createError('Access denied', 403);
    }

    const gradebook = await prisma.gradebook.findMany({
      where: { enrollmentId },
      orderBy: { createdAt: 'asc' },
    });

    // Calculate totals
    const totalScore = gradebook.reduce((sum, entry) => sum + (entry.score || 0) * entry.weight, 0);
    const totalWeight = gradebook.reduce((sum, entry) => sum + entry.weight, 0);
    const finalPercentage = totalWeight > 0 ? totalScore / totalWeight : 0;

    return {
      enrollment,
      entries: gradebook,
      totals: {
        totalScore,
        totalWeight,
        finalPercentage,
        finalGrade: calculateLetterGrade(finalPercentage),
      },
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error fetching gradebook:', error);
    throw createError('Failed to fetch gradebook', 500);
  }
}

/**
 * Add gradebook entry
 */
export async function addGradebookEntry(input: { enrollmentId: string; activityType: string; activityId: string; activityTitle: string; score: number; maxScore: number; grade?: string; weight?: number; feedback?: string }, graderId: string) {
  try {
    const enrollment = await prisma.enrollment.findUnique({ where: { id: input.enrollmentId } });
    if (!enrollment) {
      throw createError('Enrollment not found', 404);
    }

    const percentage = (input.score / input.maxScore) * 100;

    const entry = await prisma.gradebook.upsert({
      where: {
        enrollmentId_activityType_activityId: {
          enrollmentId: input.enrollmentId,
          activityType: input.activityType,
          activityId: input.activityId,
        },
      },
      update: {
        score: input.score,
        maxScore: input.maxScore,
        percentage,
        grade: input.grade || calculateLetterGrade(percentage),
        weight: input.weight || 1.0,
        isGraded: true,
        gradedAt: new Date(),
        gradedBy: graderId,
        feedback: input.feedback,
      },
      create: {
        enrollmentId: input.enrollmentId,
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        activityType: input.activityType,
        activityId: input.activityId,
        activityTitle: input.activityTitle,
        score: input.score,
        maxScore: input.maxScore,
        percentage,
        grade: input.grade || calculateLetterGrade(percentage),
        weight: input.weight || 1.0,
        isGraded: true,
        gradedAt: new Date(),
        gradedBy: graderId,
        feedback: input.feedback,
      },
    });

    return entry;
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error adding gradebook entry:', error);
    throw createError('Failed to add gradebook entry', 500);
  }
}

/**
 * Update gradebook entry
 */
export async function updateGradebookEntry(entryId: string, input: { score?: number; maxScore?: number; grade?: string; weight?: number; feedback?: string }, graderId: string) {
  try {
    const entry = await prisma.gradebook.findUnique({ where: { id: entryId } });
    if (!entry) {
      throw createError('Gradebook entry not found', 404);
    }

    const maxScore = input.maxScore || entry.maxScore;
    const score = input.score !== undefined ? input.score : entry.score;
    const percentage = score ? (score / maxScore) * 100 : null;

    const updated = await prisma.gradebook.update({
      where: { id: entryId },
      data: {
        score: input.score,
        maxScore: input.maxScore,
        percentage,
        grade: input.grade || (percentage ? calculateLetterGrade(percentage) : null),
        weight: input.weight,
        feedback: input.feedback,
        gradedBy: graderId,
        updatedAt: new Date(),
      },
    });

    return updated;
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error updating gradebook entry:', error);
    throw createError('Failed to update gradebook entry', 500);
  }
}

// Helper function to calculate letter grade
function calculateLetterGrade(percentage: number): string {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

// ============================================
// Activity Completion
// ============================================

/**
 * Update activity completion
 */
export async function updateActivityCompletion(userId: string, input: { enrollmentId: string; activityType: string; activityId: string; sectionId?: string; status: string; progress: number }) {
  try {
    const enrollment = await prisma.enrollment.findUnique({ where: { id: input.enrollmentId } });
    if (!enrollment) {
      throw createError('Enrollment not found', 404);
    }

    if (enrollment.userId !== userId) {
      throw createError('Access denied', 403);
    }

    const completion = await prisma.activityCompletion.upsert({
      where: {
        enrollmentId_activityType_activityId: {
          enrollmentId: input.enrollmentId,
          activityType: input.activityType,
          activityId: input.activityId,
        },
      },
      update: {
        status: input.status,
        progress: input.progress,
        completedAt: input.status === 'COMPLETED' || input.status === 'PASSED' ? new Date() : undefined,
      },
      create: {
        enrollmentId: input.enrollmentId,
        userId,
        courseId: enrollment.courseId,
        sectionId: input.sectionId,
        activityType: input.activityType,
        activityId: input.activityId,
        status: input.status,
        progress: input.progress,
        completedAt: input.status === 'COMPLETED' || input.status === 'PASSED' ? new Date() : undefined,
      },
    });

    // Update enrollment progress based on activity completions
    await updateEnrollmentProgressFromActivities(input.enrollmentId);

    return completion;
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error updating activity completion:', error);
    throw createError('Failed to update activity completion', 500);
  }
}

/**
 * Get activity completions for enrollment
 */
export async function getActivityCompletions(enrollmentId: string) {
  try {
    const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId } });
    if (!enrollment) {
      throw createError('Enrollment not found', 404);
    }

    const completions = await prisma.activityCompletion.findMany({
      where: { enrollmentId },
      orderBy: { createdAt: 'asc' },
    });

    return completions;
  } catch (error: any) {
    console.error('Error fetching activity completions:', error);
    throw createError('Failed to fetch activity completions', 500);
  }
}

/**
 * Update enrollment progress based on activity completions
 */
async function updateEnrollmentProgressFromActivities(enrollmentId: string) {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { course: true },
    });

    if (!enrollment) return;

    const completions = await prisma.activityCompletion.findMany({
      where: { enrollmentId },
    });

    if (completions.length === 0) return;

    // Calculate overall progress
    const totalProgress = completions.reduce((sum, c) => sum + c.progress, 0);
    const averageProgress = totalProgress / completions.length;

    // Update enrollment progress
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progress: Math.min(averageProgress, 100),
        status: averageProgress === 100 ? 'COMPLETED' : 'IN_PROGRESS',
      },
    });
  } catch (error: any) {
    console.error('Error updating enrollment progress from activities:', error);
    // Don't throw - this is a background update
  }
}

// ============================================
// Additional Helper Functions
// ============================================

/**
 * Get enrollments for user
 */
export async function getEnrollments(userId: string, query: any) {
  try {
    const where: any = { userId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.courseId) {
      where.courseId = query.courseId;
    }

    const enrollments = await prisma.enrollment.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    });

    return enrollments;
  } catch (error: any) {
    console.error('Error fetching enrollments:', error);
    throw createError('Failed to fetch enrollments', 500);
  }
}

/**
 * Get credentials for user
 */
export async function getCredentials(userId: string) {
  try {
    const credentials = await prisma.credential.findMany({
      where: {
        userId,
        isRevoked: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: {
        course: true,
        enrollment: true,
      },
      orderBy: { issuedAt: 'desc' },
    });

    return credentials;
  } catch (error: any) {
    console.error('Error fetching credentials:', error);
    throw createError('Failed to fetch credentials', 500);
  }
}

/**
 * Get credential by ID
 */
export async function getCredentialById(credentialId: string, userId?: string) {
  try {
    const credential = await prisma.credential.findUnique({
      where: { id: credentialId },
      include: {
        course: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        enrollment: true,
      },
    });

    if (!credential) {
      throw createError('Credential not found', 404);
    }

    // Check permissions
    if (userId && credential.userId !== userId) {
      throw createError('Access denied', 403);
    }

    return credential;
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error fetching credential:', error);
    throw createError('Failed to fetch credential', 500);
  }
}

/**
 * Verify credential by credential number
 */
export async function verifyCredential(credentialNumber: string) {
  try {
    const credential = await prisma.credential.findUnique({
      where: { credentialNumber },
      include: {
        course: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        enrollment: true,
      },
    });

    if (!credential) {
      throw createError('Credential not found', 404);
    }

    if (credential.isRevoked) {
      throw createError('Credential has been revoked', 400);
    }

    if (credential.isExpired) {
      throw createError('Credential has expired', 400);
    }

    if (credential.expiresAt && credential.expiresAt < new Date()) {
      throw createError('Credential has expired', 400);
    }

    return {
      valid: true,
      credential,
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error verifying credential:', error);
    throw createError('Failed to verify credential', 500);
  }
}

/**
 * Create quiz (enhanced version)
 */
export async function createQuiz(courseId: string, input: CreateQuizInput) {
  try {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      throw createError('Course not found', 404);
    }

    const quiz = await prisma.quiz.create({
      data: {
        courseId,
        title: input.title,
        questions: JSON.stringify(input.questions),
        passingScore: input.passingScore || 70,
        timeLimit: input.timeLimit,
        attemptsAllowed: input.attemptsAllowed || 3,
      },
    });

    return quiz;
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error creating quiz:', error);
    throw createError('Failed to create quiz', 500);
  }
}

