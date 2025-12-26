'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { projectsApi } from '@/lib/api/projects';
import { useAuth } from '@/lib/hooks/useAuth';

interface ProjectFormData {
  title: string;
  description: string;
  category: string;
  targetAmount: number;
  minInvestment: number;
  maxInvestment?: number;
  startDate: string;
  endDate: string;
  images: string;
  documents: string;
}

const CATEGORIES = [
  'RENEWABLE_ENERGY',
  'AGRICULTURE',
  'REAL_ESTATE',
  'TECHNOLOGY',
  'HEALTHCARE',
  'EDUCATION',
  'SOCIAL_ENTERPRISE',
  'INFRASTRUCTURE',
];

export default function CreateProjectPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProjectFormData>();

  // Redirect if not authenticated or not a fundraiser
  if (!authLoading && (!isAuthenticated || user?.userType !== 'FUNDRAISER')) {
    router.push('/auth/login');
    return null;
  }

  const onSubmit = async (data: ProjectFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Parse images and documents from comma-separated strings
      const images = data.images
        ? data.images.split(',').map((url) => url.trim()).filter(Boolean)
        : [];
      const documents = data.documents
        ? data.documents.split(',').map((url) => url.trim()).filter(Boolean)
        : [];

      const projectData = {
        title: data.title,
        description: data.description,
        category: data.category,
        targetAmount: parseFloat(data.targetAmount.toString()),
        minInvestment: parseFloat(data.minInvestment.toString()),
        maxInvestment: data.maxInvestment
          ? parseFloat(data.maxInvestment.toString())
          : undefined,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
        images,
        documents,
      };

      const response = await projectsApi.create(projectData);

      if (response.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          router.push(`/projects/${response.data.id}`);
        }, 2000);
      } else {
        setError('Failed to create project');
      }
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Link
            href="/projects"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
          >
            ← Back to Projects
          </Link>

          <div className="bg-white shadow rounded-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Project</h1>

            {submitSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
                Project created successfully! Redirecting...
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  id="title"
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter project title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  {...register('category', { required: 'Category is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace('_', ' ')}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  {...register('description', { required: 'Description is required' })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Describe your project in detail..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Financial Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="targetAmount"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Target Amount (KES) *
                  </label>
                  <input
                    type="number"
                    id="targetAmount"
                    {...register('targetAmount', {
                      required: 'Target amount is required',
                      min: { value: 1, message: 'Amount must be greater than 0' },
                    })}
                    step="1000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="1000000"
                  />
                  {errors.targetAmount && (
                    <p className="mt-1 text-sm text-red-600">{errors.targetAmount.message}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="minInvestment"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Min Investment (KES) *
                  </label>
                  <input
                    type="number"
                    id="minInvestment"
                    {...register('minInvestment', {
                      required: 'Minimum investment is required',
                      min: { value: 1, message: 'Amount must be greater than 0' },
                    })}
                    step="1000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="10000"
                  />
                  {errors.minInvestment && (
                    <p className="mt-1 text-sm text-red-600">{errors.minInvestment.message}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="maxInvestment"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Max Investment (KES)
                  </label>
                  <input
                    type="number"
                    id="maxInvestment"
                    {...register('maxInvestment', {
                      min: { value: 1, message: 'Amount must be greater than 0' },
                      validate: (value) => {
                        const minInvestment = watch('minInvestment');
                        if (value && minInvestment && parseFloat(value.toString()) < parseFloat(minInvestment.toString())) {
                          return 'Max investment must be greater than min investment';
                        }
                        return true;
                      },
                    })}
                    step="1000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Optional"
                  />
                  {errors.maxInvestment && (
                    <p className="mt-1 text-sm text-red-600">{errors.maxInvestment.message}</p>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    {...register('startDate')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    {...register('endDate', {
                      validate: (value) => {
                        const startDate = watch('startDate');
                        if (value && startDate && new Date(value) < new Date(startDate)) {
                          return 'End date must be after start date';
                        }
                        return true;
                      },
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              {/* Images */}
              <div>
                <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                  Image URLs (comma-separated)
                </label>
                <input
                  type="text"
                  id="images"
                  {...register('images')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter image URLs separated by commas
                </p>
              </div>

              {/* Documents */}
              <div>
                <label htmlFor="documents" className="block text-sm font-medium text-gray-700 mb-2">
                  Document URLs (comma-separated)
                </label>
                <input
                  type="text"
                  id="documents"
                  {...register('documents')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://example.com/doc1.pdf, https://example.com/doc2.pdf"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter document URLs separated by commas
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-4">
                <Link
                  href="/projects"
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

