'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCourses, useLearningProfile } from '@/lib/queries';
import { useAuthStore } from '@/lib/stores/auth.store';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';

export default function LearningPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { data: courses, isLoading: coursesLoading } = useCourses();
  const { data: profile, isLoading: profileLoading } = useLearningProfile();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (coursesLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const requiredCourses = profile?.requiredCourses.filter((c) => !c.isCompleted) || [];
  const enrolledCourses = courses?.filter((c) => c.isEnrolled && !c.isCompleted) || [];
  const completedCourses = courses?.filter((c) => c.isCompleted) || [];

  return (
    <div className="page-container">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Learning Exchange</h1>
          <p className="mt-2 text-gray-600">
            Build your capabilities and unlock new features through learning
          </p>
        </div>

        {/* Learning Progress Summary */}
        {profile && (
          <Card>
            <CardHeader>
              <CardTitle>Your Learning Progress</CardTitle>
              <CardDescription>Track your learning journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Courses Completed</p>
                  <p className="text-3xl font-bold text-primary-600">
                    {profile.totalCoursesCompleted}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Credentials Earned</p>
                  <p className="text-3xl font-bold text-success-600">
                    {profile.totalCredentialsEarned}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Learning Hours</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {profile.totalLearningHours.toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Features Unlocked</p>
                  <p className="text-3xl font-bold text-warning-600">
                    {profile.unlockedFeatures.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Required Courses */}
        {requiredCourses.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Required Courses</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requiredCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <Badge variant="warning" size="sm">Required</Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{course.duration} min</span>
                        <span>•</span>
                        <span>{course.level}</span>
                      </div>
                      {course.isEnrolled ? (
                        <div>
                          <div className="flex justify-between mb-1 text-sm">
                            <span>Progress</span>
                            <span>{course.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                          <Link href={`/learning/courses/${course.id}`}>
                            <Button variant="primary" fullWidth className="mt-3">
                              Continue Learning
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <Link href={`/learning/courses/${course.id}`}>
                          <Button variant="primary" fullWidth>
                            Enroll Now
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Enrolled Courses */}
        {enrolledCourses.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">In Progress</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <Link href={`/learning/courses/${course.id}`}>
                        <Button variant="primary" fullWidth className="mt-3">
                          Continue Learning
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Courses */}
        {courses && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Available Courses</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses
                .filter((c) => !c.isEnrolled)
                .map((course) => (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        {course.isRequired && (
                          <Badge variant="warning" size="sm">Required</Badge>
                        )}
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
                        <Link href={`/learning/courses/${course.id}`}>
                          <Button variant="outline" fullWidth>
                            View Course
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Completed Courses */}
        {completedCourses.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Completed Courses</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <Badge variant="success" size="sm">Completed</Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {course.hasCredential && (
                        <Badge variant="primary" size="sm">Credential Earned</Badge>
                      )}
                      <Link href={`/learning/courses/${course.id}`}>
                        <Button variant="outline" fullWidth>
                          View Certificate
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

