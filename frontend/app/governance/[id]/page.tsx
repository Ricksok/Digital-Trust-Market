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
import Badge from '@/components/ui/Badge';

export default function GovernanceProposalPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const { showNotification } = useUIStore();
  const proposalId = params?.id as string;

  const [proposal, setProposal] = useState<GovernanceProposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

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
          const userVote = proposalData.votes.find((v: GovernanceVote) => v.voterId === user.id);
          setHasVoted(!!userVote);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
      case 'PASSED':
        return 'bg-blue-100 text-blue-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'EXECUTED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVotePercentage = (proposal: GovernanceProposal, type: 'yes' | 'no' | 'abstain') => {
    if (proposal.totalVotes === 0) return 0;
    const votes = type === 'yes' ? proposal.yesVotes : type === 'no' ? proposal.noVotes : proposal.abstainVotes;
    return ((votes / proposal.totalVotes) * 100).toFixed(1);
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/governance" className="text-primary-600 hover:text-primary-700">
            ← Back to Governance
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>{proposal.title}</CardTitle>
              <Badge className={getStatusColor(proposal.status)}>{proposal.status}</Badge>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {proposal.proposalType} • Proposed by {proposal.proposer?.firstName} {proposal.proposer?.lastName}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{proposal.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Yes Votes</p>
                  <p className="text-2xl font-bold text-green-600">
                    {proposal.yesVotes} ({getVotePercentage(proposal, 'yes')}%)
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">No Votes</p>
                  <p className="text-2xl font-bold text-red-600">
                    {proposal.noVotes} ({getVotePercentage(proposal, 'no')}%)
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Abstain</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {proposal.abstainVotes} ({getVotePercentage(proposal, 'abstain')}%)
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Voting Start</p>
                    <p className="font-medium">{formatDate(proposal.votingStart)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Voting End</p>
                    <p className="font-medium">{formatDate(proposal.votingEnd)}</p>
                  </div>
                  {proposal.quorum && (
                    <div>
                      <p className="text-gray-600">Quorum</p>
                      <p className="font-medium">{proposal.quorum}%</p>
                    </div>
                  )}
                  {proposal.threshold && (
                    <div>
                      <p className="text-gray-600">Approval Threshold</p>
                      <p className="font-medium">{proposal.threshold}%</p>
                    </div>
                  )}
                </div>
              </div>

              {isVotingActive() && !hasVoted && (
                <div className="border-t pt-4">
                  <Button
                    onClick={() => router.push(`/governance/${proposalId}/vote`)}
                    variant="primary"
                    fullWidth
                  >
                    Cast Your Vote
                  </Button>
                </div>
              )}

              {hasVoted && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2">You have already voted on this proposal.</p>
                  <Button
                    onClick={() => router.push(`/governance/${proposalId}/vote`)}
                    variant="secondary"
                    fullWidth
                  >
                    View Your Vote
                  </Button>
                </div>
              )}

              {proposal.executedAt && (
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">Executed on {formatDate(proposal.executedAt)}</p>
                  {proposal.executionHash && (
                    <p className="text-xs text-gray-500 mt-1">Hash: {proposal.executionHash}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

