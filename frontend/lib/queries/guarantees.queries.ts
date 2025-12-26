import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guaranteesApi, GuaranteeRequest, GuaranteeBid } from '@/lib/api/guarantees';
import { useUIStore } from '@/lib/stores/ui.store';

/**
 * Get all guarantee requests query hook
 */
export const useGuaranteeRequests = (filters?: any) => {
  return useQuery({
    queryKey: ['guarantees', 'requests', filters],
    queryFn: async () => {
      const response = await guaranteesApi.getRequests(filters);
      return response;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Get single guarantee request query hook
 */
export const useGuaranteeRequest = (id: string) => {
  return useQuery({
    queryKey: ['guarantees', 'requests', id],
    queryFn: async () => {
      const response = await guaranteesApi.getRequestById(id);
      return response;
    },
    enabled: !!id,
    staleTime: 10 * 1000, // 10 seconds (more frequent for active auctions)
    refetchInterval: (query) => {
      // Refetch if auction is active
      const data = query.state.data as any;
      if (data?.data?.status === 'AUCTION_ACTIVE') {
        return 15 * 1000; // Refetch every 15 seconds
      }
      return false;
    },
  });
};

/**
 * Create guarantee request mutation hook
 */
export const useCreateGuaranteeRequest = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: (data: Partial<GuaranteeRequest>) => guaranteesApi.createRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guarantees', 'requests'] });
      showNotification({
        type: 'success',
        message: 'Guarantee request created successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to create guarantee request';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

/**
 * Create auction for guarantee request mutation hook
 */
export const useCreateGuaranteeAuction = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: (id: string) => guaranteesApi.createAuction(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: ['guarantees', 'requests'] });
      queryClient.invalidateQueries({ queryKey: ['guarantees', 'requests', id] });
      showNotification({
        type: 'success',
        message: 'Auction created for guarantee request',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to create auction';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

/**
 * Place guarantee bid mutation hook
 * Includes optimistic update
 */
export const usePlaceGuaranteeBid = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: ({ requestId, data }: { requestId: string; data: { coveragePercent: number; feePercent: number; layer?: string } }) =>
      guaranteesApi.placeBid(requestId, data),
    onMutate: async ({ requestId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['guarantees', 'requests', requestId] });

      // Snapshot previous value
      const previousRequest = queryClient.getQueryData(['guarantees', 'requests', requestId]);

      // Optimistically add bid
      queryClient.setQueryData(['guarantees', 'requests', requestId], (old: any) => {
        if (!old?.data) return old;
        const bids = old.data.bids || [];
        return {
          ...old,
          data: {
            ...old.data,
            bids: [
              ...bids,
              {
                id: 'temp-' + Date.now(),
                guaranteeRequestId: requestId,
                coveragePercent: data.coveragePercent,
                feePercent: data.feePercent,
                layer: data.layer,
                status: 'PENDING',
                submittedAt: new Date().toISOString(),
              },
            ],
          },
        };
      });

      return { previousRequest };
    },
    onError: (err: any, variables, context) => {
      // Rollback on error
      if (context?.previousRequest) {
        queryClient.setQueryData(['guarantees', 'requests', variables.requestId], context.previousRequest);
      }
      const errorMessage = err.response?.data?.error?.message || 'Failed to place bid';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Bid placed successfully',
      });
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['guarantees', 'requests', variables.requestId] });
      queryClient.invalidateQueries({ queryKey: ['guarantees', 'requests'] });
    },
  });
};

/**
 * Allocate guarantee mutation hook
 */
export const useAllocateGuarantee = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: (id: string) => guaranteesApi.allocate(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: ['guarantees', 'requests'] });
      queryClient.invalidateQueries({ queryKey: ['guarantees', 'requests', id] });
      showNotification({
        type: 'success',
        message: 'Guarantee allocated successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to allocate guarantee';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

