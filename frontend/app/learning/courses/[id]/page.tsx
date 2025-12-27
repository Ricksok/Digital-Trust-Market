'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCourse, useEnrollInCourse, useUpdateProgress, useCompleteCourse } from '@/lib/queries';
import { useAuthStore } from '@/lib/stores/auth.store';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { getYouTubeEmbedUrl, isYouTubeUrl } from '@/lib/utils/youtube';

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const courseId = params?.id as string;
  
  const { data: course, isLoading } = useCourse(courseId);
  const enroll = useEnrollInCourse();
  const updateProgress = useUpdateProgress();
  const completeCourse = useCompleteCourse();
  
  const [progress, setProgress] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Update progress from enrollment
  useEffect(() => {
    if (course && (course as any).enrollment) {
      const enrollment = (course as any).enrollment;
      setProgress(enrollment.progress || 0);
    }
  }, [course]);

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Course not found</p>
            <Button onClick={() => router.push('/learning')} className="mt-4">
              Back to Learning
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const enrollment = (course as any).enrollment;
  const isEnrolled = course.isEnrolled || !!enrollment;
  const isCompleted = course.isCompleted || enrollment?.status === 'COMPLETED';
  const hasCredential = course.hasCredential || enrollment?.credentials?.length > 0;

  const handleEnroll = () => {
    enroll.mutate(courseId, {
      onSuccess: () => {
        router.refresh();
      },
    });
  };

  const handleProgressUpdate = (newProgress: number) => {
    if (!enrollment) return;
    
    setProgress(newProgress);
    updateProgress.mutate({
      enrollmentId: enrollment.id,
      progress: newProgress,
      status: newProgress === 100 ? 'IN_PROGRESS' : undefined,
    });
  };

  const handleComplete = () => {
    if (!enrollment) return;
    
    completeCourse.mutate(
      {
        enrollmentId: enrollment.id,
      },
      {
        onSuccess: () => {
          router.push('/learning');
        },
      }
    );
  };

  return (
    <div className="page-container">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Course Header */}
        <div>
          <Button
            variant="outline"
            onClick={() => router.push('/learning')}
            className="mb-4"
          >
            ← Back to Learning
          </Button>
          
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              {course.description && (
                <p className="mt-2 text-gray-600">{course.description}</p>
              )}
            </div>
            {course.isRequired && (
              <Badge variant="warning" size="md">Required</Badge>
            )}
          </div>

          <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
            <span>{course.duration} minutes</span>
            <span>•</span>
            <span>{course.level}</span>
            <span>•</span>
            <Badge variant="outline" size="sm">{course.category}</Badge>
          </div>
        </div>

        {/* Enrollment Status */}
        {isEnrolled && (
          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary-600 h-3 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {!isCompleted && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleProgressUpdate(Math.max(0, progress - 10))}
                      disabled={progress === 0}
                    >
                      -10%
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleProgressUpdate(Math.min(100, progress + 10))}
                      disabled={progress === 100}
                    >
                      +10%
                    </Button>
                    <div className="flex-1" />
                    {progress === 100 && (
                      <Button variant="primary" onClick={handleComplete}>
                        Complete Course
                      </Button>
                    )}
                  </div>
                )}

                {isCompleted && (
                  <div className="flex items-center gap-2">
                    <Badge variant="success" size="md">Completed</Badge>
                    {hasCredential && (
                      <Badge variant="primary" size="md">Credential Earned</Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Course Content */}
        <Card>
          <CardHeader>
            <CardTitle>Course Content</CardTitle>
          </CardHeader>
          <CardContent>
            {course.videoUrl || course.contentUrl ? (
              <div className="space-y-6">
                {course.videoUrl && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Video Content</p>
                    {isYouTubeUrl(course.videoUrl) ? (
                      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                        <iframe
                          src={getYouTubeEmbedUrl(course.videoUrl) || course.videoUrl}
                          title="Course Video"
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <a
                          href={course.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline"
                        >
                          Watch Video →
                        </a>
                      </div>
                    )}
                  </div>
                )}
                {course.contentUrl && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Course Materials</p>
                    <a
                      href={course.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline inline-flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Open Course Content →
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Course content will be available soon.</p>
            )}
          </CardContent>
        </Card>

        {/* Enrollment CTA */}
        {!isEnrolled && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-lg font-semibold text-gray-900 mb-4">
                Ready to start learning?
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={handleEnroll}
                disabled={enroll.isPending}
              >
                {enroll.isPending ? 'Enrolling...' : 'Enroll in Course'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

