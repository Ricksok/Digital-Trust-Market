'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLogout } from '@/lib/queries';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function LogoutPage() {
  const router = useRouter();
  const logout = useLogout();
  const { clearAuth } = useAuthStore();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Use the logout mutation which handles everything
        logout.mutate(undefined, {
          onSuccess: () => {
            router.push('/auth/login');
          },
          onError: () => {
            // Even if logout fails, clear auth client-side and redirect
            clearAuth();
            router.push('/auth/login');
          },
        });
      } catch (error) {
        // Fallback: clear auth and redirect
        console.error('Logout error:', error);
        clearAuth();
        router.push('/auth/login');
      }
    };

    handleLogout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Logging out...</p>
      </div>
    </div>
  );
}


