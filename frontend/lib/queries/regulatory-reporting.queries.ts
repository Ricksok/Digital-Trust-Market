import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { regulatoryReportingApi, GenerateReportRequest } from '@/lib/api/regulatory-reporting';
import { useUIStore } from '@/lib/stores/ui.store';
import { AxiosError } from 'axios';

/**
 * Get all regulatory reports
 */
export const useRegulatoryReports = (filters?: {
  reportType?: string;
  regulatorType?: string;
  period?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: ['regulatory-reports', filters],
    queryFn: () => regulatoryReportingApi.getReports(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get single regulatory report
 */
export const useRegulatoryReport = (reportId: string) => {
  return useQuery({
    queryKey: ['regulatory-report', reportId],
    queryFn: () => regulatoryReportingApi.getReport(reportId),
    enabled: !!reportId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Generate Capital Markets Report
 */
export const useGenerateCapitalMarketsReport = () => {
  const { showNotification } = useUIStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateReportRequest) =>
      regulatoryReportingApi.generateCapitalMarketsReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulatory-reports'] });
      showNotification({
        type: 'success',
        message: 'Capital Markets report generated successfully!',
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
 * Generate SACCO Report
 */
export const useGenerateSACCOReport = () => {
  const { showNotification } = useUIStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateReportRequest) =>
      regulatoryReportingApi.generateSACCOReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulatory-reports'] });
      showNotification({
        type: 'success',
        message: 'SACCO report generated successfully!',
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
 * Generate Tax Report
 */
export const useGenerateTaxReport = () => {
  const { showNotification } = useUIStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateReportRequest) =>
      regulatoryReportingApi.generateTaxReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulatory-reports'] });
      showNotification({
        type: 'success',
        message: 'Tax report generated successfully!',
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
 * Generate AML/CFT Report
 */
export const useGenerateAMLReport = () => {
  const { showNotification } = useUIStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateReportRequest) =>
      regulatoryReportingApi.generateAMLReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulatory-reports'] });
      showNotification({
        type: 'success',
        message: 'AML/CFT report generated successfully!',
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
 * Submit report to regulator
 */
export const useSubmitRegulatoryReport = () => {
  const { showNotification } = useUIStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) => regulatoryReportingApi.submitReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulatory-reports'] });
      showNotification({
        type: 'success',
        message: 'Report submitted successfully!',
      });
    },
    onError: (error: AxiosError<any>) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to submit report';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};




