'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Project } from '@/lib/api/projects';
import { useProjects } from '@/lib/queries';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function ProjectsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { data, isLoading, error } = useProjects();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Extract projects from response
  const projects: Project[] = data?.data?.projects || data?.data || [];
  const projectsArray = Array.isArray(projects) ? projects : [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      ACTIVE: 'bg-green-100 text-green-800',
      FUNDED: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-indigo-100 text-indigo-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <div className="flex gap-3">
              {isAuthenticated && user?.userType === 'FUNDRAISER' && (
                <Link
                  href="/projects/create"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Create Project
                </Link>
              )}
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {(error as any)?.response?.data?.message || (error as Error)?.message || 'Failed to load projects'}
            </div>
          )}

          {projectsArray.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <p className="text-gray-600">No projects found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectsArray.map((project) => {
                const progress = getProgressPercentage(
                  project.currentAmount,
                  project.targetAmount
                );
                let images: string[] = [];
                try {
                  if (typeof project.images === 'string') {
                    images = JSON.parse(project.images || '[]');
                  } else if (Array.isArray(project.images)) {
                    images = project.images;
                  }
                } catch {
                  images = [];
                }

                return (
                  <div
                    key={project.id}
                    className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {images.length > 0 && (
                      <div className="h-48 bg-gray-200 overflow-hidden">
                        <img
                          src={images[0]}
                          alt={project.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 truncate">
                          {project.title}
                        </h3>
                        <span
                          className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold">
                            {formatCurrency(project.currentAmount)} / {formatCurrency(project.targetAmount)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {progress.toFixed(1)}% funded
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm mb-4">
                        <div>
                          <span className="text-gray-600">Min Investment:</span>
                          <span className="font-semibold ml-1">
                            {formatCurrency(project.minInvestment)}
                          </span>
                        </div>
                        {project.maxInvestment && (
                          <div>
                            <span className="text-gray-600">Max:</span>
                            <span className="font-semibold ml-1">
                              {formatCurrency(project.maxInvestment)}
                            </span>
                          </div>
                        )}
                      </div>
                      <Link
                        href={`/projects/${project.id}`}
                        className="block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

