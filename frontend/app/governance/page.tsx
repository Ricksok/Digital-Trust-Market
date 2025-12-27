'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GovernanceProposal } from '@/lib/api/governance';
import { useGovernanceProposals } from '@/lib/queries';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function GovernancePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [filter, setFilter] = useState<string>('all');

  const { data, isLoading, error } = useGovernanceProposals(
    filter !== 'all' ? { status: filter } : undefined
  );

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Extract proposals from response
  const proposals: GovernanceProposal[] = data?.data || [];

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
      case 'PASSED':
        return 'bg-blue-100 text-blue-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'EXECUTED':
        return 'bg-purple-100 text-purple-800';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getVotePercentage = (proposal: GovernanceProposal, voteType: 'yes' | 'no' | 'abstain') => {
    const total = proposal.totalVotes || 0;
    if (total === 0) return 0;
    const votes = voteType === 'yes' 
      ? proposal.yesVotes 
      : voteType === 'no' 
      ? proposal.noVotes 
      : proposal.abstainVotes;
    return Math.round((votes / total) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Governance</h1>
          <p className="text-gray-600">Participate in platform governance through proposals and voting</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {(error as any)?.response?.data?.message || (error as Error)?.message || 'Failed to load proposals'}
          </div>
        )}

        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-2">
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
              onClick={() => setFilter('ACTIVE')}
              className={`px-4 py-2 rounded-md ${
                filter === 'ACTIVE'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('PASSED')}
              className={`px-4 py-2 rounded-md ${
                filter === 'PASSED'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Passed
            </button>
            <button
              onClick={() => setFilter('REJECTED')}
              className={`px-4 py-2 rounded-md ${
                filter === 'REJECTED'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Rejected
            </button>
          </div>
          {(user?.role === 'ADMIN' || user?.userType === 'INVESTOR') && (
            <Link
              href="/governance/create"
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 inline-block"
            >
              Create Proposal
            </Link>
          )}
        </div>

        {proposals.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500">No proposals found.</p>
            {(user?.role === 'ADMIN' || user?.userType === 'INVESTOR') && (
              <Link
                href="/governance/create"
                className="mt-4 inline-block text-primary-600 hover:text-primary-700"
              >
                Create the first proposal
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {proposals.map((proposal) => (
              <div key={proposal.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <Link
                      href={`/governance/${proposal.id}`}
                      className="text-xl font-semibold text-gray-900 hover:text-primary-600 text-left"
                    >
                      {proposal.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      {proposal.proposalType} • Proposed by {proposal.proposer?.firstName} {proposal.proposer?.lastName}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(proposal.status)}`}>
                    {proposal.status}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">{proposal.description}</p>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Yes</p>
                    <p className="text-lg font-semibold text-green-600">
                      {proposal.yesVotes} ({getVotePercentage(proposal, 'yes')}%)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">No</p>
                    <p className="text-lg font-semibold text-red-600">
                      {proposal.noVotes} ({getVotePercentage(proposal, 'no')}%)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Abstain</p>
                    <p className="text-lg font-semibold text-gray-600">
                      {proposal.abstainVotes} ({getVotePercentage(proposal, 'abstain')}%)
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <div>
                    <p>Voting: {formatDate(proposal.votingStart)} - {formatDate(proposal.votingEnd)}</p>
                    <p>Total Votes: {proposal.totalVotes}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/governance/${proposal.id}`}
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 text-center inline-block"
                  >
                    View Details
                  </Link>
                  {proposal.status === 'ACTIVE' && (
                    <Link
                      href={`/governance/${proposal.id}/vote`}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-center inline-block"
                    >
                      Vote
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

