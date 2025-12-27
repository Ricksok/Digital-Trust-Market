/**
 * Vendor Central Service
 * Feature: Vendor Central Dashboard
 * 
 * Provides self-service vendor management and analytics
 */

import { PrismaClient } from '@prisma/client';
import { createError } from '../middleware/errorHandler';
import { getUserLearningProfile } from './learning.service';

const prisma = new PrismaClient();

export interface VendorDashboard {
  // Overview
  totalSales: number;
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  
  // Performance Metrics
  fulfillmentRate: number; // 0-100
  onTimeDeliveryRate: number; // 0-100
  disputeRate: number; // 0-100
  averageOrderValue: number;
  
  // Trust & Learning
  trustBand: string | null;
  trustBandTrend: 'up' | 'down' | 'stable';
  learningProgress: {
    coursesCompleted: number;
    credentialsEarned: number;
    requiredCoursesRemaining: number;
  };
  
  // Auction Performance
  auctionStats: {
    totalBids: number;
    winningBids: number;
    winRate: number;
    averageBidAmount: number;
  };
  
  // Recent Activity
  recentOrders: any[];
  recentAuctions: any[];
  recentLearning: any[];
  
  // Accounting Summary
  accountingSummary: {
    totalRevenue: number;
    pendingPayments: number;
    completedPayments: number;
    taxObligations: number;
  };
}

/**
 * Get vendor dashboard data
 */
export async function getVendorDashboard(userId: string): Promise<VendorDashboard> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        trustScore: true,
        behaviorMetrics: true,
        readinessMetrics: true,
      },
    });

    if (!user) {
      throw createError('User not found', 404);
    }

    // Check if user is a vendor/supplier
    const isVendor = user.role === 'SUPPLIER';

    if (!isVendor) {
      throw createError('User is not a vendor', 403);
    }

    // Get orders (using projects/investments as proxy for now)
    // TODO: Replace with actual order system when implemented
    const projects = await prisma.project.findMany({
      where: { fundraiserId: userId },
      include: {
        investments: {
          where: { status: { in: ['APPROVED', 'ESCROWED', 'RELEASED'] } },
        },
      },
    });

    const totalSales = projects.reduce((sum, p) => sum + p.currentAmount, 0);
    const totalOrders = projects.length;
    const activeOrders = projects.filter((p) => 
      ['APPROVED', 'ACTIVE'].includes(p.status)
    ).length;
    const completedOrders = projects.filter((p) => 
      ['COMPLETED', 'FUNDED'].includes(p.status)
    ).length;

    // Get auction stats
    const bids = await prisma.bid.findMany({
      where: { bidderId: userId },
      include: {
        auction: true,
      },
    });

    const winningBids = bids.filter((b) => b.status === 'ACCEPTED').length;
    const totalBidAmount = bids.reduce((sum, b) => sum + (b.price || 0), 0);

    // Get behavior metrics
    const behavior = user.behaviorMetrics;
    const fulfillmentRate = behavior?.transactionSuccessRate || 0;
    const onTimeDeliveryRate = behavior?.deliveryTimeliness || 0;
    const disputeRate = behavior?.disputeRate || 0;

    // Get trust score trend (simplified - would need historical data)
    const trustBand = user.trustBand;
    const trustBandTrend: 'up' | 'down' | 'stable' = 'stable'; // TODO: Calculate from history

    // Get learning profile
    const learningProfile = await getUserLearningProfile(userId);

    // Get accounting summary (using payments as proxy)
    const payments = await prisma.payment.findMany({
      where: {
        userId: userId,
      },
    });

    const totalRevenue = payments
      .filter((p) => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const pendingPayments = payments
      .filter((p) => p.status === 'PENDING')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      totalSales,
      totalOrders,
      activeOrders,
      completedOrders,
      fulfillmentRate,
      onTimeDeliveryRate,
      disputeRate,
      averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
      trustBand,
      trustBandTrend,
      learningProgress: {
        coursesCompleted: learningProfile.totalCoursesCompleted,
        credentialsEarned: learningProfile.totalCredentialsEarned,
        requiredCoursesRemaining: learningProfile.requiredCourses.filter(
          (c) => !c.isCompleted
        ).length,
      },
      auctionStats: {
        totalBids: bids.length,
        winningBids,
        winRate: bids.length > 0 ? (winningBids / bids.length) * 100 : 0,
        averageBidAmount: bids.length > 0 ? totalBidAmount / bids.length : 0,
      },
      recentOrders: projects.slice(0, 5).map((p) => ({
        id: p.id,
        title: p.title,
        amount: p.currentAmount,
        status: p.status,
        createdAt: p.createdAt,
      })),
      recentAuctions: bids.slice(0, 5).map((b) => ({
        id: b.id,
        auctionId: b.auctionId,
        price: b.price,
        isWinning: b.status === 'ACCEPTED',
        createdAt: b.createdAt,
      })),
      recentLearning: learningProfile.recentEnrollments.slice(0, 5),
      accountingSummary: {
        totalRevenue,
        pendingPayments,
        completedPayments: totalRevenue,
        taxObligations: 0, // TODO: Calculate from tax engine
      },
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.error('Error fetching vendor dashboard:', error);
    throw createError('Failed to fetch vendor dashboard', 500);
  }
}

