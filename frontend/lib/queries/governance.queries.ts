import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { governanceApi, GovernanceProposal, CreateProposalData } from '@/lib/api/governance';
import { useUIStore } from '@/lib/stores/ui.store';

/**
 * Get all governance proposals query hook
 */
export const useGovernanceProposals = (filters?: { status?: string; proposerId?: string; limit?: number }) => {
  return useQuery({
    queryKey: ['governance', 'proposals', filters],
    queryFn: async () => {
      const response = await governanceApi.getProposals(filters);
      return response;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Get single governance proposal query hook
 */
export const useGovernanceProposal = (proposalId: string) => {
  return useQuery({
    queryKey: ['governance', 'proposals', proposalId],
    queryFn: async () => {
      const response = await governanceApi.getProposal(proposalId);
      return response;
    },
    enabled: !!proposalId,
    staleTime: 10 * 1000, // 10 seconds (more frequent for active proposals)
    refetchInterval: (query) => {
      // Refetch if proposal is active
      const data = query.state.data as any;
      if (data?.data?.status === 'ACTIVE') {
        return 15 * 1000; // Refetch every 15 seconds
      }
      return false;
    },
  });
};

/**
 * Create proposal mutation hook
 */
export const useCreateProposal = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: (data: CreateProposalData) => governanceApi.createProposal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governance', 'proposals'] });
      showNotification({
        type: 'success',
        message: 'Proposal created successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to create proposal';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

/**
 * Cast vote mutation hook
 * Includes optimistic update
 */
export const useCastVote = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: ({ proposalId, vote }: { proposalId: string; vote: 'YES' | 'NO' | 'ABSTAIN' }) =>
      governanceApi.castVote(proposalId, vote),
    onMutate: async ({ proposalId, vote }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['governance', 'proposals', proposalId] });

      // Snapshot previous value
      const previousProposal = queryClient.getQueryData(['governance', 'proposals', proposalId]);

      // Optimistically update vote counts
      queryClient.setQueryData(['governance', 'proposals', proposalId], (old: any) => {
        if (!old?.data) return old;
        const proposal = old.data;
        return {
          ...old,
          data: {
            ...proposal,
            [vote === 'YES' ? 'yesVotes' : vote === 'NO' ? 'noVotes' : 'abstainVotes']:
              (proposal[vote === 'YES' ? 'yesVotes' : vote === 'NO' ? 'noVotes' : 'abstainVotes'] || 0) + 1,
            totalVotes: (proposal.totalVotes || 0) + 1,
          },
        };
      });

      return { previousProposal };
    },
    onError: (err: any, variables, context) => {
      // Rollback on error
      if (context?.previousProposal) {
        queryClient.setQueryData(['governance', 'proposals', variables.proposalId], context.previousProposal);
      }
      const errorMessage = err.response?.data?.error?.message || 'Failed to cast vote';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Vote cast successfully',
      });
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['governance', 'proposals', variables.proposalId] });
      queryClient.invalidateQueries({ queryKey: ['governance', 'proposals'] });
    },
  });
};

/**
 * Execute proposal mutation hook
 */
export const useExecuteProposal = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: ({ proposalId, executionHash }: { proposalId: string; executionHash?: string }) =>
      governanceApi.executeProposal(proposalId, executionHash),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['governance', 'proposals'] });
      queryClient.invalidateQueries({ queryKey: ['governance', 'proposals', variables.proposalId] });
      showNotification({
        type: 'success',
        message: 'Proposal executed successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to execute proposal';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

