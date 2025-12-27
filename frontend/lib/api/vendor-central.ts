/**
 * Vendor Central API Client
 * Feature: Vendor Central Dashboard
 */

import apiClient from './client';

export interface VendorDashboard {
  totalSales: number;
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  fulfillmentRate: number;
  onTimeDeliveryRate: number;
  disputeRate: number;
  averageOrderValue: number;
  trustBand: string | null;
  trustBandTrend: 'up' | 'down' | 'stable';
  learningProgress: {
    coursesCompleted: number;
    credentialsEarned: number;
    requiredCoursesRemaining: number;
  };
  auctionStats: {
    totalBids: number;
    winningBids: number;
    winRate: number;
    averageBidAmount: number;
  };
  recentOrders: Array<{
    id: string;
    title: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  recentAuctions: Array<{
    id: string;
    auctionId: string;
    price: number;
    isWinning: boolean;
    createdAt: string;
  }>;
  recentLearning: any[];
  accountingSummary: {
    totalRevenue: number;
    pendingPayments: number;
    completedPayments: number;
    taxObligations: number;
  };
}

export interface VendorCentralResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export const vendorCentralApi = {
  /**
   * Get vendor dashboard
   */
  getDashboard: async (): Promise<VendorCentralResponse<VendorDashboard>> => {
    const response = await apiClient.get('/api/vendor-central/dashboard');
    return response.data;
  },
};

