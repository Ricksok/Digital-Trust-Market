import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';

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

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await authApi.getCurrentUser();
        if (response.success && response.data) {
          // Ensure all required fields are present
          const userData: User = {
            id: response.data.id,
            email: response.data.email,
            firstName: response.data.firstName || undefined,
            lastName: response.data.lastName || undefined,
            role: response.data.role,
            userType: response.data.userType || 'INVESTOR',
            walletAddress: response.data.walletAddress || undefined,
            isVerified: response.data.isVerified || false,
          };
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Token might be invalid
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      if (response.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        // Ensure all required fields are present
        const userData: User = {
          id: response.data.user.id,
          email: response.data.user.email,
          role: response.data.user.role,
          userType: 'INVESTOR', // Default, will be updated on next fetch
          walletAddress: response.data.user.walletAddress || undefined,
          isVerified: false, // Default, will be updated on next fetch
        };
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Login failed',
      };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
      router.push('/auth/login');
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };
}

