import apiClient from './client';
import { Bid } from './auctions';

export interface UserBid extends Bid {
  auction?: {
    id: string;
    title: string;
    auctionType: string;
    status: string;
    project?: {
      id: string;
      title: string;
      status: string;
    };
  };
}

export const bidsApi = {
  getAll: async (params?: { status?: string; auctionType?: string; auctionId?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get('/api/bids', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/api/bids/${id}`);
    return response.data;
  },

  update: async (id: string, data: { price?: number; amount?: number; notes?: string }) => {
    const response = await apiClient.put(`/api/bids/${id}`, data);
    return response.data;
  },
};

