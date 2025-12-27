'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStatus, useUserProfile } from '@/lib/queries';
import { useAuthStore } from '@/lib/stores/auth.store';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
import KYCUpload from '@/components/onboarding/KYCUpload';
import BusinessVerificationForm from '@/components/onboarding/BusinessVerificationForm';
import MembershipLinkForm from '@/components/onboarding/MembershipLinkForm';

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { data: status, isLoading: statusLoading } = useOnboardingStatus();
  const { data: profile, isLoading: profileLoading } = useUserProfile();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Redirect to dashboard if onboarding is complete
  useEffect(() => {
    if (status?.completed) {
      router.push('/dashboard');
    }
  }, [status?.completed, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (statusLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!status || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Failed to load onboarding status</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStep = status.currentStep;
  const isIndividual = profile.entityType === 'INDIVIDUAL';
  const isCompany = profile.entityType === 'COMPANY';
  const needsMembership = profile.entityType === 'SACCO' || profile.roles.includes('COOP_ADMIN');

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Onboarding</h1>
          <p className="mt-2 text-gray-600">
            Follow the steps below to verify your identity and activate your account
          </p>
        </div>

        {/* Progress Indicator */}
        <OnboardingProgress status={status} />

        {/* Trust Band & Caps Display */}
        {(profile.trustBand || profile.transactionCap) && (
          <Card>
            <CardHeader>
              <CardTitle>Your Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.trustBand && (
                <div>
                  <p className="text-sm text-gray-600">Trust Band</p>
                  <p className="text-2xl font-bold text-primary-600">{profile.trustBand}</p>
                </div>
              )}
              {profile.transactionCap && (
                <div>
                  <p className="text-sm text-gray-600">Transaction Cap</p>
                  <p className="text-2xl font-bold text-primary-600">
                    ${profile.transactionCap.toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step Content */}
        <div className="space-y-6">
          {/* KYC Step - For Individuals */}
          {isIndividual && (
            <Card>
              <CardHeader>
                <CardTitle>Identity Verification (KYC)</CardTitle>
              </CardHeader>
              <CardContent>
                <KYCUpload />
              </CardContent>
            </Card>
          )}

          {/* Business Verification Step - For Companies */}
          {isCompany && (
            <Card>
              <CardHeader>
                <CardTitle>Business Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <BusinessVerificationForm />
              </CardContent>
            </Card>
          )}

          {/* Membership Link Step - For SACCO/Co-op */}
          {needsMembership && (
            <Card>
              <CardHeader>
                <CardTitle>Membership Linkage</CardTitle>
              </CardHeader>
              <CardContent>
                <MembershipLinkForm />
              </CardContent>
            </Card>
          )}

          {/* Completion Message */}
          {status.completed && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-lg font-semibold text-green-600 mb-4">
                  Onboarding Complete! 🎉
                </p>
                <Button
                  onClick={() => router.push('/dashboard')}
                  variant="primary"
                >
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}


