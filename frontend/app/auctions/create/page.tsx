'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { auctionsApi, Auction } from '@/lib/api/auctions';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useUIStore } from '@/lib/stores/ui.store';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AuctionFormData {
  auctionType: string;
  projectId?: string;
  title: string;
  description?: string;
  reservePrice?: number;
  targetAmount?: number;
  currency: string;
  startTime: string;
  endTime: string;
  minTrustScore?: number;
  trustWeight?: number;
}

const AUCTION_TYPES = [
  { value: 'CAPITAL', label: 'Capital Auction' },
  { value: 'GUARANTEE', label: 'Guarantee Auction' },
  { value: 'SUPPLY_CONTRACT', label: 'Supply Contract' },
  { value: 'TRADE_SERVICE', label: 'Trade Service' },
];

export default function CreateAuctionPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { showNotification } = useUIStore();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AuctionFormData>({
    defaultValues: {
      auctionType: 'CAPITAL',
      currency: 'KES',
      trustWeight: 1.0,
    },
  });

  const auctionType = watch('auctionType');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: AuctionFormData) => {
    try {
      setError(null);
      setIsSubmitting(true);

      const auctionData: Partial<Auction> = {
        auctionType: data.auctionType,
        projectId: data.projectId || undefined,
        title: data.title,
        description: data.description || undefined,
        reservePrice: data.reservePrice,
        targetAmount: data.targetAmount,
        currency: data.currency,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
        minTrustScore: data.minTrustScore,
        trustWeight: data.trustWeight || 1.0,
      };

      const response = await auctionsApi.create(auctionData);
      
      showNotification({
        type: 'success',
        message: 'Auction created successfully',
      });
      
      router.push(`/auctions/${response.data?.id || response.id}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to create auction';
      setError(errorMessage);
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  // Set default dates (starts in 1 hour, ends in 7 days)
  const startTime = new Date();
  startTime.setHours(startTime.getHours() + 1);
  const endTime = new Date();
  endTime.setDate(endTime.getDate() + 7);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/auctions" className="text-primary-600 hover:text-primary-700">
            ← Back to Auctions
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Auction</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="auctionType" className="block text-sm font-medium text-gray-700 mb-2">
                  Auction Type *
                </label>
                <select
                  id="auctionType"
                  {...register('auctionType', { required: 'Auction type is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {AUCTION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.auctionType && (
                  <p className="mt-1 text-sm text-red-600">{errors.auctionType.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  {...register('description')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {(auctionType === 'CAPITAL' || auctionType === 'GUARANTEE') && (
                <div>
                  <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-2">
                    Project ID (Optional)
                  </label>
                  <input
                    type="text"
                    id="projectId"
                    {...register('projectId')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter project ID if applicable"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reservePrice" className="block text-sm font-medium text-gray-700 mb-2">
                    Reserve Price (Optional)
                  </label>
                  <input
                    type="number"
                    id="reservePrice"
                    step="0.01"
                    min="0"
                    {...register('reservePrice', {
                      min: { value: 0, message: 'Reserve price must be positive' },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {errors.reservePrice && (
                    <p className="mt-1 text-sm text-red-600">{errors.reservePrice.message}</p>
                  )}
                </div>

                {auctionType === 'CAPITAL' && (
                  <div>
                    <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-2">
                      Target Amount (Optional)
                    </label>
                    <input
                      type="number"
                      id="targetAmount"
                      step="0.01"
                      min="0"
                      {...register('targetAmount', {
                        min: { value: 0, message: 'Target amount must be positive' },
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {errors.targetAmount && (
                      <p className="mt-1 text-sm text-red-600">{errors.targetAmount.message}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="startTime"
                    {...register('startTime', { required: 'Start time is required' })}
                    defaultValue={startTime.toISOString().slice(0, 16)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {errors.startTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="endTime"
                    {...register('endTime', { required: 'End time is required' })}
                    defaultValue={endTime.toISOString().slice(0, 16)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {errors.endTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="minTrustScore" className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Trust Score (Optional)
                  </label>
                  <input
                    type="number"
                    id="minTrustScore"
                    step="0.1"
                    min="0"
                    max="100"
                    {...register('minTrustScore', {
                      min: { value: 0, message: 'Trust score must be at least 0' },
                      max: { value: 100, message: 'Trust score cannot exceed 100' },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {errors.minTrustScore && (
                    <p className="mt-1 text-sm text-red-600">{errors.minTrustScore.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="trustWeight" className="block text-sm font-medium text-gray-700 mb-2">
                    Trust Weight (Optional)
                  </label>
                  <input
                    type="number"
                    id="trustWeight"
                    step="0.1"
                    min="0"
                    {...register('trustWeight', {
                      min: { value: 0, message: 'Trust weight must be positive' },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {errors.trustWeight && (
                    <p className="mt-1 text-sm text-red-600">{errors.trustWeight.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  fullWidth
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" />
                      Creating Auction...
                    </span>
                  ) : (
                    'Create Auction'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
                  fullWidth
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

