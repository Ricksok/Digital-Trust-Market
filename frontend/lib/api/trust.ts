import apiClient from './client';

export interface TrustScore {
  id: string;
  entityId: string;
  trustScore: number;
  identityTrust: number;
  transactionTrust: number;
  financialTrust: number;
  performanceTrust: number;
  guaranteeTrust?: number;
  governanceTrust?: number;
  learningTrust: number;
  behaviorScore: number;
  lastCalculatedAt: string;
}

export interface TrustEvent {
  id: string;
  eventType: string;
  triggerType: string;
  scoreChange: number;
  explanation: string;
  createdAt: string;
}

export const trustApi = {
  getScore: async (entityId: string) => {
    const response = await apiClient.get(`/api/trust/${entityId}`);
    return response.data;
  },

  getHistory: async (entityId: string) => {
    const response = await apiClient.get(`/api/trust/${entityId}/history`);
    return response.data;
  },

  explain: async (entityId: string) => {
    const response = await apiClient.get(`/api/trust/${entityId}/explain`);
    return response.data;
  },

  update: async (entityId: string, data: { trustScore?: number; reason: string }) => {
    const response = await apiClient.post(`/api/trust/${entityId}/update`, data);
    return response.data;
  },
};


