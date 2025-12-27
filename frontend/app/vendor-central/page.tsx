'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useVendorDashboard } from '@/lib/queries';
import { useAuthStore } from '@/lib/stores/auth.store';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function VendorCentralPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { data: dashboard, isLoading, error } = useVendorDashboard();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Check if user is a vendor
  useEffect(() => {
    if (user && user.role !== 'SUPPLIER' && !user.role?.includes('VENDOR')) {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">
              {error instanceof Error ? error.message : 'Failed to load vendor dashboard'}
            </p>
            <Button onClick={() => router.push('/dashboard')} className="mt-4">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Vendor Central</h1>
            <p className="mt-2 text-gray-600">Manage your vendor operations and track performance</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-gray-500 mb-1">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">
                ${dashboard.totalSales.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-gray-500 mb-1">Active Orders</p>
              <p className="text-2xl font-bold text-primary-600">{dashboard.activeOrders}</p>
              <p className="text-xs text-gray-500 mt-1">
                {dashboard.totalOrders} total orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-gray-500 mb-1">Fulfillment Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboard.fulfillmentRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-gray-500 mb-1">Trust Band</p>
              {dashboard.trustBand ? (
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="md">
                    {dashboard.trustBand}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {dashboard.trustBandTrend === 'up' && '↑'}
                    {dashboard.trustBandTrend === 'down' && '↓'}
                    {dashboard.trustBandTrend === 'stable' && '→'}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Not assigned</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Your operational performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">On-Time Delivery</span>
                  <span className="text-sm font-medium">{dashboard.onTimeDeliveryRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${dashboard.onTimeDeliveryRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Dispute Rate</span>
                  <span className="text-sm font-medium">{dashboard.disputeRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      dashboard.disputeRate < 5 ? 'bg-success-600' :
                      dashboard.disputeRate < 10 ? 'bg-warning-600' : 'bg-error-600'
                    }`}
                    style={{ width: `${Math.min(dashboard.disputeRate, 100)}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600">Average Order Value</p>
                <p className="text-xl font-bold text-gray-900">
                  ${dashboard.averageOrderValue.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Auction Performance</CardTitle>
              <CardDescription>Your auction participation stats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Bids</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboard.auctionStats.totalBids}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Winning Bids</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {dashboard.auctionStats.winningBids}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Win Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboard.auctionStats.winRate.toFixed(1)}%
                </p>
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600">Average Bid Amount</p>
                <p className="text-xl font-bold text-gray-900">
                  ${dashboard.auctionStats.averageBidAmount.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learning Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
            <CardDescription>Track your learning and unlock new capabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Courses Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboard.learningProgress.coursesCompleted}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Credentials Earned</p>
                <p className="text-2xl font-bold text-primary-600">
                  {dashboard.learningProgress.credentialsEarned}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Required Courses Remaining</p>
                <p className="text-2xl font-bold text-warning-600">
                  {dashboard.learningProgress.requiredCoursesRemaining}
                </p>
              </div>
            </div>
            {dashboard.learningProgress.requiredCoursesRemaining > 0 && (
              <div className="mt-4">
                <Link href="/learning">
                  <Button variant="primary">Complete Required Courses</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accounting Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Accounting Summary</CardTitle>
            <CardDescription>Financial overview and tax obligations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-success-600">
                  ${dashboard.accountingSummary.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-warning-600">
                  ${dashboard.accountingSummary.pendingPayments.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed Payments</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${dashboard.accountingSummary.completedPayments.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tax Obligations</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${dashboard.accountingSummary.taxObligations.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard.recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {dashboard.recentOrders.map((order) => (
                    <div key={order.id} className="border-b pb-3 last:border-0">
                      <p className="font-medium text-gray-900">{order.title}</p>
                      <p className="text-sm text-gray-600">
                        ${order.amount.toLocaleString()} • {order.status}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No recent orders</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Auctions</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard.recentAuctions.length > 0 ? (
                <div className="space-y-3">
                  {dashboard.recentAuctions.map((auction) => (
                    <div key={auction.id} className="border-b pb-3 last:border-0">
                      <p className="font-medium text-gray-900">
                        Bid: ${auction.price.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {auction.isWinning ? (
                          <Badge variant="success" size="sm">Winning</Badge>
                        ) : (
                          <Badge variant="outline" size="sm">Active</Badge>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No recent auction activity</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Learning</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard.recentLearning.length > 0 ? (
                <div className="space-y-3">
                  {dashboard.recentLearning.map((learning: any, index: number) => (
                    <div key={index} className="border-b pb-3 last:border-0">
                      <p className="font-medium text-gray-900">{learning.title}</p>
                      <p className="text-sm text-gray-600">
                        {learning.progress}% complete
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No recent learning activity</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

