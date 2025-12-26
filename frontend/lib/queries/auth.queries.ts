import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, LoginData, RegisterData } from '@/lib/api/auth';
import { useAuthStore, User } from '@/lib/stores/auth.store';
import { useUIStore } from '@/lib/stores/ui.store';

/**
 * Login mutation hook
 * Updates auth store on success
 */
export const useLogin = () => {
  const { setAuth, setAuthState, setError } = useAuthStore();
  const { showNotification } = useUIStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginData) => authApi.login(data),
    onMutate: () => {
      setAuthState('AUTHENTICATING');
      setError(null);
    },
    onSuccess: (response) => {
      if (response.success && response.data.token) {
        const { user, token, refreshToken } = response.data;
        
        // Transform API user to store User type
        const storeUser: User = {
          id: user.id,
          email: user.email,
          role: user.role,
          userType: 'INVESTOR', // Default, will be updated on next fetch
          walletAddress: user.walletAddress,
          isVerified: false, // Default, will be updated on next fetch
        };
        
        setAuth(storeUser, token, refreshToken);
        
        // Invalidate user query to refetch full user data
        queryClient.invalidateQueries({ queryKey: ['user', 'current'] });
        
        showNotification({
          type: 'success',
          message: 'Login successful!',
        });
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Login failed';
      setError(errorMessage);
      setAuthState('UNAUTHENTICATED');
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

/**
 * Register mutation hook
 * Updates auth store on success
 */
export const useRegister = () => {
  const { setAuth, setAuthState, setError } = useAuthStore();
  const { showNotification } = useUIStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onMutate: () => {
      setAuthState('AUTHENTICATING');
      setError(null);
    },
    onSuccess: (response, variables) => {
      if (response.success && response.data.token) {
        const { user, token, refreshToken } = response.data;
        
        // Transform API user to store User type
        const storeUser: User = {
          id: user.id,
          email: user.email,
          role: user.role,
          userType: variables.userType || 'INVESTOR',
          walletAddress: user.walletAddress,
          isVerified: false,
        };
        
        setAuth(storeUser, token, refreshToken);
        
        // Invalidate user query
        queryClient.invalidateQueries({ queryKey: ['user', 'current'] });
        
        showNotification({
          type: 'success',
          message: 'Registration successful!',
        });
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Registration failed';
      setError(errorMessage);
      setAuthState('UNAUTHENTICATED');
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

/**
 * Get current user query hook
 * Syncs with auth store
 */
export const useCurrentUser = () => {
  const { token, isAuthenticated, setUser, setAuthState } = useAuthStore();

  return useQuery({
    queryKey: ['user', 'current'],
    queryFn: async () => {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        // Update store with full user data
        const user: User = {
          id: response.data.id,
          email: response.data.email,
          firstName: response.data.firstName || undefined,
          lastName: response.data.lastName || undefined,
          role: response.data.role,
          userType: response.data.userType || 'INVESTOR',
          walletAddress: response.data.walletAddress || undefined,
          isVerified: response.data.isVerified || false,
        };
        setUser(user);
        setAuthState('AUTHENTICATED');
        return user;
      }
      throw new Error('Failed to fetch user');
    },
    enabled: !!token && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/**
 * Logout mutation hook
 * Clears auth store on success
 */
export const useLogout = () => {
  const { clearAuth, setAuthState } = useAuthStore();
  const { showNotification } = useUIStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onMutate: () => {
      setAuthState('LOGGING_OUT');
    },
    onSuccess: () => {
      clearAuth();
      // Clear all queries
      queryClient.clear();
      showNotification({
        type: 'success',
        message: 'Logged out successfully',
      });
    },
    onError: (error: any) => {
      // Clear auth even on error (client-side logout)
      clearAuth();
      queryClient.clear();
      console.error('Logout error:', error);
    },
  });
};

/**
 * Connect wallet mutation hook
 */
export const useConnectWallet = () => {
  const { showNotification } = useUIStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ walletAddress, signature, message }: { walletAddress: string; signature: string; message: string }) =>
      authApi.connectWallet(walletAddress, signature, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'current'] });
      showNotification({
        type: 'success',
        message: 'Wallet connected successfully',
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error?.message || 'Failed to connect wallet';
      showNotification({
        type: 'error',
        message: errorMessage,
      });
    },
  });
};

