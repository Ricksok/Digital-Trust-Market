import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { investmentsApi, Investment } from '@/lib/api/investments';
import { useUIStore } from '@/lib/stores/ui.store';

/**
 * Get all investments query hook
 */
export const useInvestments = (filters?: any) => {
  return useQuery({
    queryKey: ['investments', filters],
    queryFn: async () => {
      const response = await investmentsApi.getAll(filters);
      return response;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Get single investment query hook
 */
export const useInvestment = (id: string) => {
  return useQuery({
    queryKey: ['investments', id],
    queryFn: async () => {
      const response = await investmentsApi.getById(id);
      return response;
    },
    enabled: !!id,
  });
};

/**
 * Create investment mutation hook
 * Includes optimistic update
 */
export const useCreateInvestment = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: (data: { projectId: string; amount: number; notes?: string }) =>
      investmentsApi.create(data),
    onMutate: async (newInvestment) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['investments'] });
      await queryClient.cancelQueries({ queryKey: ['projects', newInvestment.projectId] });

      // Snapshot previous values
      const previousInvestments = queryClient.getQueryData(['investments']);
      const previousProject = queryClient.getQueryData(['projects', newInvestment.projectId]);

      // Optimistically update investments
      queryClient.setQueryData(['investments'], (old: any) => {
        if (!old?.data) return old;
        const investments = Array.isArray(old.data) ? old.data : [];
        return {
          ...old,
          data: [
            ...investments,
            {
              ...newInvestment,
              id: 'temp-' + Date.now(),
              status: 'PENDING',
              createdAt: new Date().toISOString(),
            },
          ],
        };
      });

      // Optimistically update project currentAmount
      queryClient.setQueryData(['projects', newInvestment.projectId], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            currentAmount: (old.data.currentAmount || 0) + newInvestment.amount,
          },
        };
      });

      return { previousInvestments, previousProject };
    },
    onError: (err: any, newInvestment, context) => {
      // Rollback on error
      if (context?.previousInvestments) {
        queryClient.setQueryData(['investments'], context.previousInvestments);
      }
      if (context?.previousProject) {
        queryClient.setQueryData(['projects', newInvestment.projectId], context.previousProject);
      }
      const errorMessage = err.response?.data?.error?.message || 'Failed to create investment';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
    onSuccess: () => {
      showNotification({
        type: 'success',
        message: 'Investment created successfully',
      });
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId] });
    },
  });
};

/**
 * Cancel investment mutation hook
 */
export const useCancelInvestment = () => {
  const queryClient = useQueryClient();
  const { showNotification } = useUIStore();

  return useMutation({
    mutationFn: (id: string) => investmentsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      showNotification({
        type: 'success',
        message: 'Investment cancelled successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to cancel investment';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

