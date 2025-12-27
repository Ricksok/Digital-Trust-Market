'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { governanceApi, GovernanceProposal, GovernanceVote } from '@/lib/api/governance';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useUIStore } from '@/lib/stores/ui.store';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function VotePage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const { showNotification } = useUIStore();
  const proposalId = params?.id as string;

  const [proposal, setProposal] = useState<GovernanceProposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVote, setSelectedVote] = useState<'YES' | 'NO' | 'ABSTAIN' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userVote, setUserVote] = useState<GovernanceVote | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const fetchProposal = async () => {
      try {
        setIsLoading(true);
        const response = await governanceApi.getProposal(proposalId);
        const proposalData = response.data || response;
        setProposal(proposalData);
        
        // Check if user has voted
        if (proposalData.votes && user) {
          const vote = proposalData.votes.find((v: GovernanceVote) => v.voterId === user.id);
          if (vote) {
            setUserVote(vote);
            setSelectedVote(vote.vote);
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to load proposal');
      } finally {
        setIsLoading(false);
      }
    };

    if (proposalId) {
      fetchProposal();
    }
  }, [proposalId, isAuthenticated, router, user]);

  const handleVote = async () => {
    if (!selectedVote || !proposalId) return;

    try {
      setIsSubmitting(true);
      setError(null);

      await governanceApi.castVote(proposalId, selectedVote);
      
      showNotification({
        type: 'success',
        message: 'Vote cast successfully',
      });
      
      router.push(`/governance/${proposalId}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to cast vote';
      setError(errorMessage);
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVotingActive = () => {
    if (!proposal) return false;
    const now = new Date();
    const start = new Date(proposal.votingStart);
    const end = new Date(proposal.votingEnd);
    return now >= start && now <= end && proposal.status === 'ACTIVE';
  };

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error || 'Proposal not found'}
          </div>
          <Link href="/governance" className="mt-4 inline-block text-primary-600 hover:text-primary-700">
            ← Back to Governance
          </Link>
        </div>
      </div>
    );
  }

  if (!isVotingActive() && !userVote) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent>
              <p className="text-gray-600 mb-4">Voting is not currently active for this proposal.</p>
              <Link href={`/governance/${proposalId}`} className="text-primary-600 hover:text-primary-700">
                ← Back to Proposal
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href={`/governance/${proposalId}`} className="text-primary-600 hover:text-primary-700">
            ← Back to Proposal
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{userVote ? 'Your Vote' : 'Cast Your Vote'}</CardTitle>
            <p className="text-sm text-gray-500 mt-2">{proposal.title}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {userVote ? (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
                  <p className="font-medium">You voted: {userVote.vote}</p>
                  <p className="text-sm mt-1">Voting Power: {userVote.votingPower}</p>
                  <p className="text-sm">Weight: {userVote.trustWeight}</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <button
                      onClick={() => setSelectedVote('YES')}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                        selectedVote === 'YES'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-green-700">Yes</span>
                        {selectedVote === 'YES' && (
                          <span className="text-green-600">✓</span>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => setSelectedVote('NO')}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                        selectedVote === 'NO'
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300 hover:border-red-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-red-700">No</span>
                        {selectedVote === 'NO' && (
                          <span className="text-red-600">✓</span>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => setSelectedVote('ABSTAIN')}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                        selectedVote === 'ABSTAIN'
                          ? 'border-gray-500 bg-gray-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-700">Abstain</span>
                        {selectedVote === 'ABSTAIN' && (
                          <span className="text-gray-600">✓</span>
                        )}
                      </div>
                    </button>
                  </div>

                  <Button
                    onClick={handleVote}
                    variant="primary"
                    disabled={!selectedVote || isSubmitting}
                    fullWidth
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <LoadingSpinner size="sm" />
                        Casting Vote...
                      </span>
                    ) : (
                      'Cast Vote'
                    )}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

