import apiClient from './client';

export interface DashboardData {
  totalInvestments?: number;
  totalAmount?: number;
  activeProjects?: number;
  recentInvestments?: any[];
  totalProjects?: number;
  totalRaised?: number;
  recentProjects?: any[];
  totalUsers?: number;
  totalRevenue?: number;
}

export interface ProjectStats {
  total: number;
  byStatus: Array<{ status: string; _count: number }>;
  byCategory: Array<{ category: string; _count: number }>;
}

export interface InvestmentStats {
  total: number;
  totalAmount: number;
  byStatus: Array<{ status: string; _count: number }>;
}

export interface RevenueStats {
  totalRevenue: number;
  totalTransactions: number;
  byMonth: any[];
}

export interface UserStats {
  total: number;
  byRole: Array<{ role: string; _count: number }>;
  byType: Array<{ userType: string; _count: number }>;
  verified: number;
  unverified: number;
}

export const analyticsApi = {
  getDashboard: async () => {
    const response = await apiClient.get('/api/analytics/dashboard');
    return response.data;
  },

  getProjectStats: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await apiClient.get('/api/analytics/projects/stats', { params });
    return response.data;
  },

  getInvestmentStats: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await apiClient.get('/api/analytics/investments/stats', { params });
    return response.data;
  },

  getRevenueStats: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await apiClient.get('/api/analytics/revenue', { params });
    return response.data;
  },

  getUserStats: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await apiClient.get('/api/analytics/users/stats', { params });
    return response.data;
  },
};

