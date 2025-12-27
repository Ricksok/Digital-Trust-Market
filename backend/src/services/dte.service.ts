/**
 * Dynamic Trust Engine (DTE) Service
 * Handles trust score calculations and trust band assignments
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Trust bands
 */
export const TrustBands = {
  PLATINUM: 'PLATINUM',
  GOLD: 'GOLD',
  SILVER: 'SILVER',
  BRONZE: 'BRONZE',
  NEW: 'NEW',
} as const;

/**
 * Initialize trust band for a new user
 * This is a simplified implementation - can be enhanced with ML models
 */
export async function initializeTrustBand(
  userId: string,
  entityType?: string,
  kycStatus?: string | null
): Promise<{ trustBand: string }> {
  try {
    // For new users, start with 'NEW' trust band
    // In a real implementation, this would consider:
    // - KYC status
    // - Referral sources
    // - Initial verification level
    // - Historical data from other platforms (if available)
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        isVerified: true,
        kycRecord: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // If user is verified and has approved KYC, start with BRONZE
    if (user.isVerified && (user.kycRecord?.status === 'APPROVED' || kycStatus === 'APPROVED')) {
      return { trustBand: TrustBands.BRONZE };
    }

    // Default to NEW for unverified users
    return { trustBand: TrustBands.NEW };
  } catch (error) {
    console.error('Error initializing trust band:', error);
    // Default to NEW on error
    return { trustBand: TrustBands.NEW };
  }
}

/**
 * Calculate trust score (0-100)
 * This is a simplified implementation
 */
export async function calculateTrustScore(userId: string): Promise<number> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        trustScore: true,
        behaviorMetrics: true,
        kycRecord: true,
      },
    });

    if (!user) {
      return 0;
    }

    let score = 0;

    // Base score from verification (20 points)
    if (user.isVerified) score += 20;
    if (user.kycRecord?.status === 'APPROVED') score += 20;

    // Behavior metrics (30 points)
    if (user.behaviorMetrics) {
      const metrics = user.behaviorMetrics;
      // Simplified scoring based on activity
      if (metrics.totalTransactions > 0) score += 10;
      if (metrics.successfulTransactions > 0) score += 10;
      const totalDisputes = (metrics.disputesWon || 0) + (metrics.disputesLost || 0);
      if (totalDisputes === 0) score += 10;
    }

    // Trust score history (30 points)
    if (user.trustScore) {
      const baseScore = user.trustScore.trustScore || 0;
      score += Math.min(30, baseScore * 0.3);
    }

    // Ensure score is between 0 and 100
    return Math.min(100, Math.max(0, score));
  } catch (error) {
    console.error('Error calculating trust score:', error);
    return 0;
  }
}

/**
 * Update trust band based on trust score
 */
export async function updateTrustBand(userId: string, trustScore: number): Promise<string> {
  let band: string = TrustBands.NEW;

  if (trustScore >= 90) {
    band = TrustBands.PLATINUM as string;
  } else if (trustScore >= 75) {
    band = TrustBands.GOLD as string;
  } else if (trustScore >= 60) {
    band = TrustBands.SILVER as string;
  } else if (trustScore >= 40) {
    band = TrustBands.BRONZE as string;
  } else {
    band = TrustBands.NEW as string;
  }

  // Update user's trust band
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { trustBand: band },
    });
  } catch (error) {
    console.error('Error updating trust band:', error);
  }

  return band;
}
