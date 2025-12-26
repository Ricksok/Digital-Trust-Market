'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Investment } from '@/lib/api/investments';
import { useInvestments, useCancelInvestment } from '@/lib/queries';
import { useAuthStore } from '@/lib/stores/auth.store';

interface InvestmentWithProject extends Investment {
  project?: {
    id: string;
    title: string;
    status?: string;
    category?: string;
    targetAmount?: number;
    currentAmount?: number;
  };
}

export default function InvestmentsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { data, isLoading, error } = useInvestments();
  const cancelInvestment = useCancelInvestment();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Extract investments from response
  const investmentsData = data?.data?.investments || data?.data || [];
  const investments: InvestmentWithProject[] = Array.isArray(investmentsData) ? investmentsData : [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      ESCROWED: 'bg-purple-100 text-purple-800',
      RELEASED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading investments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Investments</h1>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Back to Dashboard
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {(error as any)?.response?.data?.message || (error as Error)?.message || 'Failed to load investments'}
            </div>
          )}

          {investments.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">No investments found.</p>
              <Link
                href="/projects"
                className="inline-block px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Browse Projects
              </Link>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {investments.map((investment) => (
                    <tr key={investment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {investment.project?.title || `Project ${investment.projectId.slice(0, 8)}...`}
                        </div>
                        {investment.project && (
                          <div className="text-sm text-gray-500">
                            {investment.project.category}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(investment.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            investment.status
                          )}`}
                        >
                          {investment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(investment.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {investment.transactionHash ? (
                          <a
                            href={`https://etherscan.io/tx/${investment.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-600 hover:text-primary-700 truncate block max-w-xs"
                          >
                            {investment.transactionHash.slice(0, 10)}...
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {investment.project && (
                            <Link
                              href={`/projects/${investment.projectId}`}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              View Project
                            </Link>
                          )}
                          {investment.status === 'PENDING' && (
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to cancel this investment?')) {
                                  cancelInvestment.mutate(investment.id, {
                                    onSuccess: () => {
                                      // Query will automatically refetch
                                    },
                                  });
                                }
                              }}
                              disabled={cancelInvestment.isPending}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              {cancelInvestment.isPending ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Investment Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Total Investments</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    investments.reduce((sum, inv) => sum + inv.amount, 0)
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Active Investments</div>
                <div className="text-2xl font-bold text-green-600">
                  {
                    investments.filter(
                      (inv) =>
                        inv.status === 'APPROVED' ||
                        inv.status === 'ESCROWED' ||
                        inv.status === 'RELEASED'
                    ).length
                  }
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Pending Investments</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {investments.filter((inv) => inv.status === 'PENDING').length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

