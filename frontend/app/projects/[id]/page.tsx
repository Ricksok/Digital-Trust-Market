'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Project } from '@/lib/api/projects';
import { useProject, useCreateInvestment } from '@/lib/queries';
import { useAuthStore } from '@/lib/stores/auth.store';
import SecuritiesExchangeModal, { SelectedSecuritiesOption } from '@/components/projects/SecuritiesExchangeModal';
import Button from '@/components/ui/Button';

interface ProjectDetail extends Project {
  fundraiser?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    isVerified: boolean;
  };
  investments?: Array<{
    id: string;
    amount: number;
    status: string;
    investor?: {
      firstName?: string;
      lastName?: string;
    };
  }>;
  _count?: {
    investments: number;
  };
  metadata?: string | any; // Can be string (JSON) or parsed object
  startDate?: string | Date; // Optional start date
  endDate?: string | Date; // Optional end date
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const projectId = params?.id as string;

  const { data: projectResponse, isLoading, error } = useProject(projectId || '');
  const createInvestment = useCreateInvestment();
  
  const [investAmount, setInvestAmount] = useState('');
  const [investError, setInvestError] = useState<string | null>(null);
  const [investSuccess, setInvestSuccess] = useState(false);
  const [showSecuritiesModal, setShowSecuritiesModal] = useState(false);
  const [selectedSecuritiesOptions, setSelectedSecuritiesOptions] = useState<SelectedSecuritiesOption[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Extract project from response
  const project: ProjectDetail | null = projectResponse?.data || null;

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'KES 0';
    }
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  const handleInvestNowClick = () => {
    if (!project || !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (project.status !== 'APPROVED' && project.status !== 'ACTIVE') {
      setInvestError('This project is not accepting investments');
      return;
    }

    // Show securities exchange modal
    setShowSecuritiesModal(true);
  };

  const handleSecuritiesOptionSelect = (options: SelectedSecuritiesOption[]) => {
    setSelectedSecuritiesOptions(options);
    setShowSecuritiesModal(false);
    
    // Calculate total amount from selected options
    const totalAmount = options.reduce((sum, opt) => sum + (opt.amount || 0), 0);
    if (totalAmount > 0) {
      setInvestAmount(totalAmount.toString());
    }
    
    // Focus on amount input if not filled
    if (!investAmount) {
      setTimeout(() => {
        document.getElementById('amount')?.focus();
      }, 100);
    }
  };

  const handleInvestSubmit = () => {
    if (!project || !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Clear previous errors
    setInvestError(null);
    setInvestSuccess(false);

    const amount = parseFloat(investAmount);
    if (isNaN(amount) || amount <= 0) {
      setInvestError('Please enter a valid amount');
      return;
    }

    // Check if project has required properties
    if (!project.minInvestment) {
      setInvestError('Project investment limits are not available');
      return;
    }

    if (amount < project.minInvestment) {
      setInvestError(`Minimum investment is ${formatCurrency(project.minInvestment)}`);
      return;
    }

    if (project.maxInvestment && amount > project.maxInvestment) {
      setInvestError(`Maximum investment is ${formatCurrency(project.maxInvestment)}`);
      return;
    }

    if (project.status !== 'APPROVED' && project.status !== 'ACTIVE') {
      setInvestError('This project is not accepting investments');
      return;
    }

    // Build notes from selected securities options
    const securitiesNotes = selectedSecuritiesOptions.length > 0
      ? selectedSecuritiesOptions.map(opt => {
          if (opt.type === 'GUARANTEE') {
            return opt.label;
          }
          return `${opt.label}: ${formatCurrency(opt.amount || 0)}`;
        }).join('; ')
      : '';
    
    const notes = securitiesNotes
      ? `Investment in ${project.title} via ${securitiesNotes}`
      : `Investment in ${project.title}`;

    createInvestment.mutate(
      {
        projectId: project.id,
        amount,
        notes,
      },
      {
        onSuccess: () => {
          setInvestSuccess(true);
          setInvestAmount('');
          setSelectedSecuritiesOptions([]);
          // Redirect to investments page after 2 seconds
          setTimeout(() => {
            router.push('/investments');
          }, 2000);
        },
        onError: (err: any) => {
          const errorMessage = err.response?.data?.message || 
                              err.response?.data?.error?.message ||
                              err.message || 
                              'Failed to create investment';
          setInvestError(errorMessage);
        },
      }
    );
  };

  const handleInvest = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Always show modal first to select securities option
    if (selectedSecuritiesOptions.length === 0) {
      handleInvestNowClick();
      return;
    }
    
    // If options are selected, proceed with investment
    handleInvestSubmit();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    const errorMessage = (error as any)?.response?.data?.message || 
                        (error as Error)?.message || 
                        'The project you are looking for does not exist.';
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <Link
            href="/projects"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const progress = getProgressPercentage(
    project.currentAmount || 0,
    project.targetAmount || 1
  );
  let images: string[] = [];
  let documents: string[] = [];
  let metadata: any = {};

  try {
    if (typeof project.images === 'string') {
      images = JSON.parse(project.images || '[]');
    } else if (Array.isArray(project.images)) {
      images = project.images;
    }
  } catch {
    images = [];
  }

  try {
    if (typeof project.documents === 'string') {
      documents = JSON.parse(project.documents || '[]');
    } else if (Array.isArray(project.documents)) {
      documents = project.documents;
    }
  } catch {
    documents = [];
  }

  try {
    if (typeof project.metadata === 'string') {
      metadata = JSON.parse(project.metadata || '{}');
    } else if (project.metadata) {
      metadata = project.metadata;
    }
  } catch {
    metadata = {};
  }

  const canInvest = isAuthenticated && 
    user?.userType === 'INVESTOR' && 
    (project.status === 'APPROVED' || project.status === 'ACTIVE');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Link
            href="/projects"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
          >
            ← Back to Projects
          </Link>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Project Images */}
            {images.length > 0 && (
              <div className="h-96 bg-gray-200 overflow-hidden">
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

            <div className="p-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-600 text-lg">{project.category}</p>
                </div>
              </div>

              {/* Funding Progress */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Funding Progress</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(project.currentAmount || 0)} / {formatCurrency(project.targetAmount || 0)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div
                    className="bg-primary-600 h-4 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{progress.toFixed(1)}% funded</span>
                  <span>{project._count?.investments || 0} investments</span>
                </div>
              </div>

              {/* Project Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Minimum Investment</h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(project.minInvestment || 0)}
                  </p>
                </div>
                {project.maxInvestment && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Maximum Investment</h3>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(project.maxInvestment)}
                    </p>
                  </div>
                )}
                {project.startDate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Start Date</h3>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(typeof project.startDate === 'string' ? project.startDate : project.startDate.toISOString())}
                    </p>
                  </div>
                )}
                {project.endDate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">End Date</h3>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(typeof project.endDate === 'string' ? project.endDate : project.endDate.toISOString())}
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
              </div>

              {/* Fundraiser Info */}
              {project.fundraiser && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Fundraiser</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium text-gray-900">
                      {project.fundraiser.firstName} {project.fundraiser.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{project.fundraiser.email}</p>
                    {project.fundraiser.isVerified && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Documents */}
              {documents.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Documents</h2>
                  <div className="space-y-2">
                    {documents.map((doc, index) => (
                      <a
                        key={index}
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-primary-600 hover:text-primary-700 underline"
                      >
                        Document {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Investment Form */}
              {canInvest && (
                <div className="border-t pt-6 mt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Make an Investment</h2>
                  {investSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                      <p className="font-semibold">Investment created successfully!</p>
                      <p className="text-sm mt-1 mb-2">Redirecting to your investments in 2 seconds...</p>
                      <Link
                        href="/investments"
                        className="text-sm underline font-medium hover:text-green-800"
                      >
                        View my investments now →
                      </Link>
                    </div>
                  )}
                  {investError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                      {investError}
                    </div>
                  )}
                  <form onSubmit={handleInvest} className="space-y-4">
                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                        Investment Amount (KES)
                      </label>
                      <input
                        type="number"
                        id="amount"
                        value={investAmount}
                        onChange={(e) => setInvestAmount(e.target.value)}
                        min={project.minInvestment}
                        max={project.maxInvestment || undefined}
                        step="1000"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        placeholder={`Min: ${formatCurrency(project.minInvestment || 0)}`}
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Minimum: {formatCurrency(project.minInvestment || 0)}
                        {project.maxInvestment && ` • Maximum: ${formatCurrency(project.maxInvestment)}`}
                      </p>
                    </div>
                    
                    {selectedSecuritiesOptions.length > 0 && (
                      <div className="space-y-2">
                        <div className="p-3 bg-primary-50 border border-primary-200 rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-primary-900">
                              Selected Securities Options ({selectedSecuritiesOptions.length})
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSecuritiesOptions([]);
                                setShowSecuritiesModal(true);
                              }}
                              className="text-xs text-primary-600 hover:text-primary-800 underline"
                            >
                              Change
                            </button>
                          </div>
                          <div className="space-y-2">
                            {selectedSecuritiesOptions.map((option) => (
                              <div key={option.id} className="flex items-center justify-between text-xs bg-white p-2 rounded">
                                <span className="text-gray-700">
                                  {option.icon} {option.label}
                                </span>
                                {option.type === 'GUARANTEE' ? (
                                  <span className="text-xs text-gray-500 italic">No amount required</span>
                                ) : (
                                  <span className="font-semibold text-primary-900">
                                    {formatCurrency(option.amount || 0)}
                                  </span>
                                )}
                              </div>
                            ))}
                            {selectedSecuritiesOptions.some(opt => opt.type !== 'GUARANTEE' && opt.amount) && (
                              <div className="flex items-center justify-between pt-2 border-t border-primary-200 text-sm font-semibold">
                                <span className="text-primary-900">Total:</span>
                                <span className="text-primary-900">
                                  {formatCurrency(selectedSecuritiesOptions.reduce((sum, opt) => {
                                    if (opt.type === 'GUARANTEE') return sum;
                                    return sum + (opt.amount || 0);
                                  }, 0))}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      {selectedSecuritiesOptions.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleInvestNowClick}
                          className="flex-1"
                        >
                          Change Options
                        </Button>
                      )}
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={createInvestment.isPending || !investAmount}
                        className={selectedSecuritiesOptions.length > 0 ? 'flex-1' : 'w-full'}
                      >
                        {createInvestment.isPending ? 'Processing...' : 'Invest Now'}
                      </Button>
                    </div>
                    {selectedSecuritiesOptions.length === 0 && (
                      <p className="text-xs text-center text-gray-500 mt-2">
                        Click "Invest Now" to choose your securities exchange options
                      </p>
                    )}
                  </form>
                </div>
              )}

              {!isAuthenticated && (
                <div className="border-t pt-6 mt-6 text-center">
                  <p className="text-gray-600 mb-4">Please log in to invest in this project</p>
                  <Link
                    href="/auth/login"
                    className="inline-block px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Log In to Invest
                  </Link>
                </div>
              )}

              {isAuthenticated && user?.userType !== 'INVESTOR' && (
                <div className="border-t pt-6 mt-6 text-center">
                  <p className="text-gray-600">Only investors can make investments</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Securities Exchange Modal */}
      <SecuritiesExchangeModal
        isOpen={showSecuritiesModal}
        onClose={() => setShowSecuritiesModal(false)}
        onSelect={handleSecuritiesOptionSelect}
        projectId={projectId}
        totalAmount={investAmount ? parseFloat(investAmount) : undefined}
        minInvestment={project?.minInvestment}
        maxInvestment={project?.maxInvestment}
      />
    </div>
  );
}

