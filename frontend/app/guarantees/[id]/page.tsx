'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { GuaranteeRequest, GuaranteeBid } from '@/lib/api/guarantees';
import { useGuaranteeRequest, usePlaceGuaranteeBid } from '@/lib/queries';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function GuaranteeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const guaranteeId = params?.id as string;

  const { data, isLoading, error } = useGuaranteeRequest(guaranteeId || '');
  const placeBid = usePlaceGuaranteeBid();
  
  const [coveragePercent, setCoveragePercent] = useState('');
  const [feePercent, setFeePercent] = useState('');
  const [layer, setLayer] = useState('SENIOR');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Extract request and bids from response
  const requestData = data?.data || null;
  const request: GuaranteeRequest | null = requestData || null;
  const bids: GuaranteeBid[] = (requestData as any)?.guaranteeBids || (requestData as any)?.bids || [];

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coveragePercent || !feePercent || !guaranteeId) return;

    placeBid.mutate(
      {
        requestId: guaranteeId,
        data: {
          coveragePercent: parseFloat(coveragePercent),
          feePercent: parseFloat(feePercent),
          layer: layer || undefined,
        },
      },
      {
        onSuccess: () => {
          setCoveragePercent('');
          setFeePercent('');
        },
      }
    );
  };

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
          <p className="mt-4 text-gray-600">Loading guarantee request...</p>
        </div>
      </div>
    );
  }

  if (error && !request) {
    const errorMessage = (error as any)?.response?.data?.message || 
                        (error as Error)?.message || 
                        'Guarantee request not found';
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Guarantee Request Not Found</h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <Link
            href="/guarantees"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Back to Guarantees
          </Link>
        </div>
      </div>
    );
  }

  if (!request) return null;

  const canBid = request.status === 'AUCTION_ACTIVE' && isAuthenticated;
  const sortedBids = [...bids].sort((a, b) => (a.effectiveBid || a.feePercent) - (b.effectiveBid || b.feePercent));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/guarantees" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
          ← Back to Guarantees
        </Link>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {getTypeLabel(request.guaranteeType)} Guarantee
              </h1>
              {request.issuer && (
                <p className="text-gray-600 mt-2">
                  Issuer: {request.issuer.companyName || `${request.issuer.firstName} ${request.issuer.lastName}`}
                </p>
              )}
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
              {request.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
        </div>

        {canBid && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Place Guarantee Bid</h2>
            {placeBid.error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {(placeBid.error as any)?.response?.data?.message || (placeBid.error as Error)?.message || 'Failed to place bid'}
              </div>
            )}
            <form onSubmit={handlePlaceBid}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coverage % *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={coveragePercent}
                    onChange={(e) => setCoveragePercent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fee % (Annual) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={feePercent}
                    onChange={(e) => setFeePercent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Layer
                  </label>
                  <select
                    value={layer}
                    onChange={(e) => setLayer(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="FIRST_LOSS">First Loss</option>
                    <option value="MEZZANINE">Mezzanine</option>
                    <option value="SENIOR">Senior</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={placeBid.isPending}
                className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {placeBid.isPending ? 'Placing Bid...' : 'Place Bid'}
              </button>
            </form>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Guarantee Bids ({bids.length})</h2>
          {bids.length === 0 ? (
            <p className="text-gray-500">No bids yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guarantor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coverage %</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee %</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Layer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trust Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedBids.map((bid) => (
                    <tr key={bid.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {bid.guarantor?.companyName || 
                         (bid.guarantor?.firstName && bid.guarantor?.lastName
                          ? `${bid.guarantor.firstName} ${bid.guarantor.lastName}`
                          : bid.guarantor?.email || 'Unknown')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{bid.coveragePercent}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{bid.feePercent}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{bid.layer || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{bid.guarantorTrustScore?.toFixed(1) || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          bid.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                          bid.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          bid.status === 'WITHDRAWN' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {bid.status}
                        </span>
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
