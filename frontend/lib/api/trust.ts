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

export interface DecayRecoveryEvent {
  id: string;
  eventType: 'TRUST_DECAY_APPLIED' | 'TRUST_RECOVERY_EVENT';
  previousScore: number;
  newScore: number;
  changeAmount: number;
  reason: string;
  triggerType: string;
  createdAt: string;
}

export const trustApi = {
  getScore: async (entityId?: string) => {
    const path = entityId ? `/api/trust/${entityId}` : '/api/trust';
    const response = await apiClient.get(path);
    return response.data;
  },

  getHistory: async (entityId: string) => {
    const response = await apiClient.get(`/api/trust/${entityId}/history`);
    return response.data;
  },

  getDecayRecoveryHistory: async (entityId: string) => {
    const response = await apiClient.get(`/api/trust/${entityId}/decay-recovery`);
    return response.data;
  },

  explain: async (entityId: string) => {
    const response = await apiClient.get(`/api/trust/${entityId}/explain`);
    return response.data;
  },

  trackActivity: async (activityType: string, activityValue?: number) => {
    const response = await apiClient.post('/api/trust/activity', {
      activityType,
      activityValue: activityValue || 1,
    });
    return response.data;
  },
};




