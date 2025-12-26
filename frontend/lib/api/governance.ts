import apiClient from './client';

export interface GovernanceProposal {
  id: string;
  proposerId: string;
  title: string;
  description: string;
  proposalType: string;
  status: string;
  votingStart: string;
  votingEnd: string;
  quorum?: number;
  threshold?: number;
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  totalVotes: number;
  executionHash?: string;
  executedAt?: string;
  createdAt: string;
  updatedAt: string;
  proposer?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  votes?: GovernanceVote[];
}

export interface GovernanceVote {
  id: string;
  proposalId: string;
  voterId: string;
  vote: 'YES' | 'NO' | 'ABSTAIN';
  votingPower: number;
  trustWeight: number;
  createdAt: string;
  voter?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateProposalData {
  title: string;
  description: string;
  proposalType: string;
  votingStart: string;
  votingEnd: string;
  quorum?: number;
  threshold?: number;
}

export const governanceApi = {
  // Proposals
  createProposal: async (data: CreateProposalData) => {
    const response = await apiClient.post('/api/governance/proposals', data);
    return response.data;
  },

  getProposals: async (params?: { status?: string; proposerId?: string; limit?: number }) => {
    const response = await apiClient.get('/api/governance/proposals', { params });
    return response.data;
  },

  getProposal: async (proposalId: string) => {
    const response = await apiClient.get(`/api/governance/proposals/${proposalId}`);
    return response.data;
  },

  executeProposal: async (proposalId: string, executionHash?: string) => {
    const response = await apiClient.post(`/api/governance/proposals/${proposalId}/execute`, {
      executionHash,
    });
    return response.data;
  },

  // Voting
  castVote: async (proposalId: string, vote: 'YES' | 'NO' | 'ABSTAIN') => {
    const response = await apiClient.post(`/api/governance/proposals/${proposalId}/vote`, { vote });
    return response.data;
  },
};




