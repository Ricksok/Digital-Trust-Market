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

// Handle 401 errors - attempt token refresh, then clear auth if refresh fails
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    // Skip refresh for logout endpoint (to avoid infinite loop)
    if (
      error.response?.status === 401 && 
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/logout')
    ) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Try to refresh token
      if (typeof window !== 'undefined') {
        try {
          const { useAuthStore } = require('@/lib/stores/auth.store');
          const store = useAuthStore.getState();
          const refreshToken = store.refreshToken || localStorage.getItem('refreshToken');

          if (refreshToken) {
            try {
              // Call refresh endpoint
              const refreshResponse = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/refresh`,
                { refreshToken }
              );

              if (refreshResponse.data.success && refreshResponse.data.data.token) {
                const newToken = refreshResponse.data.data.token;
                
                // Update store and localStorage
                store.setToken(newToken);
                localStorage.setItem('token', newToken);
                
                // Update original request header
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                
                // Process queued requests
                processQueue(null, newToken);
                isRefreshing = false;
                
                // Retry original request
                return apiClient(originalRequest);
              }
            } catch (refreshError) {
              // Refresh failed, clear auth
              processQueue(refreshError);
              isRefreshing = false;
            }
          }
        } catch {
          // Store not available
        }
      }

      // If we get here, refresh failed or no refresh token
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
      
      processQueue(error);
      isRefreshing = false;
    }

    return Promise.reject(error);
  }
);

export default apiClient;


