import apiClient from './client';

export interface Investment {
  id: string;
  investorId: string;
  projectId: string;
  amount: number;
  status: string;
  transactionHash?: string;
  createdAt: string;
}

export const investmentsApi = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/api/investments', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/api/investments/${id}`);
    return response.data;
  },

  create: async (data: { projectId: string; amount: number; notes?: string }) => {
    const response = await apiClient.post('/api/investments', data);
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await apiClient.post(`/api/investments/${id}/cancel`);
    return response.data;
  },
};


