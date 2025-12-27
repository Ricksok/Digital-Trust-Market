'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card, { CardContent } from '@/components/ui/Card';

function LoansPageContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Loans</h1>
          <p className="text-gray-600 mt-2">
            Projects accepting loans as consideration (secured by guarantees)
          </p>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Coming Soon
            </h2>
            <p className="text-gray-600 mb-6">
              This page will display projects that accept loans as payment, secured by guarantees.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/securities/projects">
                <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                  Browse All Projects
                </button>
              </Link>
              <Link href="/securities/guarantees">
                <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                  View Guarantees
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoansPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <LoansPageContent />
    </Suspense>
  );
}


