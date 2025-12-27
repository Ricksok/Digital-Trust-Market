'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Auction, Bid } from '@/lib/api/auctions';
import { useAuction, usePlaceBid, useCancelAuction, useExtendAuction, useCloseAuction } from '@/lib/queries';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function AuctionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const auctionId = params?.id as string;

  const { data, isLoading, error } = useAuction(auctionId || '');
  const placeBid = usePlaceBid();
  const cancelAuction = useCancelAuction();
  const extendAuction = useExtendAuction();
  const closeAuction = useCloseAuction();
  
  const [bidPrice, setBidPrice] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [newEndTime, setNewEndTime] = useState('');

  useEffect(() => {
    if (!auctionId) return;
    
    // Don't try to fetch if the ID is "create" (it's a route, not an auction ID)
    if (auctionId === 'create') {
      router.push('/auctions');
      return;
    }
  }, [auctionId, router]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Extract auction and bids from response
  const auctionData = data?.data || null;
  const auction: Auction | null = auctionData || null;
  const bids: Bid[] = (auctionData as any)?.bids || [];

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidPrice) {
      return;
    }

    const price = parseFloat(bidPrice);
    if (isNaN(price) || price <= 0) {
      return;
    }

    if (!auctionId) return;

    placeBid.mutate(
      {
        auctionId,
        data: {
          price,
          amount: bidAmount ? parseFloat(bidAmount) : undefined,
        },
      },
      {
        onSuccess: () => {
          setBidPrice('');
          setBidAmount('');
        },
      }
    );
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading auction...</p>
        </div>
      </div>
    );
  }

  if (error && !auction) {
    const errorMessage = (error as any)?.response?.data?.message || 
                        (error as Error)?.message || 
                        'Auction not found';
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Auction Not Found</h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
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

  if (!auction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading auction...</p>
        </div>
      </div>
    );
  }

  const sortedBids = [...bids].sort((a: any, b: any) => (a.effectiveBid || a.price) - (b.effectiveBid || b.price));
  const canBid = auction.status === 'ACTIVE' && isAuthenticated && (user?.userType === 'INVESTOR' || user?.role === 'ADMIN');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/auctions" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
          ← Back to Auctions
        </Link>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{auction.title}</h1>
              {auction.description && (
                <p className="text-gray-600 mt-2">{auction.description}</p>
              )}
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(auction.status)}`}>
              {auction.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

          <div className="text-sm text-gray-500">
            <p>Starts: {formatDate(auction.startTime)}</p>
            <p>Ends: {formatDate(auction.endTime)}</p>
          </div>

          {/* Admin/Auction Owner Actions */}
          {(user?.role === 'ADMIN' || user?.userType === 'FUNDRAISER') && (
            <div className="flex gap-2 mt-4">
              {auction.status === 'ACTIVE' && (
                <>
                  <button
                    onClick={() => closeAuction.mutate(auctionId)}
                    disabled={closeAuction.isPending}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                  >
                    {closeAuction.isPending ? 'Closing...' : 'Close Auction'}
                  </button>
                  <button
                    onClick={() => setShowExtendModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Extend Auction
                  </button>
                </>
              )}
              {(auction.status === 'PENDING' || auction.status === 'ACTIVE') && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to cancel this auction?')) {
                      cancelAuction.mutate(auctionId);
                    }
                  }}
                  disabled={cancelAuction.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {cancelAuction.isPending ? 'Cancelling...' : 'Cancel Auction'}
                </button>
              )}
            </div>
          )}

          {/* Extend Auction Modal */}
          {showExtendModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Extend Auction</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (newEndTime) {
                        extendAuction.mutate(
                          { id: auctionId, newEndTime: new Date(newEndTime).toISOString() },
                          {
                            onSuccess: () => {
                              setShowExtendModal(false);
                              setNewEndTime('');
                            },
                          }
                        );
                      }
                    }}
                    disabled={!newEndTime || extendAuction.isPending}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    {extendAuction.isPending ? 'Extending...' : 'Extend'}
                  </button>
                  <button
                    onClick={() => {
                      setShowExtendModal(false);
                      setNewEndTime('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {canBid && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Place Bid</h2>
            {placeBid.error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {(placeBid.error as any)?.response?.data?.error?.message || 
                 (placeBid.error as any)?.response?.data?.message || 
                 (placeBid.error as Error)?.message || 
                 'Failed to place bid'}
                {/* Check if it's a learning gate error */}
                {(placeBid.error as any)?.response?.data?.error?.unlockingCourse && (
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <p className="text-sm font-medium mb-2">Required Learning:</p>
                    <Link
                      href={`/learning/courses/${(placeBid.error as any).response.data.error.unlockingCourse.id}`}
                      className="text-sm text-primary-600 hover:text-primary-700 underline"
                    >
                      Complete: {(placeBid.error as any).response.data.error.unlockingCourse.title}
                    </Link>
                  </div>
                )}
              </div>
            )}
            <form onSubmit={handlePlaceBid} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bid Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={bidPrice}
                    onChange={(e) => setBidPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                    placeholder="Enter bid price"
                  />
                </div>
                {auction.targetAmount && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (Optional)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter amount"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={placeBid.isPending || !bidPrice}
                  className="flex-1 bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {placeBid.isPending ? 'Placing Bid...' : 'Place Bid'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBidPrice('');
                    setBidAmount('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Bids ({bids.length})</h2>
          {bids.length === 0 ? (
            <p className="text-gray-500">No bids yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bidder</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trust Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Effective Bid</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedBids.map((bid) => (
                    <tr key={bid.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {bid.bidder?.firstName && bid.bidder?.lastName
                          ? `${bid.bidder.firstName} ${bid.bidder.lastName}`
                          : bid.bidder?.email || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatCurrency(bid.price)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{bid.amount ? formatCurrency(bid.amount) : 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{bid.bidderTrustScore?.toFixed(1) || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{bid.effectiveBid ? formatCurrency(bid.effectiveBid) : 'N/A'}</td>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(bid.submittedAt)}
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

