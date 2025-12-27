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
import ProductFilters, { FilterState } from '@/components/marketplace/ProductFilters';
import { Project } from '@/lib/api/projects';

// Product Card Component (Amazon-inspired)
function ProductCard({ product }: { product: Project }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const progressPercentage = product.targetAmount
    ? Math.min((product.currentAmount / product.targetAmount) * 100, 100)
    : 0;

  // Handle images - can be array or JSON string
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
          {/* Product Image */}
          <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
            {productImages.length > 0 ? (
              <img
                src={productImages[0]}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
                <span className="text-4xl text-primary-300">📦</span>
              </div>
            )}
            {/* Trust Badge */}
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

          {/* Product Info */}
          <div className="p-4 space-y-2">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {product.title}
            </h3>
            
            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(product.targetAmount || 0)}
              </span>
              {product.currentAmount > 0 && (
                <span className="text-xs text-gray-500">
                  {progressPercentage.toFixed(0)}% funded
                </span>
              )}
            </div>

            {/* Progress Bar */}
            {product.targetAmount && product.currentAmount > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-primary-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            )}

            {/* Vendor Info */}
            {product.fundraiser && (
              <p className="text-xs text-gray-500">
                by {product.fundraiser.firstName} {product.fundraiser.lastName}
              </p>
            )}

            {/* Rating/Trust Indicator */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-yellow-400">⭐</span>
              <span className="text-gray-600">
                {product.fundraiser?.trustBand || 'New'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function MarketplacePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  
  // Initialize filters from URL params
  const initialFilters: FilterState = {
    category: searchParams.get('category') || null,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : null,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null,
    trustBand: searchParams.get('trustBand') || null,
    sortBy: searchParams.get('sortBy') || 'newest',
  };
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Build query params for API
  const queryParams = useMemo(() => {
    const params: any = {
      marketplaceOnly: true,
      limit: 100,
    };
    
    if (searchQuery) params.search = searchQuery;
    if (filters.category) params.category = filters.category;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.trustBand) params.trustBand = filters.trustBand;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    
    return params;
  }, [searchQuery, filters]);

  const { data, isLoading, error } = useProjects(queryParams);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (filters.category) params.set('category', filters.category);
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.trustBand) params.set('trustBand', filters.trustBand);
    if (filters.sortBy && filters.sortBy !== 'newest') params.set('sortBy', filters.sortBy);
    
    const newUrl = params.toString() ? `/marketplace?${params.toString()}` : '/marketplace';
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, filters, router]);

  const projects: Project[] = data?.data?.projects || data?.data || [];
  const projectsArray = Array.isArray(projects) ? projects : [];

  // Define goods/services categories
  const goodsServicesCategories = [
    'Agriculture & Food',
    'Services',
    'Retail',
    'Technology',
    'Manufacturing',
    'Healthcare',
    'Education',
    'Transportation',
  ];

  // Filter to only show goods/services (not investment projects)
  const goodsServicesProducts = projectsArray.filter((product) => {
    const isGoodsOrService = goodsServicesCategories.includes(product.category);
    
    let hasMarketplaceMetadata = false;
    if (product.metadata) {
      try {
        const metadata = typeof product.metadata === 'string' 
          ? JSON.parse(product.metadata) 
          : product.metadata;
        hasMarketplaceMetadata = metadata?.productType === 'MARKETPLACE' || metadata?.isGoodsOrService === true;
      } catch (e) {
        // Ignore parse errors
      }
    }
    
    return isGoodsOrService || hasMarketplaceMetadata;
  });

  // Categories from goods/services products only
  const categories = Array.from(
    new Set(goodsServicesProducts.map((p) => p.category).filter(Boolean))
  );

  // Additional client-side filtering (if needed)
  const filteredProducts = goodsServicesProducts.filter((product) => {
    // Price range filter (client-side fallback)
    if (filters.minPrice && product.targetAmount < filters.minPrice) return false;
    if (filters.maxPrice && product.targetAmount > filters.maxPrice) return false;
    
    // Trust band filter (client-side fallback)
    if (filters.trustBand && product.fundraiser?.trustBand !== filters.trustBand) return false;
    
    return true;
  });

  // Featured products (top funded)
  const featuredProducts = [...goodsServicesProducts]
    .sort((a, b) => (b.currentAmount || 0) - (a.currentAmount || 0))
    .slice(0, 4);

  // Best sellers (most funded)
  const bestSellers = [...goodsServicesProducts]
    .filter((p) => p.status === 'ACTIVE' || p.status === 'FUNDED')
    .sort((a, b) => (b.currentAmount || 0) - (a.currentAmount || 0))
    .slice(0, 8);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      category: null,
      minPrice: null,
      maxPrice: null,
      trustBand: null,
      sortBy: 'newest',
    });
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Search (Amazon-style) */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                DT
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                Marketplace
              </span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <button className="absolute right-0 top-0 bottom-0 px-6 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 transition-colors">
                  Search
                </button>
              </div>
            </div>

            {/* Cart/Account */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    Account
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 overflow-x-auto py-3">
            <button
              onClick={() => handleFiltersChange({ ...filters, category: null })}
              className={`whitespace-nowrap px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                !filters.category
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleFiltersChange({ ...filters, category })}
                className={`whitespace-nowrap px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filters.category === category
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600">Failed to load products</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <ProductFilters
                categories={categories}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onReset={handleResetFilters}
              />
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {/* Hero Section - Featured Deals */}
              {!searchQuery && !filters.category && featuredProducts.length > 0 && (
                <section className="mb-12">
                  <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 text-white mb-6">
                    <h2 className="text-2xl font-bold mb-2">Featured Deals</h2>
                    <p className="text-primary-100">Top funded projects with great opportunities</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </section>
              )}

              {/* Best Sellers Section */}
              {!searchQuery && !filters.category && bestSellers.length > 0 && (
                <section className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Best Sellers</h2>
                    <Link href="/marketplace?sortBy=popularity">
                      <Button variant="ghost" size="sm">
                        See more
                      </Button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bestSellers.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </section>
              )}

              {/* All Products */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {filters.category ? `${filters.category} Products` : 'All Products'}
                    {searchQuery && ` - "${searchQuery}"`}
                  </h2>
                  <div className="text-sm text-gray-600">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                  </div>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-lg">
                    <p className="text-gray-500 text-lg mb-2">No products found</p>
                    <p className="text-sm text-gray-400 mb-4">
                      Try adjusting your search or filters
                    </p>
                    <Button variant="outline" onClick={handleResetFilters}>
                      Clear All Filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <MarketplacePageContent />
    </Suspense>
  );
}

