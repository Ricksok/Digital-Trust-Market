import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auctionsApi, Auction, Bid } from '@/lib/api/auctions';
import { useUIStore } from '@/lib/stores/ui.store';

/**
 * Get all auctions query hook
 * More frequent refetch for real-time updates
 */
export const useAuctions = (filters?: any) => {
  return useQuery({
    queryKey: ['auctions', filters],
    queryFn: async () => {
      const response = await auctionsApi.getAll(filters);
      return response;
    },
    staleTime: 10 * 1000, // 10 seconds (more frequent for real-time)
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

/**
 * Get single auction query hook
 * Very frequent refetch for active auctions
 */
export const useAuction = (id: string) => {
  return useQuery({
    queryKey: ['auctions', id],
    queryFn: async () => {
      const response = await auctionsApi.getById(id);
      return response;
    },
    enabled: !!id,
    staleTime: 5 * 1000, // 5 seconds
    refetchInterval: (query) => {
      // Only refetch if auction is active
      const data = query.state.data as any;
      if (data?.data?.status === 'ACTIVE') {
        return 10 * 1000; // Refetch every 10 seconds for active auctions
      }
      return false; // Don't refetch for closed/inactive auctions
    },
  });
};

/**
 * Create auction mutation hook
 */
export const useCreateAuction = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: (data: Partial<Auction>) => auctionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
      showNotification({
        type: 'success',
        message: 'Auction created successfully',
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
 * Start auction mutation hook
 */
export const useStartAuction = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: (id: string) => auctionsApi.start(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
      queryClient.invalidateQueries({ queryKey: ['auctions', id] });
      showNotification({
        type: 'success',
        message: 'Auction started',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to start auction';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

/**
 * Place bid mutation hook
 * Includes optimistic update
 */
export const usePlaceBid = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: ({ auctionId, data }: { auctionId: string; data: { price: number; amount?: number; notes?: string } }) =>
      auctionsApi.placeBid(auctionId, data),
    onMutate: async ({ auctionId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['auctions', auctionId] });

      // Snapshot previous value
      const previousAuction = queryClient.getQueryData(['auctions', auctionId]);

      // Optimistically add bid
      queryClient.setQueryData(['auctions', auctionId], (old: any) => {
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
                auctionId,
                price: data.price,
                amount: data.amount,
                status: 'PENDING',
                submittedAt: new Date().toISOString(),
              },
            ],
          },
        };
      });

      return { previousAuction };
    },
    onError: (err: any, variables, context) => {
      // Rollback on error
      if (context?.previousAuction) {
        queryClient.setQueryData(['auctions', variables.auctionId], context.previousAuction);
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
      queryClient.invalidateQueries({ queryKey: ['auctions', variables.auctionId] });
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
    },
  });
};

/**
 * Withdraw bid mutation hook
 */
export const useWithdrawBid = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: (bidId: string) => auctionsApi.withdrawBid(bidId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
      showNotification({
        type: 'success',
        message: 'Bid withdrawn successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to withdraw bid';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

/**
 * Close auction mutation hook
 */
export const useCloseAuction = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: (id: string) => auctionsApi.close(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
      queryClient.invalidateQueries({ queryKey: ['auctions', id] });
      showNotification({
        type: 'success',
        message: 'Auction closed',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to close auction';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

/**
 * Update auction mutation hook
 */
export const useUpdateAuction = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Auction> }) => auctionsApi.update(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
      queryClient.invalidateQueries({ queryKey: ['auctions', variables.id] });
      showNotification({
        type: 'success',
        message: 'Auction updated successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to update auction';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

/**
 * Cancel auction mutation hook
 */
export const useCancelAuction = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: (id: string) => auctionsApi.cancel(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
      queryClient.invalidateQueries({ queryKey: ['auctions', id] });
      showNotification({
        type: 'success',
        message: 'Auction cancelled successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to cancel auction';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

/**
 * Extend auction mutation hook
 */
export const useExtendAuction = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: ({ id, newEndTime }: { id: string; newEndTime: string }) => auctionsApi.extend(id, newEndTime),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
      queryClient.invalidateQueries({ queryKey: ['auctions', variables.id] });
      showNotification({
        type: 'success',
        message: 'Auction extended successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to extend auction';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

