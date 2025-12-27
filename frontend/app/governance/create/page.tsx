'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { governanceApi, CreateProposalData } from '@/lib/api/governance';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useUIStore } from '@/lib/stores/ui.store';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ProposalFormData {
  title: string;
  description: string;
  proposalType: string;
  votingStart: string;
  votingEnd: string;
  quorum?: number;
  threshold?: number;
}

const PROPOSAL_TYPES = [
  { value: 'POLICY_CHANGE', label: 'Policy Change' },
  { value: 'PARAMETER_UPDATE', label: 'Parameter Update' },
  { value: 'FUND_ALLOCATION', label: 'Fund Allocation' },
  { value: 'TOKENOMICS_CHANGE', label: 'Tokenomics Change' },
];

export default function CreateProposalPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { showNotification } = useUIStore();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProposalFormData>();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: ProposalFormData) => {
    try {
      setError(null);
      setIsSubmitting(true);

      const proposalData: CreateProposalData = {
        title: data.title,
        description: data.description,
        proposalType: data.proposalType,
        votingStart: new Date(data.votingStart).toISOString(),
        votingEnd: new Date(data.votingEnd).toISOString(),
        quorum: data.quorum,
        threshold: data.threshold,
      };

      const response = await governanceApi.createProposal(proposalData);
      
      showNotification({
        type: 'success',
        message: 'Proposal created successfully',
      });
      
      router.push(`/governance/${response.data?.id || response.id}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to create proposal';
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

  // Set default dates (voting starts tomorrow, ends in 7 days)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/governance" className="text-primary-600 hover:text-primary-700">
            ← Back to Governance
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Governance Proposal</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

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
                  Description *
                </label>
                <textarea
                  id="description"
                  rows={6}
                  {...register('description', { required: 'Description is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="proposalType" className="block text-sm font-medium text-gray-700 mb-2">
                  Proposal Type *
                </label>
                <select
                  id="proposalType"
                  {...register('proposalType', { required: 'Proposal type is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {PROPOSAL_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.proposalType && (
                  <p className="mt-1 text-sm text-red-600">{errors.proposalType.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="votingStart" className="block text-sm font-medium text-gray-700 mb-2">
                    Voting Start *
                  </label>
                  <input
                    type="datetime-local"
                    id="votingStart"
                    {...register('votingStart', { required: 'Voting start date is required' })}
                    defaultValue={tomorrow.toISOString().slice(0, 16)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {errors.votingStart && (
                    <p className="mt-1 text-sm text-red-600">{errors.votingStart.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="votingEnd" className="block text-sm font-medium text-gray-700 mb-2">
                    Voting End *
                  </label>
                  <input
                    type="datetime-local"
                    id="votingEnd"
                    {...register('votingEnd', { required: 'Voting end date is required' })}
                    defaultValue={nextWeek.toISOString().slice(0, 16)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {errors.votingEnd && (
                    <p className="mt-1 text-sm text-red-600">{errors.votingEnd.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quorum" className="block text-sm font-medium text-gray-700 mb-2">
                    Quorum (%) (Optional)
                  </label>
                  <input
                    type="number"
                    id="quorum"
                    step="0.1"
                    min="0"
                    max="100"
                    {...register('quorum', {
                      min: { value: 0, message: 'Quorum must be at least 0%' },
                      max: { value: 100, message: 'Quorum cannot exceed 100%' },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {errors.quorum && (
                    <p className="mt-1 text-sm text-red-600">{errors.quorum.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="threshold" className="block text-sm font-medium text-gray-700 mb-2">
                    Approval Threshold (%) (Optional)
                  </label>
                  <input
                    type="number"
                    id="threshold"
                    step="0.1"
                    min="0"
                    max="100"
                    {...register('threshold', {
                      min: { value: 0, message: 'Threshold must be at least 0%' },
                      max: { value: 100, message: 'Threshold cannot exceed 100%' },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {errors.threshold && (
                    <p className="mt-1 text-sm text-red-600">{errors.threshold.message}</p>
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
                      Creating Proposal...
                    </span>
                  ) : (
                    'Create Proposal'
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

