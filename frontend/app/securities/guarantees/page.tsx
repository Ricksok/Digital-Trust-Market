'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function GuaranteesPageContent() {
  const router = useRouter();
  
  // Redirect to the main guarantees page
  if (typeof window !== 'undefined') {
    router.replace('/guarantees');
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export default function SecuritiesGuaranteesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <GuaranteesPageContent />
    </Suspense>
  );
}


