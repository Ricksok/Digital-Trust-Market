import apiClient from './client';

export interface RegulatoryReport {
  id: string;
  reportType: string;
  regulatorType: string;
  period: string;
  status: string;
  generatedAt: string;
  submittedAt?: string;
  acceptedAt?: string;
  rejectionReason?: string;
  reportData: any;
  metadata?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  transactions?: RegulatoryReportTransaction[];
}

export interface RegulatoryReportTransaction {
  id: string;
  reportId: string;
  transactionId?: string;
  transactionType: string;
  amount: number;
  currency: string;
  timestamp: string;
  parties: string;
  taxImplications?: string;
  complianceFlags?: string;
  metadata?: string;
  createdAt: string;
}

export interface GenerateReportRequest {
  period: string; // Format: YYYY-MM or YYYY-Q1
}

export const regulatoryReportingApi = {
  /**
   * Generate Capital Markets Report
   */
  generateCapitalMarketsReport: async (data: GenerateReportRequest) => {
    const response = await apiClient.post<{ success: boolean; data: RegulatoryReport }>(
      '/regulatory-reporting/capital-markets',
      data
    );
    return response.data;
  },

  /**
   * Generate SACCO Report
   */
  generateSACCOReport: async (data: GenerateReportRequest) => {
    const response = await apiClient.post<{ success: boolean; data: RegulatoryReport }>(
      '/regulatory-reporting/sacco',
      data
    );
    return response.data;
  },

  /**
   * Generate Tax Report
   */
  generateTaxReport: async (data: GenerateReportRequest) => {
    const response = await apiClient.post<{ success: boolean; data: RegulatoryReport }>(
      '/regulatory-reporting/tax',
      data
    );
    return response.data;
  },

  /**
   * Generate AML/CFT Report
   */
  generateAMLReport: async (data: GenerateReportRequest) => {
    const response = await apiClient.post<{ success: boolean; data: RegulatoryReport }>(
      '/regulatory-reporting/aml',
      data
    );
    return response.data;
  },

  /**
   * Get all regulatory reports
   */
  getReports: async (filters?: {
    reportType?: string;
    regulatorType?: string;
    period?: string;
    status?: string;
  }) => {
    const response = await apiClient.get<{ success: boolean; data: RegulatoryReport[] }>(
      '/regulatory-reporting',
      { params: filters }
    );
    return response.data;
  },

  /**
   * Get single regulatory report
   */
  getReport: async (reportId: string) => {
    const response = await apiClient.get<{ success: boolean; data: RegulatoryReport }>(
      `/regulatory-reporting/${reportId}`
    );
    return response.data;
  },

  /**
   * Submit report to regulator
   */
  submitReport: async (reportId: string) => {
    const response = await apiClient.post<{ success: boolean; data: RegulatoryReport }>(
      `/regulatory-reporting/${reportId}/submit`
    );
    return response.data;
  },
};



