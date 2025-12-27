'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useCreateGuaranteeRequest } from '@/lib/queries';
import { useAuthStore } from '@/lib/stores/auth.store';
import { GuaranteeRequest } from '@/lib/api/guarantees';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface GuaranteeRequestFormData {
  projectId?: string;
  guaranteeType: string;
  requestedCoverage: number;
  amount: number;
  currency: string;
  expiresAt?: string;
}

const GUARANTEE_TYPES = [
  { value: 'CREDIT_RISK', label: 'Credit Risk' },
  { value: 'PERFORMANCE_RISK', label: 'Performance Risk' },
  { value: 'CONTRACT_ASSURANCE', label: 'Contract Assurance' },
];

export default function RequestGuaranteePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const createRequest = useCreateGuaranteeRequest();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuaranteeRequestFormData>({
    defaultValues: {
      guaranteeType: 'CREDIT_RISK',
      currency: 'KES',
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: GuaranteeRequestFormData) => {
    try {
      setError(null);

      const requestData: Partial<GuaranteeRequest> = {
        guaranteeType: data.guaranteeType,
        requestedCoverage: data.requestedCoverage,
        amount: data.amount,
        currency: data.currency,
        projectId: data.projectId || undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : undefined,
      };

      await createRequest.mutateAsync(requestData);
      router.push('/guarantees');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create guarantee request');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/guarantees" className="text-primary-600 hover:text-primary-700">
            ← Back to Guarantees
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Request Guarantee</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="guaranteeType" className="block text-sm font-medium text-gray-700 mb-2">
                  Guarantee Type *
                </label>
                <select
                  id="guaranteeType"
                  {...register('guaranteeType', { required: 'Guarantee type is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {GUARANTEE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.guaranteeType && (
                  <p className="mt-1 text-sm text-red-600">{errors.guaranteeType.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (KES) *
                </label>
                <input
                  type="number"
                  id="amount"
                  step="0.01"
                  min="0"
                  {...register('amount', {
                    required: 'Amount is required',
                    min: { value: 0.01, message: 'Amount must be greater than 0' },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="requestedCoverage" className="block text-sm font-medium text-gray-700 mb-2">
                  Requested Coverage (%) *
                </label>
                <input
                  type="number"
                  id="requestedCoverage"
                  step="0.1"
                  min="0"
                  max="100"
                  {...register('requestedCoverage', {
                    required: 'Coverage percentage is required',
                    min: { value: 0, message: 'Coverage must be at least 0%' },
                    max: { value: 100, message: 'Coverage cannot exceed 100%' },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.requestedCoverage && (
                  <p className="mt-1 text-sm text-red-600">{errors.requestedCoverage.message}</p>
                )}
              </div>

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

              <div>
                <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  id="expiresAt"
                  {...register('expiresAt')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={createRequest.isPending}
                  fullWidth
                >
                  {createRequest.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" />
                      Creating Request...
                    </span>
                  ) : (
                    'Create Guarantee Request'
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

