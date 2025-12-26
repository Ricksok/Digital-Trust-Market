import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  userType: string;
  walletAddress?: string;
  isVerified: boolean;
}

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  // Auth lifecycle states
  authState: 'UNAUTHENTICATED' | 'AUTHENTICATING' | 'AUTHENTICATED' | 'REFRESHING_TOKEN' | 'LOGGING_OUT';
  
  // Actions
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAuthState: (state: AuthState['authState']) => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      authState: 'UNAUTHENTICATED',
      
      // Actions
      setAuth: (user, token, refreshToken) => {
        // Also update localStorage for backward compatibility
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
        }
        set({
          user,
          token,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
          authState: 'AUTHENTICATED',
          error: null,
        });
      },
      
      clearAuth: () => {
        // Also clear localStorage for backward compatibility
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          authState: 'UNAUTHENTICATED',
          error: null,
        });
      },
      
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setAuthState: (authState) => set({ authState }),
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => {
        if (typeof window !== 'undefined' && token) {
          localStorage.setItem('token', token);
        }
        set({ token });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);



