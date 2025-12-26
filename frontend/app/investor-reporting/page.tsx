'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  useInvestorReports,
  useGeneratePortfolioReport,
  useGenerateImpactReport,
  useGenerateFinancialReport,
  usePublishInvestorReport,
} from '@/lib/queries';
import { useAuthStore } from '@/lib/stores/auth.store';
import { InvestorReport } from '@/lib/api/investor-reporting';

export default function InvestorReportingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { data, isLoading, error } = useInvestorReports();
  const generatePortfolio = useGeneratePortfolioReport();
  const generateImpact = useGenerateImpactReport();
  const generateFinancial = useGenerateFinancialReport();
  const publishReport = usePublishInvestorReport();

  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);

  // Redirect if not authenticated or not investor
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (user?.userType !== 'INVESTOR' && !user?.role?.includes('INVESTOR')) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const reports: InvestorReport[] = data?.data || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'GENERATED':
        return 'bg-blue-100 text-blue-800';
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'PORTFOLIO':
        return 'Portfolio Report';
      case 'IMPACT':
        return 'Impact Report';
      case 'FINANCIAL':
        return 'Financial Report';
      case 'QUARTERLY':
        return 'Quarterly Report';
      case 'ANNUAL':
        return 'Annual Report';
      default:
        return type;
    }
  };

  const handleGenerateReport = (reportType: string) => {
    if (!selectedPeriod) {
      alert('Please select a period');
      return;
    }

    const mutations = {
      PORTFOLIO: generatePortfolio,
      IMPACT: generateImpact,
      FINANCIAL: generateFinancial,
    };

    const mutation = mutations[reportType as keyof typeof mutations];
    if (mutation) {
      mutation.mutate({ period: selectedPeriod });
      setSelectedReportType(null);
    }
  };

  const handlePublish = (reportId: string) => {
    if (confirm('Are you sure you want to publish this report?')) {
      publishReport.mutate(reportId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Investor Reporting</h1>
          <p className="mt-2 text-gray-600">Generate and manage your investment reports</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {(error as any)?.response?.data?.error?.message || (error as Error)?.message || 'Failed to load reports'}
          </div>
        )}

        {/* Generate Report Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate New Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Period (YYYY-MM or YYYY-Q1)
              </label>
              <input
                type="text"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                placeholder="2024-Q1 or 2024-03"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                value={selectedReportType || ''}
                onChange={(e) => setSelectedReportType(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select report type</option>
                <option value="PORTFOLIO">Portfolio Report</option>
                <option value="IMPACT">Impact Report</option>
                <option value="FINANCIAL">Financial Report</option>
              </select>
            </div>
          </div>
          {selectedReportType && selectedPeriod && (
            <div className="mt-4">
              <button
                onClick={() => handleGenerateReport(selectedReportType)}
                disabled={
                  generatePortfolio.isPending ||
                  generateImpact.isPending ||
                  generateFinancial.isPending
                }
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                Generate {getReportTypeLabel(selectedReportType)}
              </button>
            </div>
          )}
        </div>

        {/* Reports List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Reports</h2>
          </div>
          {reports.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No reports generated yet. Generate a report above to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Report Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Portfolio Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Yield
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Generated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getReportTypeLabel(report.reportType)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.period}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(report.portfolioValue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.yield ? `${report.yield.toFixed(2)}%` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(report.generatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Link
                            href={`/investor-reporting/${report.id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            View
                          </Link>
                          {report.status === 'GENERATED' && (
                            <button
                              onClick={() => handlePublish(report.id)}
                              disabled={publishReport.isPending}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            >
                              Publish
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
        </div>
      </div>
    </div>
  );
}



