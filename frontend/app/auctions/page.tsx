'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Auction } from '@/lib/api/auctions';
import { useAuctions } from '@/lib/queries';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function AuctionsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { data, isLoading, error } = useAuctions();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Extract auctions from response
  const auctionsData = data?.data?.auctions || data?.data || [];
  const auctions: Auction[] = Array.isArray(auctionsData) ? auctionsData : [];

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
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAuctionTypeLabel = (type: string) => {
    switch (type) {
      case 'CAPITAL':
        return 'Capital Auction';
      case 'GUARANTEE':
        return 'Guarantee Auction';
      case 'SUPPLY_CONTRACT':
        return 'Supply Contract';
      case 'TRADE_SERVICE':
        return 'Trade Service';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading auctions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Auctions</h1>
          <p className="mt-2 text-gray-600">Browse and participate in reverse auctions</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-semibold">Error loading auctions</p>
            <p className="text-sm">{(error as any)?.response?.data?.message || (error as Error)?.message || 'Failed to load auctions'}</p>
            <button
              onClick={() => {
                window.location.reload();
              }}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {auctions.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500">No auctions found.</p>
            {user?.role === 'ADMIN' || user?.userType === 'FUNDRAISER' ? (
              <button
                onClick={() => {
                  // TODO: Create /auctions/create page or implement modal
                  alert('Create auction feature coming soon!');
                }}
                className="mt-4 inline-block bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
              >
                Create Auction
              </button>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {auctions.map((auction) => (
              <div key={auction.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{auction.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">{getAuctionTypeLabel(auction.auctionType)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(auction.status)}`}>
                    {auction.status}
                  </span>
                </div>

                {auction.description && (
                  <p className="text-gray-600 mb-4">{auction.description}</p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {auction.targetAmount && (
                    <div>
                      <p className="text-sm text-gray-500">Target Amount</p>
                      <p className="text-lg font-semibold">{formatCurrency(auction.targetAmount)}</p>
                    </div>
                  )}
                  {auction.reservePrice && (
                    <div>
                      <p className="text-sm text-gray-500">Reserve Price</p>
                      <p className="text-lg font-semibold">{formatCurrency(auction.reservePrice)}</p>
                    </div>
                  )}
                  {auction.clearedPrice && (
                    <div>
                      <p className="text-sm text-gray-500">Cleared Price</p>
                      <p className="text-lg font-semibold text-green-600">{formatCurrency(auction.clearedPrice)}</p>
                    </div>
                  )}
                  {auction.minTrustScore && (
                    <div>
                      <p className="text-sm text-gray-500">Min Trust Score</p>
                      <p className="text-lg font-semibold">{auction.minTrustScore}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <div>
                    <p>Starts: {formatDate(auction.startTime)}</p>
                    <p>Ends: {formatDate(auction.endTime)}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/auctions/${auction.id}`}
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 text-center"
                  >
                    View Details
                  </Link>
                  {auction.status === 'ACTIVE' && (
                    <Link
                      href={`/auctions/${auction.id}`}
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

