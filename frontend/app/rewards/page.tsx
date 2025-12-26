'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RewardDistribution, TotalRewards } from '@/lib/api/rewards';
import { useUserRewards, useTotalRewards, useClaimReward } from '@/lib/queries';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function RewardsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [filter, setFilter] = useState<string>('all');

  const { data: rewardsData, isLoading: rewardsLoading, error: rewardsError } = useUserRewards(
    undefined,
    filter !== 'all' ? { status: filter } : undefined
  );
  const { data: totalsData, isLoading: totalsLoading } = useTotalRewards();
  const claimReward = useClaimReward();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Extract data from responses
  const rewards: RewardDistribution[] = rewardsData?.data || [];
  const totals: TotalRewards | null = totalsData?.data || null;
  const isLoading = rewardsLoading || totalsLoading;
  const error = rewardsError;

  const handleClaim = (rewardId: string) => {
    claimReward.mutate({ rewardId });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CLAIMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'DISTRIBUTED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rewards</h1>
          <p className="text-gray-600">View and claim your rewards</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {(error as any)?.response?.data?.message || (error as Error)?.message || 'Failed to load rewards'}
          </div>
        )}

        {totals && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-sm text-gray-500 mb-1">Total Claimed</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.totalClaimed)}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-sm text-gray-500 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totals.totalPending)}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-sm text-gray-500 mb-1">Available</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totals.totalAvailable)}</p>
            </div>
          </div>
        )}

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('DISTRIBUTED')}
            className={`px-4 py-2 rounded-md ${
              filter === 'DISTRIBUTED'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Available
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-4 py-2 rounded-md ${
              filter === 'PENDING'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('CLAIMED')}
            className={`px-4 py-2 rounded-md ${
              filter === 'CLAIMED'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Claimed
          </button>
        </div>

        {rewards.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500">No rewards found.</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distribution Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claimable At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rewards.map((reward) => (
                  <tr key={reward.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {reward.rewardType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reward.token?.symbol || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(reward.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reward.distributedAt ? formatDate(reward.distributedAt) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(reward.status)}`}>
                        {reward.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {reward.status === 'DISTRIBUTED' && (
                        <button
                          onClick={() => handleClaim(reward.id)}
                          disabled={claimReward.isPending}
                          className="text-primary-600 hover:text-primary-900 disabled:opacity-50"
                        >
                          {claimReward.isPending ? 'Claiming...' : 'Claim'}
                        </button>
                      )}
                      {reward.status === 'CLAIMED' && reward.claimedAt && (
                        <span className="text-sm text-gray-500">
                          Claimed {formatDate(reward.claimedAt)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

