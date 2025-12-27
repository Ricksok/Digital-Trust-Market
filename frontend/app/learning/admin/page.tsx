'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAllCourses, useCreateCourse, useUpdateCourse, usePublishCourse, useUnpublishCourse, useDeleteCourse } from '@/lib/queries';
import { useAuthStore } from '@/lib/stores/auth.store';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';
import { Course } from '@/lib/api/learning';

export default function AdminCourseManagementPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { data: courses, isLoading } = useAllCourses();
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const publishCourse = usePublishCourse();
  const unpublishCourse = useUnpublishCourse();
  const deleteCourse = useDeleteCourse();

  const [isCreating, setIsCreating] = useState(false);
  const [editingCourse, setEditingCourse] = useState<string | null>(null);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (user && user.role !== 'ADMIN' && user.role !== 'MARKETPLACE_ADMIN') {
      router.push('/learning');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || (user && user.role !== 'ADMIN' && user.role !== 'MARKETPLACE_ADMIN')) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const handlePublish = (courseId: string) => {
    publishCourse.mutate(courseId);
  };

  const handleUnpublish = (courseId: string) => {
    unpublishCourse.mutate(courseId);
  };

  const handleDelete = (courseId: string) => {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      deleteCourse.mutate(courseId);
    }
  };

  const publishedCourses = courses?.filter((c) => c.status === 'PUBLISHED') || [];
  const draftCourses = courses?.filter((c) => c.status === 'DRAFT') || [];

  return (
    <div className="page-container">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Course Management</h1>
            <p className="mt-2 text-gray-600">Manage all courses including drafts</p>
          </div>
          <div className="flex gap-3">
            <Link href="/learning">
              <Button variant="outline">Back to Learning</Button>
            </Link>
            <Button variant="primary" onClick={() => setIsCreating(true)}>
              Create Course
            </Button>
          </div>
        </div>

        {/* Create Course Form */}
        {isCreating && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Course</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Course creation form will be implemented here. For now, use the API directly or create courses via the backend.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Published Courses */}
        {publishedCourses.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Published Courses</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <Badge variant="success" size="sm">Published</Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{course.duration} min</span>
                        <span>•</span>
                        <span>{course.level}</span>
                        <span>•</span>
                        <Badge variant="outline" size="sm">{course.category}</Badge>
                      </div>
                      {(course as any).enrollmentCount !== undefined && (
                        <p className="text-sm text-gray-600">
                          Enrollments: {(course as any).enrollmentCount}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnpublish(course.id)}
                          disabled={unpublishCourse.isPending}
                        >
                          Unpublish
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(course.id)}
                          disabled={deleteCourse.isPending}
                        >
                          Delete
                        </Button>
                        <Link href={`/learning/courses/${course.id}`} className="flex-1">
                          <Button variant="primary" size="sm" fullWidth>
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Draft Courses */}
        {draftCourses.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Draft Courses</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {draftCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <Badge variant="warning" size="sm">Draft</Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{course.duration} min</span>
                        <span>•</span>
                        <span>{course.level}</span>
                        <span>•</span>
                        <Badge variant="outline" size="sm">{course.category}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handlePublish(course.id)}
                          disabled={publishCourse.isPending}
                        >
                          Publish
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(course.id)}
                          disabled={deleteCourse.isPending}
                        >
                          Delete
                        </Button>
                        <Link href={`/learning/courses/${course.id}`} className="flex-1">
                          <Button variant="outline" size="sm" fullWidth>
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!courses || courses.length === 0) && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500 mb-4">No courses found.</p>
              <Button variant="primary" onClick={() => setIsCreating(true)}>
                Create Your First Course
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

