'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserBids, useUpdateBid, useWithdrawBid } from '@/lib/queries';
import { useAuthStore } from '@/lib/stores/auth.store';
import { UserBid } from '@/lib/api/bids';

export default function MyBidsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [auctionTypeFilter, setAuctionTypeFilter] = useState<string>('');

  const { data, isLoading, error } = useUserBids({
    status: statusFilter || undefined,
    auctionType: auctionTypeFilter || undefined,
  });

  const updateBid = useUpdateBid();
  const withdrawBid = useWithdrawBid();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Extract bids from response
  const bids: UserBid[] = data?.data || [];

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'WITHDRAWN':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleWithdrawBid = (bidId: string) => {
    if (confirm('Are you sure you want to withdraw this bid?')) {
      withdrawBid.mutate(bidId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bids...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{(error as any)?.response?.data?.error?.message || 'Failed to load bids'}</p>
          <Link
            href="/auctions"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Back to Auctions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Bids</h1>
          <Link
            href="/auctions"
            className="text-primary-600 hover:text-primary-700"
          >
            View All Auctions →
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auction Type
              </label>
              <select
                value={auctionTypeFilter}
                onChange={(e) => setAuctionTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Types</option>
                <option value="CAPITAL">Capital</option>
                <option value="GUARANTEE">Guarantee</option>
                <option value="SUPPLY_CONTRACT">Supply Contract</option>
                <option value="TRADE_SERVICE">Trade Service</option>
              </select>
            </div>
          </div>
        </div>

        {bids.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-4">No bids found.</p>
            <Link
              href="/auctions"
              className="inline-block bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
            >
              Browse Auctions
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Auction</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trust Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Effective Bid</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bids.map((bid) => (
                    <tr key={bid.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <Link
                            href={`/auctions/${bid.auctionId}`}
                            className="font-medium text-primary-600 hover:text-primary-900"
                          >
                            {bid.auction?.title || 'Auction'}
                          </Link>
                          <p className="text-xs text-gray-500">{bid.auction?.auctionType || ''}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatCurrency(bid.price)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{bid.amount ? formatCurrency(bid.amount) : 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{bid.bidderTrustScore?.toFixed(1) || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{bid.effectiveBid ? formatCurrency(bid.effectiveBid) : 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(bid.status)}`}>
                          {bid.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(bid.submittedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {bid.status === 'PENDING' && (
                          <button
                            onClick={() => handleWithdrawBid(bid.id)}
                            disabled={withdrawBid.isPending}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            {withdrawBid.isPending ? 'Withdrawing...' : 'Withdraw'}
                          </button>
                        )}
                        <Link
                          href={`/auctions/${bid.auctionId}`}
                          className="ml-2 text-primary-600 hover:text-primary-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

