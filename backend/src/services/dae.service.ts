/**
 * Dynamic Analytics Engine (DAE) Service
 * Handles transaction cap calculations and risk assessments
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Calculate transaction caps for a user
 * This is a simplified implementation - can be enhanced with ML models
 */
export async function calculateTransactionCaps(
  userId: string,
  entityType?: string,
  trustBand?: string | null
): Promise<{ transactionCap: number }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        trustScore: true,
        behaviorMetrics: true,
        kycRecord: true,
      },
    });

    // Use provided trustBand or get from user
    const userTrustBand = trustBand || user?.trustBand;

    if (!user) {
      // Default cap for unknown users
      return { transactionCap: 500 };
    }

    // Base cap
    let transactionCap = 500;

    // Adjust based on trust band
    if (userTrustBand === 'PLATINUM') {
      transactionCap = 50000;
    } else if (userTrustBand === 'GOLD') {
      transactionCap = 25000;
    } else if (userTrustBand === 'SILVER') {
      transactionCap = 10000;
    } else if (userTrustBand === 'BRONZE') {
      transactionCap = 5000;
    } else {
      // NEW trust band - default cap
      transactionCap = 500;
    }

    // Adjust based on KYC status
    if (user.kycRecord?.status === 'APPROVED') {
      transactionCap *= 2;
    }

    // Adjust based on verification
    if (user.isVerified) {
      transactionCap *= 1.5;
    }

    // Adjust based on behavior metrics
    if (user.behaviorMetrics) {
      const metrics = user.behaviorMetrics;
      const successRate = metrics.totalTransactions > 0
        ? metrics.successfulTransactions / metrics.totalTransactions
        : 0;

      if (successRate > 0.95 && metrics.totalTransactions > 10) {
        // High success rate - increase cap
        transactionCap *= 1.2;
      }
      
      const totalDisputes = (metrics.disputesWon || 0) + (metrics.disputesLost || 0);
      if (successRate < 0.7 || totalDisputes > 3) {
        // Low success rate or many disputes - decrease cap
        transactionCap *= 0.7;
      }
    }

    return {
      transactionCap: Math.round(transactionCap),
    };
  } catch (error) {
    console.error('Error calculating transaction caps:', error);
    // Return default cap on error
    return { transactionCap: 500 };
  }
}

/**
 * Check if a transaction amount is within caps
 */
export async function isWithinCaps(
  userId: string,
  amount: number
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { trustBand: true, entityType: true },
    });
    
    const caps = await calculateTransactionCaps(userId, user?.entityType || undefined, user?.trustBand || undefined);
    
    if (amount > caps.transactionCap) {
      return {
        allowed: false,
        reason: `Transaction amount exceeds transaction cap of ${caps.transactionCap}`,
      };
    }

    // TODO: Check daily/weekly/monthly caps by querying transaction history
    // For now, just check transaction cap
    return { allowed: true };
  } catch (error) {
    console.error('Error checking transaction caps:', error);
    return { allowed: false, reason: 'Error checking transaction caps' };
  }
}
