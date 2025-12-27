'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { stakingApi, StakingPool } from '@/lib/api/staking';
import { useStakingPool } from '@/lib/queries';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useUIStore } from '@/lib/stores/ui.store';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Badge from '@/components/ui/Badge';

export default function StakingPoolPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const { showNotification } = useUIStore();
  const poolId = params?.id as string;

  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [stakeError, setStakeError] = useState<string | null>(null);

  const { data: poolData, isLoading, error: poolError } = useStakingPool(poolId || '');
  const pool: StakingPool | null = poolData?.data || null;
  const error = poolError ? (poolError as any)?.response?.data?.error?.message || 'Failed to load pool' : null;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
  }, [isAuthenticated, router]);

  const handleStake = async () => {
    if (!stakeAmount || !poolId) return;

    // Clear any previous errors
    setStakeError(null);

    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0) {
      const errorMsg = 'Please enter a valid amount';
      setStakeError(errorMsg);
      showNotification({
        type: 'error',
        message: errorMsg,
      });
      return;
    }

    if (pool && amount < pool.minStakeAmount) {
      const errorMsg = `Minimum stake amount is ${pool.minStakeAmount}`;
      setStakeError(errorMsg);
      showNotification({
        type: 'error',
        message: errorMsg,
      });
      return;
    }

    try {
      setIsStaking(true);
      setStakeError(null);
      await stakingApi.stake(poolId, amount);
      
      showNotification({
        type: 'success',
        message: 'Successfully staked tokens',
      });
      
      router.push('/staking');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to stake tokens';
      setStakeError(errorMessage);
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setIsStaking(false);
    }
  };

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !pool) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error || 'Pool not found'}
          </div>
          <Link href="/staking" className="mt-4 inline-block text-primary-600 hover:text-primary-700">
            ← Back to Staking
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/staking" className="text-primary-600 hover:text-primary-700">
            ← Back to Staking
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{pool.name}</CardTitle>
                {pool.description && (
                  <p className="text-gray-600 mt-2">{pool.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">APY</p>
                      <p className="text-2xl font-bold text-green-600">{pool.apy}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Staked</p>
                      <p className="text-2xl font-bold">{pool.totalStaked.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Stakers</p>
                      <p className="text-2xl font-bold">{pool.totalStakers}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Lock Period</p>
                      <p className="text-2xl font-bold">
                        {pool.lockPeriodDays ? `${pool.lockPeriodDays} days` : 'Flexible'}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Token</span>
                        <span className="font-medium">{pool.token?.symbol || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Minimum Stake</span>
                        <span className="font-medium">{pool.minStakeAmount.toLocaleString()}</span>
                      </div>
                      {pool.maxStakeAmount && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Maximum Stake</span>
                          <span className="font-medium">{pool.maxStakeAmount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status</span>
                        <Badge variant={pool.isActive ? 'success' : 'outline'}>
                          {pool.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Stake Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                      Amount
                    </label>
                    <input
                      type="number"
                      id="amount"
                      value={stakeAmount}
                      onChange={(e) => {
                        setStakeAmount(e.target.value);
                        // Clear error when user starts typing
                        if (stakeError) {
                          setStakeError(null);
                        }
                      }}
                      min={pool.minStakeAmount}
                      max={pool.maxStakeAmount}
                      step="0.01"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        stakeError
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-primary-500'
                      }`}
                      placeholder={`Min: ${pool.minStakeAmount}`}
                    />
                  </div>

                  {/* Error Message Display */}
                  {stakeError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                      <div className="flex items-start">
                        <svg
                          className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{stakeError}</p>
                          {stakeError.includes('trust score') && (
                            <p className="text-xs mt-1 text-red-600">
                              You can improve your trust score by completing courses, making successful transactions, and maintaining a good reputation on the platform.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleStake}
                    variant="primary"
                    disabled={!stakeAmount || isStaking || !pool.isActive}
                    fullWidth
                  >
                    {isStaking ? (
                      <span className="flex items-center justify-center gap-2">
                        <LoadingSpinner size="sm" />
                        Staking...
                      </span>
                    ) : (
                      'Stake Now'
                    )}
                  </Button>

                  {!pool.isActive && (
                    <p className="text-sm text-red-600">This pool is not active</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

