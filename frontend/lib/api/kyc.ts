import apiClient from './client';

export interface KYCData {
  documentType: string;
  documentNumber: string;
  documentUrl: string;
  verificationData?: any;
}

export const kycApi = {
  submit: async (data: KYCData) => {
    const response = await apiClient.post('/api/kyc/submit', data);
    return response.data;
  },

  getStatus: async () => {
    const response = await apiClient.get('/api/kyc/status');
    return response.data;
  },

  getRecord: async (id: string) => {
    const response = await apiClient.get(`/api/kyc/${id}`);
    return response.data;
  },
};


