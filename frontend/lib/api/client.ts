import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
// This interceptor works with both localStorage (existing code) and Zustand store (new code)
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Try to get token from Zustand store first, fallback to localStorage for backward compatibility
    let token: string | null = null;
    
    try {
      // Dynamically import to avoid SSR issues
      const { useAuthStore } = require('@/lib/stores/auth.store');
      const store = useAuthStore.getState();
      token = store.token;
    } catch {
      // Store not available, use localStorage
    }
    
    // Fallback to localStorage if store doesn't have token
    if (!token) {
      token = localStorage.getItem('token');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 errors - clear auth state
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth from both store and localStorage
      if (typeof window !== 'undefined') {
        try {
          const { useAuthStore } = require('@/lib/stores/auth.store');
          useAuthStore.getState().clearAuth();
        } catch {
          // Store not available
        }
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;


