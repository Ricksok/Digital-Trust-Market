'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { StakingPool, Stake } from '@/lib/api/staking';
import { useStakingPools, useUserStakes } from '@/lib/queries';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function StakingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'pools' | 'stakes'>('pools');

  const { data: poolsData, isLoading: poolsLoading, error: poolsError } = useStakingPools({ isActive: true });
  const { data: stakesData, isLoading: stakesLoading, error: stakesError } = useUserStakes();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Extract data from responses
  const pools: StakingPool[] = poolsData?.data || [];
  const stakes: Stake[] = stakesData?.data || [];
  const isLoading = poolsLoading || stakesLoading;
  const error = poolsError || stakesError;

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
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'UNSTAKING':
        return 'bg-yellow-100 text-yellow-800';
      case 'UNSTAKED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading staking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Staking</h1>
          <p className="text-gray-600">Stake your tokens to earn rewards</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {(error as any)?.response?.data?.message || (error as Error)?.message || 'Failed to load staking data'}
          </div>
        )}

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('pools')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pools'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Staking Pools
              </button>
              <button
                onClick={() => setActiveTab('stakes')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'stakes'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Stakes ({stakes.length})
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'pools' ? (
          <div>
            {pools.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <p className="text-gray-500">No active staking pools available.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pools.map((pool) => (
                  <div key={pool.id} className="bg-white shadow rounded-lg p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">{pool.name}</h3>
                      {pool.description && (
                        <p className="text-sm text-gray-600 mt-1">{pool.description}</p>
                      )}
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">APY</span>
                        <span className="text-lg font-semibold text-green-600">{pool.apy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Token</span>
                        <span className="text-sm font-medium">{pool.token?.symbol || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Min Stake</span>
                        <span className="text-sm font-medium">{formatCurrency(pool.minStakeAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Lock Period</span>
                        <span className="text-sm font-medium">{pool.lockPeriodDays} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Total Staked</span>
                        <span className="text-sm font-medium">{formatCurrency(pool.totalStaked)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Stakers</span>
                        <span className="text-sm font-medium">{pool.totalStakers}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        // TODO: Create /staking/pools/[id] page or implement staking modal
                        alert(`Staking in "${pool.name}" coming soon!`);
                      }}
                      className="block w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 text-center"
                    >
                      Stake Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {stakes.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <p className="text-gray-500">You don't have any active stakes.</p>
                <Link
                  href="/staking"
                  className="mt-4 inline-block text-primary-600 hover:text-primary-700"
                  onClick={() => setActiveTab('pools')}
                >
                  Browse staking pools
                </Link>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pool
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rewards
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unlock Date
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
                    {stakes.map((stake) => (
                      <tr key={stake.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {stake.pool?.name || 'Unknown Pool'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {stake.pool?.token?.symbol || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(stake.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          {formatCurrency(stake.totalRewardsEarned || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {stake.lockedUntil ? formatDate(stake.lockedUntil) : 'Flexible'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(stake.status)}`}>
                            {stake.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {stake.status === 'UNLOCKED' && (
                            <button
                              onClick={() => {
                                // TODO: Create /staking/unstake/[id] page or implement unstaking modal
                                alert(`Unstaking feature coming soon!`);
                              }}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              Unstake
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

