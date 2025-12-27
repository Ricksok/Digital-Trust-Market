import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { investorReportingApi, GenerateReportRequest } from '@/lib/api/investor-reporting';
import { useUIStore } from '@/lib/stores/ui.store';
import { AxiosError } from 'axios';

/**
 * Get all investor reports
 */
export const useInvestorReports = (filters?: {
  reportType?: string;
  period?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: ['investor-reports', filters],
    queryFn: () => investorReportingApi.getReports(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get single investor report
 */
export const useInvestorReport = (reportId: string) => {
  return useQuery({
    queryKey: ['investor-report', reportId],
    queryFn: () => investorReportingApi.getReport(reportId),
    enabled: !!reportId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Generate Portfolio Report
 */
export const useGeneratePortfolioReport = () => {
  const { showNotification } = useUIStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateReportRequest) =>
      investorReportingApi.generatePortfolioReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investor-reports'] });
      showNotification({
        type: 'success',
        message: 'Portfolio report generated successfully!',
      });
    },
    onError: (error: AxiosError<any>) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to generate report';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

/**
 * Generate Impact Report
 */
export const useGenerateImpactReport = () => {
  const { showNotification } = useUIStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateReportRequest) =>
      investorReportingApi.generateImpactReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investor-reports'] });
      showNotification({
        type: 'success',
        message: 'Impact report generated successfully!',
      });
    },
    onError: (error: AxiosError<any>) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to generate report';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

/**
 * Generate Financial Report
 */
export const useGenerateFinancialReport = () => {
  const { showNotification } = useUIStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateReportRequest) =>
      investorReportingApi.generateFinancialReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investor-reports'] });
      showNotification({
        type: 'success',
        message: 'Financial report generated successfully!',
      });
    },
    onError: (error: AxiosError<any>) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to generate report';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

/**
 * Publish report
 */
export const usePublishInvestorReport = () => {
  const { showNotification } = useUIStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) => investorReportingApi.publishReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investor-reports'] });
      showNotification({
        type: 'success',
        message: 'Report published successfully!',
      });
    },
    onError: (error: AxiosError<any>) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to publish report';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};




