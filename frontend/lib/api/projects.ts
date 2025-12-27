import apiClient from './client';

export interface Fundraiser {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  trustBand?: string;
  trustScore?: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  minInvestment: number;
  maxInvestment?: number;
  status: string;
  images?: string[] | string; // Can be array or JSON string
  documents?: string[] | string; // Can be array or JSON string
  metadata?: string | any; // Can be string (JSON) or parsed object
  startDate?: string | Date; // Optional start date
  endDate?: string | Date; // Optional end date
  createdAt: string;
  updatedAt: string;
  fundraiserId?: string;
  fundraiser?: Fundraiser;
}

export const projectsApi = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/api/projects', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/api/projects/${id}`);
    return response.data;
  },

  create: async (data: Partial<Project>) => {
    const response = await apiClient.post('/api/projects', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Project>) => {
    const response = await apiClient.put(`/api/projects/${id}`, data);
    return response.data;
  },

  submitForApproval: async (id: string) => {
    const response = await apiClient.post(`/api/projects/${id}/submit`);
    return response.data;
  },
};


