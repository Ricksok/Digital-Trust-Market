'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useProject, useAddToCart } from '@/lib/queries';
import { useAuthStore } from '@/lib/stores/auth.store';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const productId = params?.id as string;

  const { data, isLoading, error } = useProject(productId || '');
  const addToCart = useAddToCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [cartError, setCartError] = useState<string | null>(null);

  // Handle product data structure - could be data.data or just data
  const product = data?.data || data;

  useEffect(() => {
    if (!productId) return;
    if (productId === 'create') {
      router.push('/marketplace');
      return;
    }
  }, [productId, router]);

  // Debug: Log product data
  useEffect(() => {
    if (product) {
      console.log('Product data:', product);
      console.log('Product ID:', product.id);
      console.log('Product status:', product.status);
    }
  }, [product]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Handle images - can be array or JSON string
  const productImages: string[] = Array.isArray(product?.images)
    ? product.images
    : typeof product?.images === 'string'
    ? (() => {
        try {
          const parsed = JSON.parse(product.images);
          return Array.isArray(parsed) ? parsed : [product.images];
        } catch {
          return [product.images];
        }
      })()
    : [];


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Link href="/marketplace">
            <Button>Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <Link href="/marketplace" className="text-primary-600 hover:text-primary-700">
            Marketplace
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">{product.category}</span>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            {productImages.length > 0 ? (
              <>
                <div className="relative w-full h-96 mb-4 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={productImages[selectedImage]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {productImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {productImages.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden ${
                          selectedImage === index
                            ? 'border-primary-600'
                            : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-6xl text-primary-300">📦</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
              <div className="flex items-center gap-4 mb-4">
                {product.fundraiser?.trustBand && (
                  <Badge variant="success" size="md">
                    Trust Band: {product.fundraiser.trustBand}
                  </Badge>
                )}
                <span className="text-sm text-gray-500">
                  by {product.fundraiser?.firstName} {product.fundraiser?.lastName}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="border-t border-b border-gray-200 py-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  {formatCurrency(product.targetAmount || 0)}
                </span>
                <span className="text-sm text-gray-500">KES</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Price per unit • Free shipping on orders over KES 10,000
              </p>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Add to Cart Section - Prominent CTA */}
            {isAuthenticated && (product.status === 'ACTIVE' || product.status === 'APPROVED') ? (
              <Card className="border-2 border-primary-200 bg-primary-50">
                <CardContent className="p-6 space-y-4">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {formatCurrency(product.targetAmount || 0)}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">Price per unit</p>
                  </div>
                  
                  {/* Quantity Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      defaultValue="1"
                      id="quantity"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-lg font-semibold"
                    />
                  </div>

                  {/* Error Message */}
                  {cartError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                      {cartError}
                    </div>
                  )}

                  {/* Add to Cart Button - Large and Prominent */}
                  <Button
                    onClick={() => {
                      if (!product?.id) {
                        setCartError('Product ID is missing');
                        return;
                      }
                      setCartError(null);
                      const quantityInput = document.getElementById('quantity') as HTMLInputElement;
                      const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
                      
                      if (quantity < 1) {
                        setCartError('Quantity must be at least 1');
                        return;
                      }

                      addToCart.mutate(
                        { projectId: product.id, quantity },
                        {
                          onError: (error: any) => {
                            const errorMessage = error.response?.data?.error?.message || 
                                                error.response?.data?.message ||
                                                error.message || 
                                                'Failed to add item to cart';
                            setCartError(errorMessage);
                            console.error('Add to cart error:', error);
                          },
                          onSuccess: () => {
                            setCartError(null);
                          },
                        }
                      );
                    }}
                    variant="primary"
                    fullWidth
                    size="lg"
                    disabled={addToCart.isPending || !product?.id}
                    className="py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
                  >
                    {addToCart.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding to Cart...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Add to Cart
                      </span>
                    )}
                  </Button>

                  {/* Buy Now Option */}
                  <Button
                    onClick={() => {
                      if (!product?.id) {
                        setCartError('Product ID is missing');
                        return;
                      }
                      setCartError(null);
                      const quantityInput = document.getElementById('quantity') as HTMLInputElement;
                      const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
                      
                      if (quantity < 1) {
                        setCartError('Quantity must be at least 1');
                        return;
                      }

                      addToCart.mutate(
                        { projectId: product.id, quantity },
                        {
                          onSuccess: () => {
                            setCartError(null);
                            // Redirect to checkout after adding
                            router.push('/checkout');
                          },
                          onError: (error: any) => {
                            const errorMessage = error.response?.data?.error?.message || 
                                                error.response?.data?.message ||
                                                error.message || 
                                                'Failed to add item to cart';
                            setCartError(errorMessage);
                            console.error('Buy now error:', error);
                          },
                        }
                      );
                    }}
                    variant="outline"
                    fullWidth
                    size="lg"
                    disabled={addToCart.isPending || !product?.id}
                    className="py-3 text-base font-medium"
                  >
                    Buy Now
                  </Button>

                  <p className="text-xs text-center text-gray-500 mt-2">
                    Secure checkout • Free shipping on orders over KES 10,000
                  </p>
                </CardContent>
              </Card>
            ) : !isAuthenticated ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-600 mb-4">Sign in to add this item to your cart</p>
                  <Link href="/auth/login">
                    <Button variant="primary" fullWidth>
                      Sign In to Continue
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-600">This product is currently unavailable</p>
                </CardContent>
              </Card>
            )}

            {/* Trust Indicators */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trust & Safety</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Trust Band</span>
                  <Badge variant="success" size="sm">
                    {product.fundraiser?.trustBand || 'T0'}
                  </Badge>
                </div>
                {product.fundraiser?.trustScore && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Trust Score</span>
                    <span className="text-sm font-medium">
                      {product.fundraiser.trustScore.toFixed(1)}/100
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-200">
                  <Link href={`/trust?userId=${product.fundraiserId}`}>
                    <Button variant="outline" size="sm" fullWidth>
                      View Trust Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Category</span>
                <span className="font-medium">{product.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <Badge variant="outline" size="sm">
                  {product.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span className="font-medium">
                  {new Date(product.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vendor Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Vendor</span>
                <span className="font-medium">
                  {product.fundraiser?.firstName} {product.fundraiser?.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email</span>
                <span className="font-medium">{product.fundraiser?.email}</span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <Link href={`/vendor-central?userId=${product.fundraiserId}`}>
                  <Button variant="outline" size="sm" fullWidth>
                    View Vendor Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

