import apiClient from './client';

export interface Auction {
  id: string;
  auctionType: string;
  projectId?: string;
  title: string;
  description?: string;
  reservePrice?: number;
  targetAmount?: number;
  currency: string;
  startTime: string;
  endTime: string;
  status: string;
  clearedPrice?: number;
  minTrustScore?: number;
  trustWeight: number;
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  price: number;
  amount?: number;
  status: string;
  bidderTrustScore?: number;
  effectiveBid?: number;
  submittedAt: string;
  bidder?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export const auctionsApi = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/api/auctions', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/api/auctions/${id}`);
    return response.data;
  },

  create: async (data: Partial<Auction>) => {
    const response = await apiClient.post('/api/auctions', data);
    return response.data;
  },

  start: async (id: string) => {
    const response = await apiClient.post(`/api/auctions/${id}/start`);
    return response.data;
  },

  placeBid: async (id: string, data: { price: number; amount?: number; notes?: string }) => {
    const response = await apiClient.post(`/api/auctions/${id}/bids`, data);
    return response.data;
  },

  close: async (id: string) => {
    const response = await apiClient.post(`/api/auctions/${id}/close`);
    return response.data;
  },

  withdrawBid: async (bidId: string) => {
    const response = await apiClient.post(`/api/auctions/bids/${bidId}/withdraw`);
    return response.data;
  },

  update: async (id: string, data: Partial<Auction>) => {
    const response = await apiClient.put(`/api/auctions/${id}`, data);
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await apiClient.post(`/api/auctions/${id}/cancel`);
    return response.data;
  },

  extend: async (id: string, newEndTime: string) => {
    const response = await apiClient.post(`/api/auctions/${id}/extend`, { newEndTime });
    return response.data;
  },
};





