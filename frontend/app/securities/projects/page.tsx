'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useProjects } from '@/lib/queries';
import { useAuthStore } from '@/lib/stores/auth.store';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card, { CardContent } from '@/components/ui/Card';
import { Project } from '@/lib/api/projects';

// Project Card Component
function ProjectCard({ project }: { project: Project }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const progressPercentage = project.targetAmount
    ? Math.min((project.currentAmount / project.targetAmount) * 100, 100)
    : 0;

  // Handle images - can be array or JSON string
  const projectImages: string[] = Array.isArray(project.images)
    ? project.images
    : typeof project.images === 'string'
    ? (() => {
        try {
          const parsed = JSON.parse(project.images);
          return Array.isArray(parsed) ? parsed : [project.images];
        } catch {
          return [project.images];
        }
      })()
    : [];

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

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
        <CardContent className="p-0">
          {/* Project Image */}
          <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
            {projectImages.length > 0 ? (
              <img
                src={projectImages[0]}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                <span className="text-4xl text-primary-300">📊</span>
              </div>
            )}
            {/* Status Badge */}
            <div className="absolute top-2 left-2">
              <Badge variant="outline" size="sm" className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
            </div>
            {/* Trust Badge */}
            {project.fundraiser?.trustBand && (
              <div className="absolute top-2 right-2">
                <Badge
                  variant={project.fundraiser.trustBand === 'T4' ? 'success' : 'outline'}
                  size="sm"
                >
                  {project.fundraiser.trustBand}
                </Badge>
              </div>
            )}
          </div>

          {/* Project Info */}
          <div className="p-4 space-y-2">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {project.title}
            </h3>
            
            <p className="text-xs text-gray-600 line-clamp-2">
              {project.description}
            </p>
            
            {/* Funding Progress */}
            <div className="space-y-1">
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-gray-600">
                  {formatCurrency(project.currentAmount || 0)} raised
                </span>
                <span className="text-gray-500">
                  of {formatCurrency(project.targetAmount || 0)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="text-xs text-gray-500">
                {progressPercentage.toFixed(1)}% funded
              </div>
            </div>

            {/* Fundraiser Info */}
            {project.fundraiser && (
              <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                by {project.fundraiser.firstName} {project.fundraiser.lastName}
              </p>
            )}

            {/* Category */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" size="sm">
                {project.category}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function SecuritiesProjectsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category') || null
  );
  const [selectedStatus, setSelectedStatus] = useState<string | null>(
    searchParams.get('status') || null
  );

  // Build query params for API
  const queryParams = useMemo(() => {
    const params: any = {
      limit: 100,
    };
    
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory) params.category = selectedCategory;
    if (selectedStatus) params.status = selectedStatus;
    
    return params;
  }, [searchQuery, selectedCategory, selectedStatus]);

  const { data, isLoading, error } = useProjects(queryParams);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedStatus) params.set('status', selectedStatus);
    
    const newUrl = params.toString() ? `/securities/projects?${params.toString()}` : '/securities/projects';
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, selectedCategory, selectedStatus, router]);

  const projects: Project[] = data?.data?.projects || data?.data || [];
  const projectsArray = Array.isArray(projects) ? projects : [];

  // Get unique categories
  const categories = Array.from(
    new Set(projectsArray.map((p) => p.category).filter(Boolean))
  );

  // Filter projects
  const filteredProjects = projectsArray.filter((project) => {
    const matchesSearch =
      !searchQuery ||
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || project.category === selectedCategory;
    const matchesStatus = !selectedStatus || project.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Securities Exchange</h1>
              <p className="text-gray-600 mt-1">Browse investment projects available for purchase</p>
            </div>
            {isAuthenticated && (
              <Link href="/projects/create">
                <Button variant="primary">Create Project</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus || ''}
              onChange={(e) => setSelectedStatus(e.target.value || null)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="APPROVED">Approved</option>
              <option value="FUNDED">Funded</option>
              <option value="COMPLETED">Completed</option>
            </select>

            {/* Clear Filters */}
            {(searchQuery || selectedCategory || selectedStatus) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                  setSelectedStatus(null);
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600">Failed to load projects</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg">
            <p className="text-gray-500 text-lg mb-2">No projects found</p>
            <p className="text-sm text-gray-400 mb-4">
              Try adjusting your search or filters
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
                setSelectedStatus(null);
              }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Showing {filteredProjects.length} of {projectsArray.length} projects
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SecuritiesProjectsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <SecuritiesProjectsPageContent />
    </Suspense>
  );
}

