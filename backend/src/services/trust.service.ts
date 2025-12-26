import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

// Trust Score Constants
const TRUST_DIMENSIONS = {
  IDENTITY: 'identityTrust',
  TRANSACTION: 'transactionTrust',
  FINANCIAL: 'financialTrust',
  PERFORMANCE: 'performanceTrust',
  GUARANTEE: 'guaranteeTrust',
  GOVERNANCE: 'governanceTrust',
  LEARNING: 'learningTrust',
};

const TRUST_EVENT_TYPES = {
  UPDATED: 'TRUST_UPDATED',
  DECAY_APPLIED: 'TRUST_DECAY_APPLIED',
  THRESHOLD_BREACHED: 'TRUST_THRESHOLD_BREACHED',
  RECOVERY_EVENT: 'TRUST_RECOVERY_EVENT',
  MANUAL_ADJUSTMENT: 'MANUAL_ADJUSTMENT',
};

const TRIGGER_TYPES = {
  AUTOMATIC: 'AUTOMATIC',
  MANUAL: 'MANUAL',
  TRANSACTION: 'TRANSACTION',
  LEARNING: 'LEARNING',
  BEHAVIOR: 'BEHAVIOR',
  PAYMENT: 'PAYMENT',
  INVESTMENT: 'INVESTMENT',
};

/**
 * Get or create trust score for an entity
 */
export const getOrCreateTrustScore = async (entityId: string) => {
  let trustScore = await prisma.trustScore.findUnique({
    where: { entityId },
    include: {
      trustEvents: {
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!trustScore) {
    // Initialize trust score with defaults
    trustScore = await prisma.trustScore.create({
      data: {
        entityId,
        trustScore: 0,
        identityTrust: 0,
        behaviorScore: 0,
      },
      include: {
        trustEvents: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  return trustScore;
};

/**
 * Calculate Identity Trust based on KYC status
 */
const calculateIdentityTrust = async (entityId: string): Promise<number> => {
  const user = await prisma.user.findUnique({
    where: { id: entityId },
    include: { kycRecord: true },
  });

  if (!user) {
    return 0;
  }

  let score = 0;

  // KYC Status contributes 60 points
  if (user.kycRecord) {
    switch (user.kycRecord.status) {
      case 'APPROVED':
        score += 60;
        break;
      case 'IN_PROGRESS':
        score += 30;
        break;
      case 'PENDING':
        score += 10;
        break;
      default:
        score += 0;
    }
  }

  // Verification status contributes 20 points
  if (user.isVerified) {
    score += 20;
  }

  // Active status contributes 10 points
  if (user.isActive) {
    score += 10;
  }

  // Document completeness contributes 10 points
  if (user.kycRecord?.documentType && user.kycRecord?.documentNumber) {
    score += 10;
  }

  return Math.min(100, score);
};

/**
 * Calculate Transaction Trust based on transaction success rate
 */
const calculateTransactionTrust = async (entityId: string): Promise<number> => {
  const behaviorMetrics = await prisma.behaviorMetrics.findUnique({
    where: { entityId },
  });

  if (!behaviorMetrics || behaviorMetrics.totalTransactions === 0) {
    return 50; // Default neutral score for new entities
  }

  // Base score from success rate (0-70 points)
  const successRate = behaviorMetrics.transactionSuccessRate;
  let score = successRate * 0.7;

  // Payment punctuality contributes up to 20 points
  score += behaviorMetrics.paymentPunctuality * 0.2;

  // Delivery timeliness contributes up to 10 points
  score += behaviorMetrics.deliveryTimeliness * 0.1;

  return Math.min(100, Math.max(0, score));
};

/**
 * Calculate Financial Trust based on financial behavior
 */
const calculateFinancialTrust = async (entityId: string): Promise<number> => {
  const behaviorMetrics = await prisma.behaviorMetrics.findUnique({
    where: { entityId },
  });

  if (!behaviorMetrics || behaviorMetrics.totalPayments === 0) {
    return 50; // Default neutral score
  }

  // Payment punctuality is primary factor (0-80 points)
  let score = behaviorMetrics.paymentPunctuality * 0.8;

  // Escrow success rate contributes up to 20 points
  if (behaviorMetrics.totalEscrows > 0) {
    score += behaviorMetrics.escrowSuccessRate * 0.2;
  }

  return Math.min(100, Math.max(0, score));
};

/**
 * Calculate Performance Trust based on delivery and performance metrics
 */
const calculatePerformanceTrust = async (entityId: string): Promise<number> => {
  const behaviorMetrics = await prisma.behaviorMetrics.findUnique({
    where: { entityId },
  });

  if (!behaviorMetrics || behaviorMetrics.totalDeliveries === 0) {
    return 50; // Default neutral score
  }

  // Delivery timeliness is primary factor (0-70 points)
  let score = behaviorMetrics.deliveryTimeliness * 0.7;

  // Transaction success rate contributes up to 20 points
  score += behaviorMetrics.transactionSuccessRate * 0.2;

  // Low dispute rate contributes up to 10 points
  const disputePenalty = behaviorMetrics.disputeRate * 10;
  score += Math.max(0, 10 - disputePenalty);

  return Math.min(100, Math.max(0, score));
};

/**
 * Calculate Learning Trust based on EdTech completion
 */
const calculateLearningTrust = async (entityId: string): Promise<number> => {
  const readinessMetrics = await prisma.readinessMetrics.findUnique({
    where: { entityId },
  });

  if (!readinessMetrics) {
    return 0;
  }

  let score = 0;

  // Course completion contributes up to 40 points
  if (readinessMetrics.coursesCompleted > 0) {
    score += Math.min(40, readinessMetrics.coursesCompleted * 5);
  }

  // Certifications contribute up to 30 points
  if (readinessMetrics.certificationsEarned > 0) {
    score += Math.min(30, readinessMetrics.certificationsEarned * 10);
  }

  // Quiz average contributes up to 20 points
  if (readinessMetrics.quizAverageScore) {
    score += readinessMetrics.quizAverageScore * 0.2;
  }

  // Documentation readiness contributes up to 10 points
  score += readinessMetrics.documentationReadiness * 0.1;

  return Math.min(100, Math.max(0, score));
};

/**
 * Calculate overall Trust Score from all dimensions
 */
const calculateOverallTrustScore = (dimensions: {
  identityTrust: number;
  transactionTrust: number;
  financialTrust: number;
  performanceTrust: number;
  learningTrust: number;
}): number => {
  // Weighted average of all dimensions
  // Identity is foundational (30%), others share remaining 70%
  const weights = {
    identity: 0.30,
    transaction: 0.20,
    financial: 0.20,
    performance: 0.20,
    learning: 0.10,
  };

  const score =
    dimensions.identityTrust * weights.identity +
    dimensions.transactionTrust * weights.transaction +
    dimensions.financialTrust * weights.financial +
    dimensions.performanceTrust * weights.performance +
    dimensions.learningTrust * weights.learning;

  return Math.min(100, Math.max(0, score));
};

/**
 * Calculate Behavior Score based on consistency and patterns
 */
const calculateBehaviorScore = async (entityId: string): Promise<number> => {
  const behaviorMetrics = await prisma.behaviorMetrics.findUnique({
    where: { entityId },
  });

  if (!behaviorMetrics) {
    return 50; // Default neutral score
  }

  let score = 50; // Start at neutral

  // Positive factors
  if (behaviorMetrics.transactionSuccessRate > 0.9) {
    score += 20;
  } else if (behaviorMetrics.transactionSuccessRate > 0.7) {
    score += 10;
  }

  if (behaviorMetrics.paymentPunctuality > 90) {
    score += 15;
  } else if (behaviorMetrics.paymentPunctuality > 70) {
    score += 7;
  }

  if (behaviorMetrics.deliveryTimeliness > 90) {
    score += 15;
  } else if (behaviorMetrics.deliveryTimeliness > 70) {
    score += 7;
  }

  // Negative factors
  if (behaviorMetrics.disputeRate > 0.1) {
    score -= 20;
  } else if (behaviorMetrics.disputeRate > 0.05) {
    score -= 10;
  }

  return Math.min(100, Math.max(0, score));
};

/**
 * Recalculate all trust scores for an entity
 */
export const recalculateTrustScores = async (
  entityId: string,
  triggerType: string = TRIGGER_TYPES.AUTOMATIC,
  triggerEntityId?: string,
  triggerEntityType?: string
) => {
  // Calculate all dimension scores
  const identityTrust = await calculateIdentityTrust(entityId);
  const transactionTrust = await calculateTransactionTrust(entityId);
  const financialTrust = await calculateFinancialTrust(entityId);
  const performanceTrust = await calculatePerformanceTrust(entityId);
  const learningTrust = await calculateLearningTrust(entityId);
  const behaviorScore = await calculateBehaviorScore(entityId);

  // Calculate overall trust score
  const trustScore = calculateOverallTrustScore({
    identityTrust,
    transactionTrust,
    financialTrust,
    performanceTrust,
    learningTrust,
  });

  // Get existing trust score
  const existing = await getOrCreateTrustScore(entityId);

  // Determine if significant change occurred
  const scoreChange = trustScore - existing.trustScore;
  const significantChange = Math.abs(scoreChange) >= 1; // 1 point threshold

  // Update trust score
  const updated = await prisma.trustScore.update({
    where: { entityId },
    data: {
      trustScore,
      identityTrust,
      transactionTrust,
      financialTrust,
      performanceTrust,
      learningTrust,
      behaviorScore,
      lastCalculatedAt: new Date(),
      calculationVersion: '1.0',
    },
  });

  // Log trust event if significant change
  if (significantChange) {
    await prisma.trustEvent.create({
      data: {
        trustScoreId: updated.id,
        eventType: TRUST_EVENT_TYPES.UPDATED,
        previousScore: existing.trustScore,
        newScore: trustScore,
        changeAmount: scoreChange,
        triggerType,
        triggerEntityId,
        triggerEntityType,
        reason: `Trust score recalculated. Change: ${scoreChange > 0 ? '+' : ''}${scoreChange.toFixed(2)}`,
        calculationDetails: JSON.stringify({
          dimensions: {
            identityTrust,
            transactionTrust,
            financialTrust,
            performanceTrust,
            learningTrust,
          },
          behaviorScore,
        }),
      },
    });
  }

  return updated;
};

/**
 * Get trust score for an entity
 */
export const getTrustScore = async (entityId: string) => {
  const trustScore = await getOrCreateTrustScore(entityId);
  
  // If score is stale (older than 24 hours), recalculate
  const hoursSinceUpdate = (Date.now() - trustScore.lastCalculatedAt.getTime()) / (1000 * 60 * 60);
  if (hoursSinceUpdate > 24) {
    return await recalculateTrustScores(entityId);
  }

  return trustScore;
};

/**
 * Get trust score history
 */
export const getTrustScoreHistory = async (entityId: string, limit: number = 50) => {
  const trustScore = await prisma.trustScore.findUnique({
    where: { entityId },
  });

  if (!trustScore) {
    return [];
  }

  return await prisma.trustEvent.findMany({
    where: { trustScoreId: trustScore.id },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
};

/**
 * Explain trust score - provide breakdown and reasoning
 */
export const explainTrustScore = async (entityId: string) => {
  const trustScore = await getTrustScore(entityId);
  const behaviorMetrics = await prisma.behaviorMetrics.findUnique({
    where: { entityId },
  });
  const readinessMetrics = await prisma.readinessMetrics.findUnique({
    where: { entityId },
  });

  const user = await prisma.user.findUnique({
    where: { id: entityId },
    include: { kycRecord: true },
  });

  const explanation = {
    overallScore: trustScore.trustScore,
    breakdown: {
      identityTrust: {
        score: trustScore.identityTrust,
        factors: [
          user?.kycRecord?.status === 'APPROVED' ? 'KYC Approved' : 'KYC Pending',
          user?.isVerified ? 'Verified Account' : 'Unverified Account',
          user?.isActive ? 'Active Account' : 'Inactive Account',
        ],
      },
      transactionTrust: {
        score: trustScore.transactionTrust || 0,
        factors: behaviorMetrics
          ? [
              `Transaction Success Rate: ${(behaviorMetrics.transactionSuccessRate * 100).toFixed(1)}%`,
              `Payment Punctuality: ${behaviorMetrics.paymentPunctuality.toFixed(1)}%`,
              `Delivery Timeliness: ${behaviorMetrics.deliveryTimeliness.toFixed(1)}%`,
            ]
          : ['No transaction history'],
      },
      financialTrust: {
        score: trustScore.financialTrust || 0,
        factors: behaviorMetrics
          ? [
              `Payment Punctuality: ${behaviorMetrics.paymentPunctuality.toFixed(1)}%`,
              `Escrow Success Rate: ${behaviorMetrics.escrowSuccessRate.toFixed(1)}%`,
            ]
          : ['No payment history'],
      },
      performanceTrust: {
        score: trustScore.performanceTrust || 0,
        factors: behaviorMetrics
          ? [
              `Delivery Timeliness: ${behaviorMetrics.deliveryTimeliness.toFixed(1)}%`,
              `Dispute Rate: ${(behaviorMetrics.disputeRate * 100).toFixed(1)}%`,
            ]
          : ['No performance history'],
      },
      learningTrust: {
        score: trustScore.learningTrust || 0,
        factors: readinessMetrics
          ? [
              `Courses Completed: ${readinessMetrics.coursesCompleted}`,
              `Certifications: ${readinessMetrics.certificationsEarned}`,
              `Quiz Average: ${readinessMetrics.quizAverageScore?.toFixed(1) || 'N/A'}%`,
            ]
          : ['No learning history'],
      },
    },
    behaviorScore: trustScore.behaviorScore,
    lastUpdated: trustScore.lastCalculatedAt,
  };

  return explanation;
};

/**
 * Apply trust decay (for entities with no recent activity)
 */
export const applyTrustDecay = async (entityId: string, decayAmount: number = 1) => {
  const trustScore = await getOrCreateTrustScore(entityId);
  
  if (trustScore.trustScore <= 0) {
    return trustScore; // Already at minimum
  }

  const newScore = Math.max(0, trustScore.trustScore - decayAmount);

  const updated = await prisma.trustScore.update({
    where: { entityId },
    data: {
      trustScore: newScore,
      lastCalculatedAt: new Date(),
    },
  });

  await prisma.trustEvent.create({
    data: {
      trustScoreId: updated.id,
      eventType: TRUST_EVENT_TYPES.DECAY_APPLIED,
      previousScore: trustScore.trustScore,
      newScore,
      changeAmount: -decayAmount,
      triggerType: TRIGGER_TYPES.AUTOMATIC,
      reason: `Trust decay applied due to inactivity. Decay: -${decayAmount}`,
    },
  });

  return updated;
};

/**
 * Manual trust adjustment (admin only)
 */
export const adjustTrustScore = async (
  entityId: string,
  adjustment: number,
  reason: string,
  adminId: string
) => {
  const trustScore = await getOrCreateTrustScore(entityId);
  const newScore = Math.min(100, Math.max(0, trustScore.trustScore + adjustment));

  const updated = await prisma.trustScore.update({
    where: { entityId },
    data: {
      trustScore: newScore,
      lastCalculatedAt: new Date(),
    },
  });

  await prisma.trustEvent.create({
    data: {
      trustScoreId: updated.id,
      eventType: TRUST_EVENT_TYPES.MANUAL_ADJUSTMENT,
      previousScore: trustScore.trustScore,
      newScore,
      changeAmount: adjustment,
      triggerType: TRIGGER_TYPES.MANUAL,
      triggerEntityId: adminId,
      triggerEntityType: 'ADMIN',
      reason: `Manual adjustment by admin. Reason: ${reason}`,
    },
  });

  return updated;
};

