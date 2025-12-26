'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCurrentUser, useLogout } from '@/lib/queries';
import { useAuthStore } from '@/lib/stores/auth.store';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function DashboardPage() {
  const router = useRouter();
  const { data: user, isLoading, error } = useCurrentUser();
  const logout = useLogout();
  const { isAuthenticated } = useAuthStore();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        router.push('/auth/login');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load user data</p>
          <Button onClick={() => router.push('/auth/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Projects',
      description: 'View and manage your projects',
      href: '/projects',
      icon: '📊',
      color: 'primary',
    },
    {
      title: 'Investments',
      description: 'Track your investments',
      href: '/investments',
      icon: '💼',
      color: 'success',
    },
    {
      title: 'Analytics',
      description: 'View your analytics',
      href: '/analytics',
      icon: '📈',
      color: 'primary',
    },
    {
      title: 'Trust Score',
      description: 'Check your trust rating',
      href: '/trust',
      icon: '⭐',
      color: 'warning',
    },
  ];

  return (
    <div className="page-container">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
            </p>
          </div>
          <Button variant="danger" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* User Info Card */}
        {user && (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your profile details and account status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                  <p className="text-base text-gray-900">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Role</p>
                  <Badge variant="primary">{user.role}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">User Type</p>
                  <Badge variant="outline">{user.userType}</Badge>
                </div>
                {user.firstName && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Name</p>
                    <p className="text-base text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              >
                <CardContent className="pt-6">
                  <div className="text-4xl mb-4">{action.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                  <Link href={action.href}>
                    <Button variant="outline" fullWidth size="sm">
                      View →
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Need Help?</CardTitle>
              <CardDescription>
                Get support and learn how to use the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Check out our documentation or contact support for assistance.
              </p>
              <Button variant="outline" fullWidth>
                View Documentation
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Platform Status</CardTitle>
              <CardDescription>Current system status and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">All systems operational</span>
              </div>
              <p className="text-sm text-gray-600">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
