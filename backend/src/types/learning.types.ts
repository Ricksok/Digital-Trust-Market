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
  price?: number;
  isPremium?: boolean;
  currency?: string;
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
  price?: number;
  isPremium?: boolean;
  currency?: string;
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

// ============================================
// Course Sections
// ============================================

export interface CreateCourseSectionInput {
  title: string;
  description?: string;
  order?: number;
  content?: any[];
}

export interface UpdateCourseSectionInput {
  title?: string;
  description?: string;
  order?: number;
  content?: any[];
  isVisible?: boolean;
}

// ============================================
// Assignments
// ============================================

export enum AssignmentType {
  FILE_UPLOAD = 'FILE_UPLOAD',
  ESSAY = 'ESSAY',
  ONLINE_TEXT = 'ONLINE_TEXT',
  OFFLINE = 'OFFLINE',
}

export enum GradingType {
  MANUAL = 'MANUAL',
  AUTO = 'AUTO',
  RUBRIC = 'RUBRIC',
}

export interface CreateAssignmentInput {
  sectionId?: string;
  title: string;
  description?: string;
  assignmentType?: AssignmentType;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  maxFiles?: number;
  maxScore?: number;
  passingScore?: number;
  gradingType?: GradingType;
  dueDate?: Date;
  allowLateSubmissions?: boolean;
  latePenalty?: number;
}

export interface UpdateAssignmentInput {
  title?: string;
  description?: string;
  sectionId?: string;
  assignmentType?: AssignmentType;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  maxFiles?: number;
  maxScore?: number;
  passingScore?: number;
  gradingType?: GradingType;
  dueDate?: Date;
  allowLateSubmissions?: boolean;
  latePenalty?: number;
  isActive?: boolean;
}

export interface SubmitAssignmentInput {
  assignmentId: string;
  enrollmentId?: string;
  submissionType: string;
  fileUrls?: string[];
  onlineText?: string;
  notes?: string;
}

export interface GradeSubmissionInput {
  score: number;
  grade?: string;
  feedback?: string;
}

// ============================================
// Forums
// ============================================

export enum ForumType {
  STANDARD = 'STANDARD',
  Q_AND_A = 'Q_AND_A',
  SINGLE_DISCUSSION = 'SINGLE_DISCUSSION',
}

export interface CreateForumInput {
  sectionId?: string;
  title: string;
  description?: string;
  forumType?: ForumType;
  allowAnonymous?: boolean;
  requireInitialPost?: boolean;
  isModerated?: boolean;
}

export interface CreateForumPostInput {
  subject?: string;
  message: string;
  parentPostId?: string;
}

export interface UpdateForumPostInput {
  subject?: string;
  message?: string;
}

// ============================================
// Gradebook
// ============================================

export interface AddGradebookEntryInput {
  enrollmentId: string;
  activityType: string;
  activityId: string;
  activityTitle: string;
  score: number;
  maxScore: number;
  grade?: string;
  weight?: number;
  feedback?: string;
}

export interface UpdateGradebookEntryInput {
  score?: number;
  maxScore?: number;
  grade?: string;
  weight?: number;
  feedback?: string;
}

// ============================================
// Activity Completion
// ============================================

export enum ActivityType {
  QUIZ = 'QUIZ',
  ASSIGNMENT = 'ASSIGNMENT',
  FORUM = 'FORUM',
  RESOURCE = 'RESOURCE',
  VIDEO = 'VIDEO',
  SECTION = 'SECTION',
}

export enum ActivityCompletionStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
}

export interface UpdateActivityCompletionInput {
  enrollmentId: string;
  activityType: string;
  activityId: string;
  sectionId?: string;
  status: string;
  progress: number;
}

