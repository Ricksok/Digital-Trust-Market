import { useQuery } from '@tanstack/react-query';
import { analyticsApi, DashboardData, ProjectStats, InvestmentStats, RevenueStats, UserStats } from '@/lib/api/analytics';

/**
 * Get dashboard analytics query hook
 */
export const useDashboardAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: async () => {
      const response = await analyticsApi.getDashboard();
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Get project statistics query hook
 */
export const useProjectStats = (params?: { startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['analytics', 'projects', 'stats', params],
    queryFn: async () => {
      const response = await analyticsApi.getProjectStats(params);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get investment statistics query hook
 */
export const useInvestmentStats = (params?: { startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['analytics', 'investments', 'stats', params],
    queryFn: async () => {
      const response = await analyticsApi.getInvestmentStats(params);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get revenue statistics query hook
 */
export const useRevenueStats = (params?: { startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['analytics', 'revenue', 'stats', params],
    queryFn: async () => {
      const response = await analyticsApi.getRevenueStats(params);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get user statistics query hook
 */
export const useUserStats = (params?: { startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['analytics', 'users', 'stats', params],
    queryFn: async () => {
      const response = await analyticsApi.getUserStats(params);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};




