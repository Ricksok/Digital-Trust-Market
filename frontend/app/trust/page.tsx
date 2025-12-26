'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrustScore, TrustEvent } from '@/lib/api/trust';
import { useTrustScore, useTrustHistory, useTrustExplanation } from '@/lib/queries';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function TrustPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'score' | 'history' | 'explain'>('score');

  const { data: scoreData, isLoading: scoreLoading, error: scoreError } = useTrustScore(user?.id || '');
  const { data: historyData, isLoading: historyLoading, error: historyError } = useTrustHistory(user?.id || '');
  const { data: explanationData, isLoading: explanationLoading, error: explanationError } = useTrustExplanation(user?.id || '');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, user, router]);

  // Extract data from responses
  const trustScore: TrustScore | null = scoreData?.data || null;
  const historyDataArray = historyData?.data?.events || historyData?.data || [];
  const history: TrustEvent[] = Array.isArray(historyDataArray) ? historyDataArray : [];
  const explanation = explanationData?.data || null;

  const isLoading = activeTab === 'score' ? scoreLoading : activeTab === 'history' ? historyLoading : explanationLoading;
  const error = activeTab === 'score' ? scoreError : activeTab === 'history' ? historyError : explanationError;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'High Trust';
    if (score >= 60) return 'Medium Trust';
    return 'Low Trust';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trust data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Trust Score</h1>
          <p className="mt-2 text-gray-600">View your trust score and history</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {(error as any)?.response?.data?.message || (error as Error)?.message || 'Failed to load trust data'}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('score')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'score'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Trust Score
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab('explain')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'explain'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Explanation
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'score' && trustScore && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center mb-8">
              <div className={`text-6xl font-bold ${getScoreColor(trustScore.trustScore)}`}>
                {trustScore.trustScore.toFixed(1)}
              </div>
              <p className="text-xl text-gray-600 mt-2">{getScoreLabel(trustScore.trustScore)}</p>
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {new Date(trustScore.lastCalculatedAt).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Identity Trust</p>
                <p className="text-2xl font-semibold">{trustScore.identityTrust.toFixed(1)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Transaction Trust</p>
                <p className="text-2xl font-semibold">{trustScore.transactionTrust.toFixed(1)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Financial Trust</p>
                <p className="text-2xl font-semibold">{trustScore.financialTrust.toFixed(1)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Performance Trust</p>
                <p className="text-2xl font-semibold">{trustScore.performanceTrust.toFixed(1)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Learning Trust</p>
                <p className="text-2xl font-semibold">{trustScore.learningTrust.toFixed(1)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Behavior Score</p>
                <p className="text-2xl font-semibold">{trustScore.behaviorScore.toFixed(1)}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Trust Score History</h2>
            {history.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No trust events found.</p>
                <p className="text-sm text-gray-400">Trust events are created when your trust score changes.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((event: any) => (
                  <div key={event.id} className="border-l-4 border-primary-500 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{event.eventType || 'TRUST_UPDATED'}</p>
                        <p className="text-sm text-gray-600">{event.explanation || 'Trust score updated'}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(event.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {event.scoreChange !== undefined && (
                        <div className={`text-lg font-semibold ${event.scoreChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {event.scoreChange >= 0 ? '+' : ''}{event.scoreChange.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'explain' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Trust Score Explanation</h2>
            {explanation ? (
              <>
                <div className="mb-6">
                  <p className="text-lg font-medium">Overall Score: {explanation.overallScore?.toFixed(1) || trustScore?.trustScore.toFixed(1) || 'N/A'}</p>
                  {explanation.behaviorScore !== undefined && (
                    <p className="text-sm text-gray-600">Behavior Score: {explanation.behaviorScore.toFixed(1)}</p>
                  )}
                </div>
                {explanation.breakdown && (
                  <div className="space-y-4">
                    {Object.entries(explanation.breakdown).map(([key, value]: [string, any]) => (
                      <div key={key} className="border-b pb-4">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="text-lg font-semibold">{value.score?.toFixed(1) || 0}</p>
                        </div>
                        {value.factors && Array.isArray(value.factors) && (
                          <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                            {value.factors.map((factor: string, index: number) => (
                              <li key={index}>{factor}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {!explanation.breakdown && (
                  <p className="text-gray-500">No breakdown data available.</p>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No explanation data available.</p>
                <p className="text-sm text-gray-400">Explanation data is generated when trust scores are calculated.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

