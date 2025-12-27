import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bidsApi, UserBid } from '@/lib/api/bids';
import { useUIStore } from '@/lib/stores/ui.store';

/**
 * Get all user's bids query hook
 */
export const useUserBids = (filters?: { status?: string; auctionType?: string; auctionId?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['bids', 'user', filters],
    queryFn: async () => {
      const response = await bidsApi.getAll(filters);
      return response;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Get bid by ID query hook
 */
export const useBid = (id: string) => {
  return useQuery({
    queryKey: ['bids', id],
    queryFn: async () => {
      const response = await bidsApi.getById(id);
      return response;
    },
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Update bid mutation hook
 */
export const useUpdateBid = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { price?: number; amount?: number; notes?: string } }) =>
      bidsApi.update(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bids'] });
      queryClient.invalidateQueries({ queryKey: ['bids', variables.id] });
      // Also invalidate auction queries since bid is part of auction
      if (response.data?.auctionId) {
        queryClient.invalidateQueries({ queryKey: ['auctions', response.data.auctionId] });
      }
      showNotification({
        type: 'success',
        message: 'Bid updated successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to update bid';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

