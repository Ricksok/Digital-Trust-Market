import apiClient from './client';

export interface InvestorReport {
  id: string;
  investorId: string;
  reportType: string;
  period: string;
  status: string;
  generatedAt: string;
  publishedAt?: string;
  portfolioValue?: number;
  totalInvested?: number;
  totalReturns?: number;
  yield?: number;
  impactMetrics?: any;
  reportData: any;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
  investments?: InvestorReportInvestment[];
  impactData?: InvestorReportImpact[];
}

export interface InvestorReportInvestment {
  id: string;
  reportId: string;
  investmentId: string;
  projectId?: string;
  amount: number;
  currentValue?: number;
  returns?: number;
  status: string;
  performance?: string;
  createdAt: string;
}

export interface InvestorReportImpact {
  id: string;
  reportId: string;
  dimension: string;
  metric: string;
  value: number;
  unit?: string;
  dataSource?: string;
  metadata?: string;
  createdAt: string;
}

export interface GenerateReportRequest {
  period: string; // Format: YYYY-MM or YYYY-Q1
}

export const investorReportingApi = {
  /**
   * Generate Portfolio Report
   */
  generatePortfolioReport: async (data: GenerateReportRequest) => {
    const response = await apiClient.post<{ success: boolean; data: InvestorReport }>(
      '/investor-reporting/portfolio',
      data
    );
    return response.data;
  },

  /**
   * Generate Impact Report
   */
  generateImpactReport: async (data: GenerateReportRequest) => {
    const response = await apiClient.post<{ success: boolean; data: InvestorReport }>(
      '/investor-reporting/impact',
      data
    );
    return response.data;
  },

  /**
   * Generate Financial Report
   */
  generateFinancialReport: async (data: GenerateReportRequest) => {
    const response = await apiClient.post<{ success: boolean; data: InvestorReport }>(
      '/investor-reporting/financial',
      data
    );
    return response.data;
  },

  /**
   * Get all investor reports
   */
  getReports: async (filters?: {
    reportType?: string;
    period?: string;
    status?: string;
  }) => {
    const response = await apiClient.get<{ success: boolean; data: InvestorReport[] }>(
      '/investor-reporting',
      { params: filters }
    );
    return response.data;
  },

  /**
   * Get single investor report
   */
  getReport: async (reportId: string) => {
    const response = await apiClient.get<{ success: boolean; data: InvestorReport }>(
      `/investor-reporting/${reportId}`
    );
    return response.data;
  },

  /**
   * Publish report
   */
  publishReport: async (reportId: string) => {
    const response = await apiClient.post<{ success: boolean; data: InvestorReport }>(
      `/investor-reporting/${reportId}/publish`
    );
    return response.data;
  },
};




