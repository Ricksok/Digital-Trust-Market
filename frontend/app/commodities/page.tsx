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

function CommodityCard({ product }: { product: Project }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const productImages: string[] = Array.isArray(product.images)
    ? product.images
    : typeof product.images === 'string'
    ? (() => {
        try {
          const parsed = JSON.parse(product.images);
          return Array.isArray(parsed) ? parsed : [product.images];
        } catch {
          return [product.images];
        }
      })()
    : [];

  return (
    <Link href={`/marketplace/products/${product.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
        <CardContent className="p-0">
          <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
            {productImages.length > 0 ? (
              <img
                src={productImages[0]}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                <span className="text-4xl text-primary-300">🌾</span>
              </div>
            )}
            {product.fundraiser?.trustBand && (
              <div className="absolute top-2 right-2">
                <Badge
                  variant={product.fundraiser.trustBand === 'T4' ? 'success' : 'outline'}
                  size="sm"
                >
                  {product.fundraiser.trustBand}
                </Badge>
              </div>
            )}
          </div>

          <div className="p-4 space-y-2">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {product.title}
            </h3>
            
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(product.minInvestment)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{product.category}</span>
              {product.fundraiser && (
                <span className="truncate">
                  {product.fundraiser.firstName} {product.fundraiser.lastName}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function CommoditiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  
  const category = searchParams?.get('category') || 'AGRICULTURE';
  const search = searchParams?.get('search') || '';

  const { data, isLoading, error } = useProjects({
    category,
    status: 'ACTIVE',
    limit: 100,
  });

  const projects = data?.data || data || [];
  
  const filteredProjects = useMemo(() => {
    if (!search) return projects;
    const searchLower = search.toLowerCase();
    return projects.filter((p: Project) =>
      p.title.toLowerCase().includes(searchLower) ||
      p.description?.toLowerCase().includes(searchLower)
    );
  }, [projects, search]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Commodities Marketplace</h1>
          <p className="text-gray-600">Browse and purchase agricultural commodities and raw materials</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {(error as any)?.response?.data?.message || (error as Error)?.message || 'Failed to load commodities'}
          </div>
        )}

        {filteredProjects.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500">No commodities found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((product: Project) => (
              <CommodityCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommoditiesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <CommoditiesContent />
    </Suspense>
  );
}

