/**
 * Learning Exchange Engine (LEE) Types
 * Feature: Learning Exchange Engine
 */

export enum CourseCategory {
  VENDOR_ONBOARDING = 'VENDOR_ONBOARDING',
  AUCTION_BEST_PRACTICES = 'AUCTION_BEST_PRACTICES',
  QUALITY_LOGISTICS = 'QUALITY_LOGISTICS',
  TAX_INVOICING = 'TAX_INVOICING',
  DISPUTE_PREVENTION = 'DISPUTE_PREVENTION',
  COMPLIANCE = 'COMPLIANCE',
}

export enum CourseLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export enum CoursePublisher {
  PLATFORM = 'PLATFORM',
  PARTNER = 'PARTNER',
  REGULATOR = 'REGULATOR',
}

export enum CourseStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum EnrollmentStatus {
  ENROLLED = 'ENROLLED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}

export enum CredentialType {
  CERTIFICATE = 'CERTIFICATE',
  BADGE = 'BADGE',
  CERTIFICATION = 'CERTIFICATION',
}

export interface CreateCourseInput {
  title: string;
  description?: string;
  category: CourseCategory;
  level?: CourseLevel;
  duration: number;
  publisher: CoursePublisher;
  publisherId?: string;
  contentUrl?: string;
  videoUrl?: string;
  materials?: string[];
  prerequisites?: string[];
  unlocks?: string[];
  credentialType?: CredentialType;
  isRequired?: boolean;
  expiryDays?: number;
  metadata?: Record<string, any>;
}

export interface UpdateCourseInput {
  title?: string;
  description?: string;
  category?: CourseCategory;
  level?: CourseLevel;
  duration?: number;
  publisher?: CoursePublisher;
  contentUrl?: string;
  videoUrl?: string;
  materials?: string[];
  prerequisites?: string[];
  unlocks?: string[];
  credentialType?: CredentialType;
  status?: CourseStatus;
  isRequired?: boolean;
  expiryDays?: number;
  metadata?: Record<string, any>;
  publishedAt?: Date;
}

export interface EnrollInCourseInput {
  courseId: string;
}

export interface UpdateEnrollmentProgressInput {
  enrollmentId: string;
  progress: number;
  status?: EnrollmentStatus;
}

export interface CompleteCourseInput {
  enrollmentId: string;
  quizScore?: number;
}

export interface CreateQuizInput {
  courseId: string;
  title: string;
  questions: any[];
  passingScore?: number;
  timeLimit?: number;
  attemptsAllowed?: number;
}

export interface SubmitQuizInput {
  quizId: string;
  enrollmentId?: string;
  answers: any[];
}

export interface CourseWithProgress {
  id: string;
  title: string;
  description?: string;
  category: string;
  level: string;
  duration: number;
  progress?: number;
  status?: EnrollmentStatus;
  enrollmentId?: string;
  isEnrolled: boolean;
  isCompleted: boolean;
  hasCredential: boolean;
}

export interface UserLearningProfile {
  userId: string;
  totalCoursesCompleted: number;
  totalCredentialsEarned: number;
  totalLearningHours: number;
  unlockedFeatures: string[];
  requiredCourses: CourseWithProgress[];
  recommendedCourses: CourseWithProgress[];
  recentEnrollments: CourseWithProgress[];
}

