'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardData, ProjectStats, InvestmentStats } from '@/lib/api/analytics';
import { useDashboardAnalytics, useProjectStats, useInvestmentStats } from '@/lib/queries';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  const { data: dashboardDataResponse, isLoading: dashboardLoading, error: dashboardError } = useDashboardAnalytics();
  const { data: projectStatsResponse, isLoading: projectStatsLoading } = useProjectStats(
    dateRange.startDate || dateRange.endDate ? dateRange : undefined
  );
  const { data: investmentStatsResponse, isLoading: investmentStatsLoading } = useInvestmentStats(
    dateRange.startDate || dateRange.endDate ? dateRange : undefined
  );

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Extract data from responses
  const dashboardData: DashboardData | null = dashboardDataResponse?.data || null;
  const projectStats: ProjectStats | null = projectStatsResponse?.data || null;
  const investmentStats: InvestmentStats | null = investmentStatsResponse?.data || null;
  const isLoading = dashboardLoading || projectStatsLoading || investmentStatsLoading;
  const error = dashboardError;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const isInvestor = user?.userType === 'INVESTOR' || user?.role?.includes('INVESTOR');
  const isFundraiser = user?.userType === 'FUNDRAISER' || user?.role?.includes('FUNDRAISER') || 
                       user?.role === 'SME_STARTUP' || user?.role === 'SOCIAL_ENTERPRISE' || 
                       user?.role === 'REAL_ESTATE_PROJECT';
  const isAdmin = user?.role === 'ADMIN';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Back to Dashboard
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {(error as any)?.response?.data?.message || (error as Error)?.message || 'Failed to load analytics'}
            </div>
          )}

          {/* Date Range Filter */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Date Range Filter</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            {(dateRange.startDate || dateRange.endDate) && (
              <button
                onClick={() => setDateRange({ startDate: '', endDate: '' })}
                className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Dashboard Overview */}
          {dashboardData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {isInvestor && (
                <>
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Investments</h3>
                    <p className="text-3xl font-bold text-gray-900">
                      {dashboardData.totalInvestments || 0}
                    </p>
                  </div>
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Invested</h3>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(dashboardData.totalAmount || 0)}
                    </p>
                  </div>
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Active Projects</h3>
                    <p className="text-3xl font-bold text-gray-900">
                      {dashboardData.activeProjects || 0}
                    </p>
                  </div>
                </>
              )}

              {isFundraiser && (
                <>
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Projects</h3>
                    <p className="text-3xl font-bold text-gray-900">
                      {dashboardData.totalProjects || 0}
                    </p>
                  </div>
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Raised</h3>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(dashboardData.totalRaised || 0)}
                    </p>
                  </div>
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Active Projects</h3>
                    <p className="text-3xl font-bold text-gray-900">
                      {dashboardData.activeProjects || 0}
                    </p>
                  </div>
                </>
              )}

              {isAdmin && (
                <>
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Users</h3>
                    <p className="text-3xl font-bold text-gray-900">
                      {dashboardData.totalUsers || 0}
                    </p>
                  </div>
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Projects</h3>
                    <p className="text-3xl font-bold text-gray-900">
                      {dashboardData.totalProjects || 0}
                    </p>
                  </div>
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Investments</h3>
                    <p className="text-3xl font-bold text-gray-900">
                      {dashboardData.totalInvestments || 0}
                    </p>
                  </div>
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(dashboardData.totalRevenue || 0)}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Project Statistics */}
          {projectStats && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3">By Status</h3>
                  <div className="space-y-2">
                    {projectStats.byStatus.map((stat) => (
                      <div key={stat.status} className="flex justify-between items-center">
                        <span className="text-gray-600">{stat.status.replace('_', ' ')}</span>
                        <span className="font-semibold text-gray-900">{stat._count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-3">By Category</h3>
                  <div className="space-y-2">
                    {projectStats.byCategory.map((stat) => (
                      <div key={stat.category} className="flex justify-between items-center">
                        <span className="text-gray-600">{stat.category.replace('_', ' ')}</span>
                        <span className="font-semibold text-gray-900">{stat._count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Total Projects: <span className="font-semibold text-gray-900">{projectStats.total}</span>
                </p>
              </div>
            </div>
          )}

          {/* Investment Statistics */}
          {investmentStats && isInvestor && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Investment Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Total Investments</h3>
                  <p className="text-3xl font-bold text-gray-900">{investmentStats.total}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Total Amount</h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(investmentStats.totalAmount)}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-700 mb-3">By Status</h3>
                <div className="space-y-2">
                  {investmentStats.byStatus.map((stat) => (
                    <div key={stat.status} className="flex justify-between items-center">
                      <span className="text-gray-600">{stat.status}</span>
                      <span className="font-semibold text-gray-900">{stat._count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Items */}
          {dashboardData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isInvestor && dashboardData.recentInvestments && dashboardData.recentInvestments.length > 0 && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Investments</h2>
                  <div className="space-y-3">
                    {dashboardData.recentInvestments.map((investment: any) => (
                      <div key={investment.id} className="border-b pb-3 last:border-b-0">
                        <p className="font-medium text-gray-900">
                          {investment.project?.title || 'Unknown Project'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(investment.amount)} • {investment.status}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isFundraiser && dashboardData.recentProjects && dashboardData.recentProjects.length > 0 && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Projects</h2>
                  <div className="space-y-3">
                    {dashboardData.recentProjects.map((project: any) => (
                      <div key={project.id} className="border-b pb-3 last:border-b-0">
                        <p className="font-medium text-gray-900">{project.title}</p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(project.currentAmount || 0)} / {formatCurrency(project.targetAmount || 0)} • {project.status}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {project._count?.investments || 0} investments
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!dashboardData && !isLoading && (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <p className="text-gray-600">No analytics data available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

