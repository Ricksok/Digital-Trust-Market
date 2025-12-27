/**
 * Vendor Central React Query Hooks
 * Feature: Vendor Central Dashboard
 */

import { useQuery } from '@tanstack/react-query';
import { vendorCentralApi, VendorDashboard } from '../api/vendor-central';

/**
 * Get vendor dashboard query hook
 */
export const useVendorDashboard = () => {
  return useQuery({
    queryKey: ['vendor-central', 'dashboard'],
    queryFn: async () => {
      const response = await vendorCentralApi.getDashboard();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch vendor dashboard');
      }
      return response.data;
    },
    staleTime: 30000, // 30 seconds
  });
};

