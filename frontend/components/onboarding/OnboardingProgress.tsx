'use client';

import { OnboardingStatus } from '@/lib/api/onboarding';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface OnboardingProgressProps {
  status: OnboardingStatus;
}

export default function OnboardingProgress({ status }: OnboardingProgressProps) {
  const getStepStatus = (stepName: string) => {
    const step = status.steps.find((s) => s.name === stepName);
    return step?.status || 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'green';
      case 'in_progress':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Onboarding Progress</h3>
          <div className="space-y-3">
            {status.steps.map((step, index) => (
              <div key={step.step} className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <Badge
                    variant={getStatusColor(step.status) as any}
                    size="sm"
                  >
                    {index + 1}
                  </Badge>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{step.name}</p>
                  {step.completedAt && (
                    <p className="text-xs text-gray-500">
                      Completed: {new Date(step.completedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <Badge
                    variant={getStatusColor(step.status) as any}
                    size="sm"
                  >
                    {step.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Current Step: <span className="font-semibold">{status.currentStep}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


