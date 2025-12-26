'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GuaranteeRequest } from '@/lib/api/guarantees';
import { useGuaranteeRequests } from '@/lib/queries';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function GuaranteesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { data, isLoading, error } = useGuaranteeRequests();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Extract requests from response
  const requestsData = data?.data?.requests || data?.data || [];
  const requests: GuaranteeRequest[] = Array.isArray(requestsData) ? requestsData : [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ALLOCATED':
        return 'bg-green-100 text-green-800';
      case 'AUCTION_ACTIVE':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'CREDIT_RISK':
        return 'Credit Risk';
      case 'PERFORMANCE_RISK':
        return 'Performance Risk';
      case 'CONTRACT_ASSURANCE':
        return 'Contract Assurance';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading guarantee requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Guarantee Marketplace</h1>
            <p className="mt-2 text-gray-600">Browse and bid on guarantee requests</p>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => {
                // TODO: Create /guarantees/request page or implement modal
                alert('Guarantee request feature coming soon!');
              }}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
            >
              Request Guarantee
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {(error as any)?.response?.data?.message || (error as Error)?.message || 'Failed to load guarantee requests'}
          </div>
        )}

        {requests.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500">No guarantee requests found.</p>
            {isAuthenticated && (
              <button
                onClick={() => {
                  // TODO: Create /guarantees/request page or implement modal
                  alert('Guarantee request feature coming soon!');
                }}
                className="mt-4 inline-block bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
              >
                Create Guarantee Request
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {requests.map((request) => (
              <div key={request.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {getTypeLabel(request.guaranteeType)} Guarantee
                    </h2>
                    {request.issuer && (
                      <p className="text-sm text-gray-500 mt-1">
                        Issuer: {request.issuer.companyName || `${request.issuer.firstName} ${request.issuer.lastName}`}
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="text-lg font-semibold">{formatCurrency(request.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Requested Coverage</p>
                    <p className="text-lg font-semibold">{request.requestedCoverage}%</p>
                  </div>
                  {request.allocatedCoverage && (
                    <div>
                      <p className="text-sm text-gray-500">Allocated Coverage</p>
                      <p className="text-lg font-semibold text-green-600">{request.allocatedCoverage}%</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Currency</p>
                    <p className="text-lg font-semibold">{request.currency}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/guarantees/${request.id}`}
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 text-center"
                  >
                    View Details
                  </Link>
                  {request.status === 'AUCTION_ACTIVE' && (
                    <Link
                      href={`/guarantees/${request.id}`}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-center"
                    >
                      Place Bid
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


