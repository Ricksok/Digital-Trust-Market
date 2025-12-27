'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useCreateCourse } from '@/lib/queries';
import { useAuthStore } from '@/lib/stores/auth.store';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  level: string;
  duration: number;
  publisher: string;
  contentUrl?: string;
  videoUrl?: string;
  price?: number;
  isPremium: boolean;
  currency: string;
  isRequired: boolean;
  credentialType?: string;
  expiryDays?: number;
}

const COURSE_CATEGORIES = [
  'VENDOR_ONBOARDING',
  'AUCTION_BEST_PRACTICES',
  'QUALITY_LOGISTICS',
  'TAX_INVOICING',
  'DISPUTE_PREVENTION',
  'COMPLIANCE',
];

const COURSE_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const PUBLISHERS = ['PLATFORM', 'PARTNER', 'REGULATOR'];
const CREDENTIAL_TYPES = ['CERTIFICATE', 'BADGE', 'CERTIFICATION'];

export default function CreateCoursePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const createCourse = useCreateCourse();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CourseFormData>({
    defaultValues: {
      level: 'BEGINNER',
      publisher: 'PLATFORM',
      currency: 'KES',
      isPremium: false,
      isRequired: false,
    },
  });

  const isPremium = watch('isPremium');

  const onSubmit = async (data: CourseFormData) => {
    try {
      setIsSubmitting(true);
      
      const courseData = {
        title: data.title,
        description: data.description || undefined,
        category: data.category,
        level: data.level,
        duration: parseInt(data.duration.toString()),
        publisher: data.publisher,
        contentUrl: data.contentUrl || undefined,
        videoUrl: data.videoUrl || undefined,
        price: data.isPremium ? (data.price || 0) : 0,
        isPremium: data.isPremium,
        currency: data.currency,
        isRequired: data.isRequired,
        credentialType: data.credentialType || undefined,
        expiryDays: data.expiryDays ? parseInt(data.expiryDays.toString()) : undefined,
      };

      const response = await createCourse.mutateAsync(courseData);
      
      if (response.data?.id) {
        router.push(`/learning/courses/${response.data.id}`);
      } else {
        router.push('/learning/admin');
      }
    } catch (error) {
      console.error('Error creating course:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'MARKETPLACE_ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Access denied. Admin privileges required.</p>
            <Button onClick={() => router.push('/learning')} className="mt-4">
              Back to Learning
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
            <p className="mt-2 text-gray-600">Fill in the details to create a new course</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/learning/admin')}>
            Cancel
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter course title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter course description"
                />
              </div>

              {/* Category and Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select category</option>
                    {COURSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Level *
                  </label>
                  <select
                    {...register('level', { required: 'Level is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {COURSE_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Duration and Publisher */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    {...register('duration', {
                      required: 'Duration is required',
                      min: { value: 1, message: 'Duration must be at least 1 minute' },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="60"
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Publisher *
                  </label>
                  <select
                    {...register('publisher', { required: 'Publisher is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {PUBLISHERS.map((pub) => (
                      <option key={pub} value={pub}>
                        {pub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('isPremium')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  This is a premium course (requires payment)
                </label>
              </div>

              {isPremium && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('price', {
                        required: isPremium ? 'Price is required for premium courses' : false,
                        min: { value: 0, message: 'Price must be 0 or greater' },
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="0.00"
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency *
                    </label>
                    <select
                      {...register('currency', { required: 'Currency is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="KES">KES</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content URLs */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video URL
                </label>
                <input
                  type="url"
                  {...register('videoUrl')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content URL
                </label>
                <input
                  type="url"
                  {...register('contentUrl')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://example.com/course-content"
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('isRequired')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Required course (must be completed for certain features)
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credential Type
                  </label>
                  <select
                    {...register('credentialType')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">None</option>
                    {CREDENTIAL_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credential Expiry (days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register('expiryDays')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Leave empty for no expiry"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/learning/admin')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                'Create Course'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

