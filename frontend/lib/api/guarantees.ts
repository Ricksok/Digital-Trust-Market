import apiClient from './client';

export interface GuaranteeRequest {
  id: string;
  issuerId: string;
  projectId?: string;
  guaranteeType: string;
  requestedCoverage: number;
  amount: number;
  currency: string;
  status: string;
  auctionId?: string;
  allocatedCoverage?: number;
  requestedAt: string;
  expiresAt?: string;
  issuer?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
  };
}

export interface GuaranteeBid {
  id: string;
  guaranteeRequestId: string;
  guarantorId: string;
  coveragePercent: number;
  feePercent: number;
  effectiveBid?: number;
  layer?: string;
  status: string;
  guarantorTrustScore?: number;
  submittedAt: string;
  guarantor?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
  };
}

export const guaranteesApi = {
  getRequests: async (params?: any) => {
    const response = await apiClient.get('/api/guarantees/requests', { params });
    return response.data;
  },

  getRequestById: async (id: string) => {
    const response = await apiClient.get(`/api/guarantees/requests/${id}`);
    return response.data;
  },

  createRequest: async (data: Partial<GuaranteeRequest>) => {
    const response = await apiClient.post('/api/guarantees/requests', data);
    return response.data;
  },

  createAuction: async (id: string) => {
    const response = await apiClient.post(`/api/guarantees/requests/${id}/auction`);
    return response.data;
  },

  placeBid: async (id: string, data: { coveragePercent: number; feePercent: number; layer?: string }) => {
    const response = await apiClient.post(`/api/guarantees/requests/${id}/bids`, data);
    return response.data;
  },

  allocate: async (id: string) => {
    const response = await apiClient.post(`/api/guarantees/requests/${id}/allocate`);
    return response.data;
  },
};


